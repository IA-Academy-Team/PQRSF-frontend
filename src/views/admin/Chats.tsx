import { useEffect, useMemo, useRef, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { Search, Send, Paperclip, Smile, CheckCheck, MessageCircle, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { chatService, type ChatSummary } from "@/services/chat.service"
import type { Message } from "@/types/database"
import { API_BASE } from "@/lib/api"
import { io } from "socket.io-client"
import { notifyError, notifySuccess } from "@/lib/toast"

// Función para formatear fechas tipo WhatsApp
function formatWhatsAppDate(date: Date) {
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  } else if (diffDays === 1) {
    return "Ayer"
  } else if (diffDays < 7) {
    return date.toLocaleDateString("es-ES", { weekday: "long" })
  } else {
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }
}

const getInitials = (name: string) => {
  const parts = name.trim().split(" ").filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const normalizeChatSearch = (chat: ChatSummary, query: string) => {
  const name = chat.clientName?.toLowerCase() ?? ""
  const phone = chat.clientPhone ?? ""
  const lastMessage = chat.lastMessage?.toLowerCase() ?? ""
  return name.includes(query) || phone.includes(query) || lastMessage.includes(query)
}

export default function Chats() {
  const { isCollapsed } = useSidebar()
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState("")
  const [chats, setChats] = useState<ChatSummary[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [chatError, setChatError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [isUpdatingMode, setIsUpdatingMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  const getSocketBase = () => {
    try {
      const apiUrl = new URL(API_BASE)
      return `${apiUrl.protocol}//${apiUrl.host}`
    } catch {
      return "http://localhost:3000"
    }
  }

  useEffect(() => {
    let active = true

    const loadChats = async () => {
      setIsLoadingChats(true)
      setChatError(null)
      try {
        const data = await chatService.getSummaries()
        if (active) {
          setChats(data)
        }
      } catch (error) {
        console.error("[admin-chats] load error", error)
        if (active) {
          setChatError("No pudimos cargar los chats. Intenta nuevamente.")
        }
      } finally {
        if (active) {
          setIsLoadingChats(false)
        }
      }
    }

    loadChats()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const socket = io(getSocketBase(), {
      path: "/ws",
      query: { scope: "summary" },
    })

    socket.on("chat_summary", (summary: Partial<ChatSummary> & { chatId?: number }) => {
      const chatId = summary.chatId ?? summary.id
      if (!chatId) return
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: summary.lastMessage ?? chat.lastMessage,
                lastMessageAt: summary.lastMessageAt ?? chat.lastMessageAt,
                mode: summary.mode ?? chat.mode,
              }
            : chat
        )
      )
    })

    socket.on("chat_mode", (payload: { chatId: number; mode: number | null }) => {
      setChats((prev) => prev.map((chat) => (chat.id === payload.chatId ? { ...chat, mode: payload.mode } : chat)))
    })

    socket.on("connect_error", (error) => {
      console.error("[admin-chats] socket summary error", error)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!selectedChat) {
      setMessages([])
      setMessageError(null)
      return
    }

    let active = true
    const loadMessages = async () => {
      setIsLoadingMessages(true)
      setMessageError(null)
      try {
        const data = await chatService.getMessages(selectedChat)
        if (active) {
          setMessages(data)
        }
      } catch (error) {
        console.error("[admin-chats] messages error", error)
        if (active) {
          setMessageError("No pudimos cargar los mensajes de este chat.")
        }
      } finally {
        if (active) {
          setIsLoadingMessages(false)
        }
      }
    }

    loadMessages()

    return () => {
      active = false
    }
  }, [selectedChat])

  useEffect(() => {
    if (messages.length === 0) return
    scrollToBottom("auto")
  }, [messages, selectedChat])

  useEffect(() => {
    if (!selectedChat) return
    const socket = io(getSocketBase(), {
      path: "/ws",
      query: { chatId: String(selectedChat) },
    })

    socket.on("chat_message", (payload: { chatId: number; message: Message }) => {
      if (payload.chatId !== selectedChat) return
      const incoming = payload.message
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === incoming.id)) return prev
        return [...prev, incoming]
      })
    })

    socket.on("chat_mode", (payload: { chatId: number; mode: number | null }) => {
      if (payload.chatId !== selectedChat) return
      setChats((prev) => prev.map((chat) => (chat.id === selectedChat ? { ...chat, mode: payload.mode } : chat)))
    })

    socket.on("connect_error", (error) => {
      console.error("[admin-chats] socket chat error", error)
    })

    return () => {
      socket.disconnect()
    }
  }, [selectedChat])

  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return chats
    return chats.filter((chat) => normalizeChatSearch(chat, query))
  }, [chats, searchQuery])

  const currentChat = chats.find((chat) => chat.id === selectedChat)
  const currentMode = currentChat?.mode ?? 1
  const isAdminMode = currentMode === 2

  const handleToggleMode = async (checked: boolean) => {
    if (!currentChat) return
    const nextMode = checked ? 2 : 1
    setIsUpdatingMode(true)
    try {
      const updated = await chatService.update(currentChat.id, { mode: nextMode })
      const mode = updated.mode ?? currentChat.mode ?? 1
      setChats((prev) => prev.map((chat) => (chat.id === currentChat.id ? { ...chat, mode } : chat)))
      notifySuccess(checked ? "Modo Administrador activado." : "Modo IA activado.")
    } catch (error) {
      console.error("[admin-chats] mode update error", error)
      notifyError("No pudimos actualizar el modo del chat.")
    } finally {
      setIsUpdatingMode(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedChat || !message.trim()) return
    const content = message.trim()
    setMessage("")
    setMessageError(null)
    try {
      const created = await chatService.sendMessage({
        chatId: selectedChat,
        content,
        channel: "whatsapp",
      })
      setMessages((prev) => [...prev, created])
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat
            ? { ...chat, lastMessage: created.content ?? content, lastMessageAt: created.createdAt ?? null }
            : chat
        )
      )
      scrollToBottom("smooth")
    } catch (error) {
      console.error("[admin-chats] send error", error)
      setMessageError("No pudimos enviar el mensaje. Intenta nuevamente.")
      notifyError("No pudimos enviar el mensaje.")
      setMessage(content)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex h-screen transition-all duration-300",
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
        )}
      >
        {/* Lista de chats */}
        <div className="w-96 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold mb-4">Chats de WhatsApp</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingChats ? (
              <div className="p-4 text-sm text-muted-foreground">Cargando chats...</div>
            ) : chatError ? (
              <div className="p-4 text-sm text-destructive">{chatError}</div>
            ) : filteredChats.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No hay chats que coincidan.</div>
            ) : (
              filteredChats.map((chat) => {
                const chatName = chat.clientName ?? "Sin nombre"
                const chatPhone = chat.clientPhone ?? "Sin teléfono"
                const lastMessage = chat.lastMessage ?? "Sin mensajes aún"
                const lastMessageAt = chat.lastMessageAt ? new Date(chat.lastMessageAt) : null
                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full p-4 flex items-center gap-3 border-b border-border hover:bg-accent transition-colors ${
                      selectedChat === chat.id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {getInitials(chatName)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">{chatName}</h3>
                        <span className="text-xs text-muted-foreground">
                          {lastMessageAt ? formatWhatsAppDate(lastMessageAt) : ""}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{chatPhone}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Área de chat */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col bg-[#efeae2]">
            {/* Header del chat */}
            <div className="bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {currentChat ? getInitials(currentChat.clientName ?? "Sin nombre") : "?"}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{currentChat?.clientName ?? "Sin nombre"}</h3>
                  <p className="text-xs text-muted-foreground">{currentChat?.clientPhone ?? "Sin teléfono"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{isAdminMode ? "Administrador" : "IA"}</span>
                <Switch
                  checked={isAdminMode}
                  onCheckedChange={handleToggleMode}
                  disabled={isUpdatingMode}
                />
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="text-sm text-muted-foreground">Cargando mensajes...</div>
              ) : messageError ? (
                <div className="text-sm text-destructive">{messageError}</div>
              ) : messages.length === 0 ? (
                <div className="text-sm text-muted-foreground">Este chat no tiene mensajes.</div>
              ) : (
                messages.map((msg) => {
                  const sender = msg.type === 1 ? "user" : msg.type === 2 ? "bot" : "admin"
                  const isOutgoing = sender === "admin" || sender === "bot"
                  const createdAt = msg.createdAt ? new Date(msg.createdAt) : null
                  return (
                    <div key={msg.id} className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOutgoing
                            ? "bg-[#d9fdd3] rounded-tr-none"
                            : "bg-white rounded-tl-none shadow-sm"
                        }`}
                      >
                        <p className="text-sm text-foreground wrap-break-word">{msg.content ?? ""}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {sender === "bot" && <Bot className="h-3 w-3 text-muted-foreground" />}
                          {sender === "admin" && <User className="h-3 w-3 text-muted-foreground" />}
                          <span className="text-[10px] text-muted-foreground">
                            {createdAt ? createdAt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                          {sender === "user" && (
                            <span className="text-muted-foreground">
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="bg-card border-t border-border p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Escribe un mensaje..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && message.trim()) {
                      handleSendMessage()
                    }
                  }}
                  disabled={!isAdminMode}
                />
                <Button
                  size="icon"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSendMessage}
                  disabled={!isAdminMode}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              {!isAdminMode && (
                <p className="mt-2 text-xs text-muted-foreground">
                  El modo IA esta activo. Cambia a modo Administrador para responder manualmente.
                </p>
              )}
              {messageError && <p className="mt-2 text-xs text-destructive">{messageError}</p>}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#efeae2]">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Selecciona un chat</h3>
              <p className="text-muted-foreground">Elige una conversación para ver los mensajes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
