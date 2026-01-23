import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, CheckCheck, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

const chatsData = [
  {
    id: 1,
    name: "Juan Pérez",
    phone: "+57 312 456 7890",
    lastMessage: "Necesito información sobre mi solicitud",
    time: new Date(2024, 0, 7, 14, 30),
    unread: 2,
    avatar: "/images/image.png",
    messages: [
      {
        id: 1,
        text: "Hola, buenos días",
        sender: "user",
        time: new Date(2024, 0, 7, 14, 20),
        status: "read",
      },
      {
        id: 2,
        text: "Hola Juan, bienvenido. ¿En qué puedo ayudarte hoy?",
        sender: "bot",
        time: new Date(2024, 0, 7, 14, 21),
      },
      {
        id: 3,
        text: "Necesito información sobre mi solicitud de PQRSF #12345",
        sender: "user",
        time: new Date(2024, 0, 7, 14, 25),
        status: "read",
      },
      {
        id: 4,
        text: "Claro, déjame revisar tu solicitud. Tu PQRSF #12345 está en estado 'Pendiente de Revisión' y será procesada en las próximas 24 horas.",
        sender: "bot",
        time: new Date(2024, 0, 7, 14, 26),
      },
      {
        id: 5,
        text: "Necesito información sobre mi solicitud",
        sender: "user",
        time: new Date(2024, 0, 7, 14, 30),
        status: "delivered",
      },
    ],
  },
  {
    id: 2,
    name: "María García",
    phone: "+57 300 123 4567",
    lastMessage: "Gracias por la información",
    time: new Date(2024, 0, 6, 16, 45),
    unread: 0,
    avatar: null,
    initials: "MG",
    messages: [
      {
        id: 1,
        text: "Hola, quiero hacer una petición",
        sender: "user",
        time: new Date(2024, 0, 6, 16, 30),
        status: "read",
      },
      {
        id: 2,
        text: "Con gusto te ayudo. ¿Qué tipo de petición deseas realizar?",
        sender: "bot",
        time: new Date(2024, 0, 6, 16, 31),
      },
      {
        id: 3,
        text: "Gracias por la información",
        sender: "user",
        time: new Date(2024, 0, 6, 16, 45),
        status: "read",
      },
    ],
  },
  {
    id: 3,
    name: "Carlos Rodríguez",
    phone: "+57 315 789 0123",
    lastMessage: "¿Cuánto tiempo toma el proceso?",
    time: new Date(2024, 0, 5, 10, 15),
    unread: 0,
    avatar: null,
    initials: "CR",
    messages: [
      {
        id: 1,
        text: "Buenos días",
        sender: "user",
        time: new Date(2024, 0, 5, 10, 10),
        status: "read",
      },
      {
        id: 2,
        text: "Buenos días Carlos, ¿en qué puedo asistirte?",
        sender: "bot",
        time: new Date(2024, 0, 5, 10, 11),
      },
      {
        id: 3,
        text: "¿Cuánto tiempo toma el proceso?",
        sender: "user",
        time: new Date(2024, 0, 5, 10, 15),
        status: "read",
      },
    ],
  },
  {
    id: 4,
    name: "Ana Martínez",
    phone: "+57 318 654 3210",
    lastMessage: "Perfecto, entendido",
    time: new Date(2024, 0, 4, 9, 30),
    unread: 0,
    avatar: null,
    initials: "AM",
    messages: [
      {
        id: 1,
        text: "Hola, tengo una queja",
        sender: "user",
        time: new Date(2024, 0, 4, 9, 20),
        status: "read",
      },
      {
        id: 2,
        text: "Lamento escuchar eso. Por favor cuéntame más detalles para poder ayudarte.",
        sender: "bot",
        time: new Date(2024, 0, 4, 9, 21),
      },
      {
        id: 3,
        text: "Perfecto, entendido",
        sender: "user",
        time: new Date(2024, 0, 4, 9, 30),
        status: "read",
      },
    ],
  },
]

export default function Chats() {
  const { isCollapsed } = useSidebar()
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState("")

  const filteredChats = chatsData.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.phone.includes(searchQuery) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const currentChat = chatsData.find((chat) => chat.id === selectedChat)

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
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full p-4 flex items-center gap-3 border-b border-border hover:bg-accent transition-colors ${
                  selectedChat === chat.id ? "bg-accent" : ""
                }`}
              >
                {chat.avatar ? (
                  <img src={chat.avatar || "/placeholder.svg"} alt={chat.name} className="h-12 w-12 rounded-full" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {chat.initials}
                  </div>
                )}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground">{formatWhatsAppDate(chat.time)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{chat.phone}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Área de chat */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col bg-[#efeae2]">
            {/* Header del chat */}
            <div className="bg-card border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentChat?.avatar ? (
                  <img
                    src={currentChat.avatar || "/placeholder.svg"}
                    alt={currentChat.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {currentChat?.initials}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{currentChat?.name}</h3>
                  <p className="text-xs text-muted-foreground">{currentChat?.phone}</p>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentChat?.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.sender === "user" ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white rounded-tl-none shadow-sm"
                    }`}
                  >
                    <p className="text-sm text-foreground break-words">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {msg.time.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.sender === "user" && (
                        <span className="text-muted-foreground">
                          {msg.status === "read" ? (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                          ) : (
                            <CheckCheck className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
                      console.log("[v0] Sending message:", message)
                      setMessage("")
                    }
                  }}
                />
                <Button size="icon" className="bg-green-600 hover:bg-green-700">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
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
