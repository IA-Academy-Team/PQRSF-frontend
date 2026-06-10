import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { Search, Send, Paperclip, Smile, CheckCheck, MessageCircle, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { chatService, type ChatSummary, type ChatPqrsSummary } from "@/services/chat.service"
import type { Message } from "@/types/database"
import { API_BASE } from "@/lib/api"
import { io } from "socket.io-client"
import { notifyError, notifySuccess } from "@/lib/toast"

// Función para formatear fechas del chat
const parseChatDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const raw = String(value).trim()
  if (!raw) return null
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const chatTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Bogota",
})

function formatChatDate(date: Date) {
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return chatTimeFormatter.format(date)
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

type ChatListItem = ChatSummary & Partial<ChatPqrsSummary>

const chatToastOptions = { position: "top-left" as const }

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "").trim()
    if (message) return message
  }
  return fallback
}

const normalizeChatSearch = (chat: ChatListItem, query: string) => {
  const name = chat.clientName?.toLowerCase() ?? ""
  const phone = chat.clientPhone ?? ""
  const lastMessage = chat.lastMessage?.toLowerCase() ?? ""
  const ticket = chat.ticketNumber?.toLowerCase() ?? ""
  return name.includes(query) || phone.includes(query) || lastMessage.includes(query) || ticket.includes(query)
}

const isMessageWithinPqrsWindow = (chat: ChatListItem | undefined, createdAt: Date) => {
  if (!chat?.pqrsCreatedAt) return true
  const start = parseChatDate(chat.pqrsCreatedAt)
  if (!start) return true
  if (createdAt < start) return false
  if (chat.pqrsEndAt) {
    const end = parseChatDate(chat.pqrsEndAt)
    if (end && createdAt >= end) return false
  }
  return true
}

const sortChatsByLastMessage = (items: ChatListItem[]) =>
  [...items].sort((a, b) => {
    const aTime = parseChatDate(a.lastMessageAt)?.getTime() ?? 0
    const bTime = parseChatDate(b.lastMessageAt)?.getTime() ?? 0
    if (aTime !== bTime) return bTime - aTime
    return Number(b.id) - Number(a.id)
  })

