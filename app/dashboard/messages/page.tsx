"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Send, Search, Users, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface User {
  _id: string
  name: string
  email: string
  role: string
  image?: string
}

interface Message {
  _id: string
  content: string
  sender: User
  chatId: string
  createdAt: string
}

interface Chat {
  _id: string
  type: "direct" | "group"
  name?: string
  participants: User[]
  lastMessage?: {
    content: string
    sender: User
    createdAt: string
  }
  createdAt: string
  updatedAt: string
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [chatToLeave, setChatToLeave] = useState<Chat | null>(null)

  useEffect(() => {
    fetchChats()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id)
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats")
      if (!response.ok) throw new Error("Failed to fetch chats")
      const data = await response.json()
      setChats(data)
    } catch (error) {
      toast.error("Failed to load chats")
      console.error(error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setAvailableUsers(data)
    } catch (error) {
      toast.error("Failed to load users")
      console.error(error)
    }
  }

  // Add debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchUsers()
      } else {
        setAvailableUsers([])
      }
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`)
      if (!response.ok) throw new Error("Failed to fetch messages")
      const data = await response.json()
      setMessages(data.reverse())
    } catch (error) {
      toast.error("Failed to load messages")
      console.error(error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          chatId: selectedChat._id
        })
      })

      if (!response.ok) throw new Error("Failed to send message")
      
      const message = await response.json()
      setMessages([...messages, message])
      setNewMessage("")
      
      // Update chat list with new last message
      setChats(chats.map(chat => 
        chat._id === selectedChat._id 
          ? { ...chat, lastMessage: message }
          : chat
      ))
    } catch (error) {
      toast.error("Failed to send message")
      console.error(error)
    }
  }

  const createNewChat = async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedParticipants.length > 1 ? "group" : "direct",
          name: selectedParticipants.length > 1 ? `${selectedParticipants.length} Participants` : undefined,
          participantEmails: selectedParticipants
        })
      })

      if (!response.ok) throw new Error("Failed to create chat")
      
      const chat = await response.json()
      setChats([chat, ...chats])
      setSelectedChat(chat)
      setIsNewChatOpen(false)
      setSelectedParticipants([])
      setSearchQuery("")
    } catch (error) {
      toast.error("Failed to create chat")
      console.error(error)
    }
  }

  const leaveChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/leave`, {
        method: "POST"
      })

      if (!response.ok) throw new Error("Failed to leave chat")
      
      // Remove chat from list and clear selection
      setChats(chats.filter(chat => chat._id !== chatId))
      setSelectedChat(null)
      setMessages([])
      
      toast.success("Left chat successfully")
    } catch (error) {
      toast.error("Failed to leave chat")
      console.error(error)
    }
  }

  const handleLeaveClick = (chat: Chat) => {
    setChatToLeave(chat)
    setIsLeaveDialogOpen(true)
  }

  const confirmLeave = async () => {
    if (!chatToLeave) return
    await leaveChat(chatToLeave._id)
    setIsLeaveDialogOpen(false)
    setChatToLeave(null)
  }

  const filteredUsers = availableUsers.filter(user => 
    user.email !== session?.user?.email &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Chat List */}
        <Card className="col-span-4 h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Messages</CardTitle>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a New Chat</DialogTitle>
                  <DialogDescription>
                    Search and select users to chat with
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <ScrollArea className="h-[300px]">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center space-x-2 p-2 hover:bg-muted rounded-lg cursor-pointer"
                        onClick={() => {
                          setSelectedParticipants(prev =>
                            prev.includes(user.email)
                              ? prev.filter(email => email !== user.email)
                              : [...prev, user.email]
                          )
                        }}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        {selectedParticipants.includes(user.email) && (
                          <Badge variant="secondary">Selected</Badge>
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={createNewChat} 
                    disabled={!selectedParticipants.length}
                  >
                    Start Chat
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-muted ${
                    selectedChat?._id === chat._id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <Avatar className="h-10 w-10">
                    {chat.type === "direct" ? (
                      <>
                        <AvatarImage
                          src={chat.participants.find(p => p.email !== session?.user?.email)?.image}
                          alt={chat.participants.find(p => p.email !== session?.user?.email)?.name}
                        />
                        <AvatarFallback>
                          {chat.participants.find(p => p.email !== session?.user?.email)?.name[0]}
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="/group-avatar.png" alt={chat.name} />
                        <AvatarFallback>
                          <Users className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {chat.type === "direct"
                        ? chat.participants.find(p => p.email !== session?.user?.email)?.name
                        : chat.name}
                    </p>
                    {chat.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {chat.lastMessage.sender.email === session?.user?.email
                          ? "You: "
                          : `${chat.lastMessage.sender.name}: `}
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-8 h-full">
          {selectedChat ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      {selectedChat.type === "direct" ? (
                        <>
                          <AvatarImage
                            src={selectedChat.participants.find(p => p.email !== session?.user?.email)?.image}
                            alt={selectedChat.participants.find(p => p.email !== session?.user?.email)?.name}
                          />
                          <AvatarFallback>
                            {selectedChat.participants.find(p => p.email !== session?.user?.email)?.name[0]}
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/group-avatar.png" alt={selectedChat.name} />
                          <AvatarFallback>
                            <Users className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {selectedChat.type === "direct"
                          ? selectedChat.participants.find(p => p.email !== session?.user?.email)?.name
                          : selectedChat.name}
                      </CardTitle>
                      {selectedChat.type === "group" && (
                        <p className="text-sm text-muted-foreground">
                          {selectedChat.participants.length} participants
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLeaveClick(selectedChat)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {selectedChat.type === "direct" ? "Delete Chat" : "Leave Group"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-16rem)] p-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender.email === session?.user?.email
                          ? "justify-end"
                          : "justify-start"
                      } mb-4`}
                    >
                      <div
                        className={`flex items-end space-x-2 ${
                          message.sender.email === session?.user?.email
                            ? "flex-row-reverse space-x-reverse"
                            : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender.image} alt={message.sender.name} />
                          <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[70%] ${
                            message.sender.email === session?.user?.email
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">Select a chat to start messaging</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {chatToLeave?.type === "direct" ? "Delete Chat" : "Leave Group"}
            </DialogTitle>
            <DialogDescription>
              {chatToLeave?.type === "direct"
                ? "Are you sure you want to delete this chat? This action cannot be undone."
                : "Are you sure you want to leave this group? You can rejoin if you're invited back."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsLeaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmLeave}
            >
              {chatToLeave?.type === "direct" ? "Delete" : "Leave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}