export default function Chats() {
  const { isCollapsed } = useSidebar()
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null)
  const [selectedPqrsId, setSelectedPqrsId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [chatView, setChatView] = useState<"persona" | "pqrs">("persona")
  const [chats, setChats] = useState<ChatListItem[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [chatError, setChatError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [isUpdatingMode, setIsUpdatingMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const chatsRef = useRef<ChatListItem[]>([])

  const emojiList = ["😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😎", "😅", "😇", "🤔", "😢", "😡", "👍", "🙏", "👏", "🎉", "💬", "✅", "❤️"]

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

  const loadChats = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoadingChats(true)
    setChatError(null)
    try {
      const data =
        chatView === "pqrs"
          ? await chatService.getSummariesByPqrs()
          : await chatService.getSummaries()
      setChats(sortChatsByLastMessage(data))
    } catch (error) {
      console.error("[admin-chats] load error", error)
      setChatError("No pudimos cargar los chats. Intenta nuevamente.")
    } finally {
      if (showLoading) setIsLoadingChats(false)
    }
  }, [chatView])

  useEffect(() => {
    chatsRef.current = chats
  }, [chats])

  useEffect(() => {
    let active = true

    const syncInitialChats = async () => {
      if (!active) return
      await loadChats(true)
    }

    syncInitialChats()

    return () => {
      active = false
    }
  }, [loadChats])

  useEffect(() => {
    if (!selectedChatId) return
    const stillExists = chats.some(
      (chat) => chat.id === selectedChatId && (chatView !== "pqrs" || chat.pqrsId === selectedPqrsId)
    )
    if (!stillExists) {
      setSelectedChatId(null)
      setSelectedPqrsId(null)
      setMessages([])
    }
  }, [chats, selectedChatId, selectedPqrsId, chatView])

  const applySummaryUpdate = useCallback((summary: Partial<ChatSummary> & { chatId?: number }) => {
    const chatId = summary.chatId ?? summary.id
    if (!chatId) return

    const knownChat = chatsRef.current.some((chat) => chat.id === chatId)
    if (!knownChat) {
      void loadChats(false)
      return
    }

    setChats((prev) => {
      let changed = false
      const next = prev.map((chat) => {
        if (chat.id !== chatId) return chat
        changed = true
        const lastMessageAt = summary.lastMessageAt ?? chat.lastMessageAt
        if (chatView === "pqrs" && lastMessageAt) {
          const lastDate = parseChatDate(lastMessageAt)
          if (lastDate && !isMessageWithinPqrsWindow(chat, lastDate)) {
            return { ...chat, mode: summary.mode ?? chat.mode }
          }
        }
        return {
          ...chat,
          lastMessage: summary.lastMessage ?? chat.lastMessage,
          lastMessageAt,
          mode: summary.mode ?? chat.mode,
        }
      })
      if (!changed) {
        void loadChats(false)
        return prev
      }
      return sortChatsByLastMessage(next)
    })
  }, [chatView, loadChats])

  useEffect(() => {
    setSelectedChatId(null)
    setSelectedPqrsId(null)
    setMessages([])
  }, [chatView])

  useEffect(() => {
    const socket = io(getSocketBase(), {
      path: "/ws",
      query: { scope: "summary" },
    })

    socket.on("chat_summary", applySummaryUpdate)

    socket.on("chat_mode", (payload: { chatId: number; mode: number | null }) => {
      const knownChat = chatsRef.current.some((chat) => chat.id === payload.chatId)
      if (!knownChat) {
        void loadChats(false)
        return
      }
      setChats((prev) => prev.map((chat) => (chat.id === payload.chatId ? { ...chat, mode: payload.mode } : chat)))
    })

    socket.on("connect_error", (error) => {
      console.error("[admin-chats] socket summary error", error)
    })

    return () => {
      socket.disconnect()
    }
  }, [applySummaryUpdate, loadChats])

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([])
      setMessageError(null)
      return
    }

    let active = true
    const loadMessages = async () => {
      setIsLoadingMessages(true)
      setMessageError(null)
      try {
        const pqrsId = chatView === "pqrs" ? selectedPqrsId ?? undefined : undefined
        const data = await chatService.getMessages(selectedChatId, pqrsId)
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
  }, [selectedChatId, selectedPqrsId, chatView])

  useEffect(() => {
    if (messages.length === 0) return
    scrollToBottom("auto")
  }, [messages, selectedChatId])

  const currentChat = useMemo(
    () =>
      chats.find(
        (chat) => chat.id === selectedChatId && (chatView !== "pqrs" || chat.pqrsId === selectedPqrsId)
      ),
    [chats, selectedChatId, selectedPqrsId, chatView]
  )

  useEffect(() => {
    if (!selectedChatId) return
    const socket = io(getSocketBase(), {
      path: "/ws",
      query: { chatId: String(selectedChatId) },
    })

    socket.on("chat_message", (payload: { chatId: number; message: Message }) => {
      if (payload.chatId !== selectedChatId) return
      const incoming = payload.message
      if (chatView === "pqrs" && incoming.createdAt) {
        const incomingDate = new Date(incoming.createdAt)
        if (!Number.isNaN(incomingDate.getTime()) && !isMessageWithinPqrsWindow(currentChat, incomingDate)) {
          return
        }
      }
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === incoming.id)) return prev
        return [...prev, incoming]
      })
    })

    socket.on("chat_mode", (payload: { chatId: number; mode: number | null }) => {
      if (payload.chatId !== selectedChatId) return
      setChats((prev) => prev.map((chat) => (chat.id === selectedChatId ? { ...chat, mode: payload.mode } : chat)))
    })

    socket.on("connect_error", (error) => {
      console.error("[admin-chats] socket chat error", error)
    })

    return () => {
      socket.disconnect()
    }
  }, [selectedChatId, chatView, currentChat?.pqrsCreatedAt, currentChat?.pqrsEndAt])

  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return chats
    return chats.filter((chat) => normalizeChatSearch(chat, query))
  }, [chats, searchQuery])
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
      notifySuccess(checked ? "Modo Administrador activado." : "Modo IA activado.", chatToastOptions)
    } catch (error) {
      console.error("[admin-chats] mode update error", error)
      notifyError(getErrorMessage(error, "No pudimos actualizar el modo del chat."), chatToastOptions)
    } finally {
      setIsUpdatingMode(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedChatId || !message.trim()) return
    const content = message.trim()
    const optimisticId = -Date.now()
    const optimisticCreatedAt = new Date().toISOString()
    const optimisticMessage: Message = {
      id: optimisticId,
      content,
      type: 3,
      createdAt: optimisticCreatedAt,
      chatId: selectedChatId,
    }

    setMessage("")
    setMessageError(null)
    setMessages((prev) => [...prev, optimisticMessage])
    setChats((prev) =>
      sortChatsByLastMessage(
        prev.map((chat) =>
          chat.id === selectedChatId
            ? { ...chat, lastMessage: content, lastMessageAt: optimisticCreatedAt }
            : chat
        )
      )
    )
    scrollToBottom("smooth")

    try {
      const created = await chatService.sendMessage({
        chatId: selectedChatId,
        content,
        channel: "telegram",
      })
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === created.id)) {
          return prev.filter((msg) => msg.id !== optimisticId)
        }
        return prev.map((msg) => (msg.id === optimisticId ? created : msg))
      })
      setChats((prev) =>
        sortChatsByLastMessage(
          prev.map((chat) =>
            chat.id === selectedChatId
              ? { ...chat, lastMessage: created.content ?? content, lastMessageAt: created.createdAt ?? null }
              : chat
          )
        )
      )
      scrollToBottom("smooth")
    } catch (error) {
      console.error("[admin-chats] send error", error)
      const errorMessage = getErrorMessage(error, "No pudimos enviar el mensaje. Intenta nuevamente.")
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      setMessageError(errorMessage)
      notifyError(errorMessage, chatToastOptions)
      setMessage(content)
    }
  }

  const handleSendFile = async (file: File) => {
    if (!selectedChatId) return
    setMessageError(null)
    try {
      const created = await chatService.sendFile({
        chatId: selectedChatId,
        file,
        channel: "telegram",
      })
      setMessages((prev) => (prev.some((msg) => msg.id === created.id) ? prev : [...prev, created]))
      setChats((prev) =>
        sortChatsByLastMessage(
          prev.map((chat) =>
            chat.id === selectedChatId
              ? { ...chat, lastMessage: created.content ?? file.name, lastMessageAt: created.createdAt ?? null }
              : chat
          )
        )
      )
      scrollToBottom("smooth")
    } catch (error) {
      console.error("[admin-chats] send file error", error)
      const errorMessage = getErrorMessage(error, "No pudimos enviar el archivo. Intenta nuevamente.")
      setMessageError(errorMessage)
      notifyError(errorMessage, chatToastOptions)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex min-h-0 overflow-hidden pt-14 md:pt-0 transition-all duration-300",
          isCollapsed ? "lg:ml-24" : "lg:ml-64"
        )}
      >
        {/* Lista de chats */}
        <div className="w-96 border-r border-border bg-card flex flex-col min-h-0 shrink-0">
          <div className="p-4 min-[1600px]:p-5 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-4 min-[1600px]:mb-5">
              <h2 className="text-xl min-[1600px]:text-2xl font-bold">Chats</h2>
              <div className="flex items-center gap-2 text-xs min-[1600px]:text-sm">
                <Button
                  variant={chatView === "persona" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChatView("persona")}
                >
                  Por persona
                </Button>
                <Button
                  variant={chatView === "pqrs" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChatView("pqrs")}
                >
                  Por PQRS
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={chatView === "pqrs" ? "Buscar por radicado o cliente..." : "Buscar chats..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {isLoadingChats ? (
              <div className="p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-muted-foreground">Cargando chats...</div>
            ) : chatError ? (
              <div className="p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-destructive">{chatError}</div>
            ) : filteredChats.length === 0 ? (
              <div className="p-4 min-[1600px]:p-5 text-sm min-[1600px]:text-base text-muted-foreground">No hay chats que coincidan.</div>
            ) : (
              filteredChats.map((chat) => {
                const lastMessageText = (chat.lastMessage ?? "").toLowerCase()
                const isAnonymousByText =
                  lastMessageText.includes("anonim") ||
                  lastMessageText.includes("anónimo") ||
                  lastMessageText.includes("anonimo")
                const isAnonymousByIdentity = !chat.clientName && !chat.clientPhone
                const isAnonymous = isAnonymousByText || isAnonymousByIdentity
                const chatName = isAnonymous ? "Anónimo" : chat.clientName ?? "Sin nombre"
                const chatPhone = chat.clientPhone ?? "Sin teléfono"
                const lastMessage = chat.lastMessage ?? "Sin mensajes aún"
                const lastMessageAt = parseChatDate(chat.lastMessageAt)
                const ticketLabel = chatView === "pqrs" ? chat.ticketNumber ?? "PQRS" : null
                const channelLabel = "Telegram"
                const isSelected =
                  chatView === "pqrs"
                    ? selectedChatId === chat.id && selectedPqrsId === chat.pqrsId
                    : selectedChatId === chat.id
                return (
                  <button
                    key={`${chat.id}-${chat.pqrsId ?? "chat"}`}
                    onClick={() => {
                      setSelectedChatId(chat.id)
                      setSelectedPqrsId(chatView === "pqrs" ? chat.pqrsId ?? null : null)
                    }}
                    className={`w-full p-4 flex items-center gap-3 border-b border-border hover:bg-accent transition-colors ${
                      isSelected ? "bg-accent" : ""
                    }`}
                  >
                    <div className="h-12 w-12 min-[1600px]:h-14 min-[1600px]:w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold min-[1600px]:text-base">
                      {getInitials(chatName)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate min-[1600px]:text-base">
                          {chatName}
                          {ticketLabel && <span className="ml-2 text-xs min-[1600px]:text-sm text-muted-foreground">{ticketLabel}</span>}
                        </h3>
                        <span className="text-xs min-[1600px]:text-sm text-muted-foreground">
                          {lastMessageAt ? formatChatDate(lastMessageAt) : ""}
                        </span>
                      </div>
                      <p className="text-sm min-[1600px]:text-base text-muted-foreground truncate">{lastMessage}</p>
                      <p className="text-xs min-[1600px]:text-sm text-muted-foreground mt-0.5">
                        {chatPhone} • {channelLabel}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Área de chat */}
        {selectedChatId ? (
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
                  {chatView === "pqrs" && currentChat?.ticketNumber && (
                    <p className="text-xs text-muted-foreground">PQRS: {currentChat.ticketNumber}</p>
                  )}
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
            <div className="flex-1 overflow-y-auto p-4 min-[1600px]:p-6 space-y-4 min-[1600px]:space-y-5">
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
                  const createdAt = parseChatDate(msg.createdAt)
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
                            {createdAt ? chatTimeFormatter.format(createdAt) : ""}
                          </span>
                          {isOutgoing && (
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
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    disabled={!isAdminMode}
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-50 w-64 rounded-lg border border-border bg-card p-3 shadow-lg">
                      <div className="grid grid-cols-8 gap-2 text-lg">
                        {emojiList.map((emoji) => (
                          <button
                            key={emoji}
                            className="hover:bg-accent rounded"
                            onClick={() => {
                              setMessage((prev) => `${prev}${emoji}`)
                              setShowEmojiPicker(false)
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isAdminMode}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      handleSendFile(file)
                      event.target.value = ""
                    }
                  }}
                />
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
