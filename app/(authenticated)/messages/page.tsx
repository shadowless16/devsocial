"use client"

export default function MessagesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Messages</h1>
        <p className="text-gray-600">Message functionality coming soon!</p>
      </div>
    </div>
  )
}

// interface Message {
//   _id: string
//   sender: {
//     _id: string
//     username: string
//     displayName: string
//     avatar: string
//   }
//   recipient: {
//     _id: string
//     username: string
//     displayName: string
//     avatar: string
//   }
//   content: string
//   messageType: "text" | "image" | "file"
//   fileUrl?: string
//   fileName?: string
//   reactions: Array<{
//     user: {
//       _id: string
//       username: string
//       displayName: string
//       avatar: string
//     }
//     emoji: string
//     createdAt: string
//   }>
//   readBy: Array<{
//     user: string
//     readAt: string
//   }>
//   replyTo?: {
//     _id: string
//     content: string
//     sender: {
//       username: string
//       displayName: string
//     }
//   }
//   createdAt: string
// }

// interface Conversation {
//   _id: string
//   participants: Array<{
//     _id: string
//     username: string
//     displayName: string
//     avatar: string
//     isOnline: boolean
//   }>
//   lastMessage: {
//     content: string
//     createdAt: string
//     sender: {
//       username: string
//       displayName: string
//     }
//   }
//   unreadCount: number
//   otherParticipant: {
//     _id: string
//     username: string
//     displayName: string
//     avatar: string
//     isOnline: boolean
//   }
//   lastActivity: string
// }

// export default function MessagesPage() {
//   const [conversations, setConversations] = useState<Conversation[]>([])
//   const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
//   const [messages, setMessages] = useState<Message[]>([])
//   const [newMessage, setNewMessage] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [sendingMessage, setSendingMessage] = useState(false)
//   const [typingUsers, setTypingUsers] = useState<string[]>([])
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const typingTimeoutRef = useRef<NodeJS.Timeout>()

//   const { socket, isConnected, joinConversation, leaveConversation } = useWebSocket()
//   const { user } = useAuth()

//   useEffect(() => {
//     fetchConversations()
//   }, [])

//   useEffect(() => {
//     if (selectedConversation) {
//       fetchMessages(selectedConversation)
//       joinConversation(selectedConversation)
//     }

//     return () => {
//       if (selectedConversation) {
//         leaveConversation(selectedConversation)
//       }
//     }
//   }, [selectedConversation])

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   useEffect(() => {
//     if (socket) {
//       socket.on("new_message", handleNewMessage)
//       socket.on("message_reaction", handleMessageReaction)
//       socket.on("message_read", handleMessageRead)
//       socket.on("user_typing", handleUserTyping)

//       return () => {
//         socket.off("new_message")
//         socket.off("message_reaction")
//         socket.off("message_read")
//         socket.off("user_typing")
//       }
//     }
//   }, [socket, selectedConversation])

//   const fetchConversations = async () => {
//     try {
//       const response = await apiClient.getConversations()
//       if (response.success) {
//         setConversations(response.data.conversations)
//       }
//     } catch (error) {
//       console.error("Error fetching conversations:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchMessages = async (conversationId: string) => {
//     try {
//       const response = await apiClient.getMessages(conversationId)
//       if (response.success) {
//         setMessages(response.data.messages)
//       }
//     } catch (error) {
//       console.error("Error fetching messages:", error)
//     }
//   }

//   const handleNewMessage = (data: { message: Message; conversationId: string }) => {
//     if (data.conversationId === selectedConversation) {
//       setMessages((prev) => [...prev, data.message])
//     }

//     // Update conversation list
//     setConversations((prev) =>
//       prev.map((conv) =>
//         conv._id === data.conversationId
//           ? {
//               ...conv,
//               lastMessage: {
//                 content: data.message.content,
//                 createdAt: data.message.createdAt,
//                 sender: data.message.sender,
//               },
//               unreadCount: data.message.sender._id === user?.id ? 0 : conv.unreadCount + 1,
//             }
//           : conv,
//       ),
//     )
//   }

//   const handleMessageReaction = (data: { messageId: string; reactions: any[] }) => {
//     setMessages((prev) => prev.map((msg) => (msg._id === data.messageId ? { ...msg, reactions: data.reactions } : msg)))
//   }

//   const handleMessageRead = (data: { messageId: string; readBy: string; readAt: string }) => {
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg._id === data.messageId
//           ? {
//               ...msg,
//               readBy: [...msg.readBy, { user: data.readBy, readAt: data.readAt }],
//             }
//           : msg,
//       ),
//     )
//   }

//   const handleUserTyping = (data: { userId: string; username: string; isTyping: boolean }) => {
//     if (data.userId !== user?.id) {
//       setTypingUsers((prev) =>
//         data.isTyping
//           ? [...prev.filter((id) => id !== data.userId), data.userId]
//           : prev.filter((id) => id !== data.userId),
//       )
//     }
//   }

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !selectedConversation || sendingMessage) return

//     setSendingMessage(true)
//     try {
//       const response = await apiClient.sendMessage(selectedConversation, {
//         content: newMessage.trim(),
//       })

//       if (response.success) {
//         setNewMessage("")
//         // Message will be added via WebSocket event
//       }
//     } catch (error) {
//       console.error("Error sending message:", error)
//     } finally {
//       setSendingMessage(false)
//     }
//   }

//   const handleTyping = () => {
//     if (socket && selectedConversation) {
//       socket.emit("typing_start", { conversationId: selectedConversation })

//       // Clear existing timeout
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current)
//       }

//       // Set new timeout to stop typing indicator
//       typingTimeoutRef.current = setTimeout(() => {
//         socket.emit("typing_stop", { conversationId: selectedConversation })
//       }, 1000)
//     }
//   }

//   const addReaction = async (messageId: string, emoji: string) => {
//     try {
//       await apiClient.addMessageReaction(messageId, emoji)
//       // Reaction will be updated via WebSocket event
//     } catch (error) {
//       console.error("Error adding reaction:", error)
//     }
//   }

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   const formatTime = (dateString: string) => {
//     return new Date(dateString).toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//   }

//   const selectedConv = conversations.find((conv) => conv._id === selectedConversation)

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="h-screen flex bg-gray-50">
//       {/* Conversations Sidebar */}
//       <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
//         <div className="p-4 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <Input placeholder="Search conversations..." className="pl-10" />
//           </div>
//         </div>

//         <ScrollArea className="flex-1">
//           <div className="p-2">
//             {conversations.map((conversation) => (
//               <div
//                 key={conversation._id}
//                 onClick={() => setSelectedConversation(conversation._id)}
//                 className={`p-3 rounded-lg cursor-pointer transition-colors ${
//                   selectedConversation === conversation._id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
//                 }`}
//               >
//                 <div className="flex items-center space-x-3">
//                   <div className="relative">
//                     <Avatar className="w-12 h-12">
//                       <AvatarImage src={conversation.otherParticipant.avatar || "/placeholder.svg"} />
//                       <AvatarFallback>
//                         {conversation.otherParticipant.displayName
//                           .split(" ")
//                           .map((n) => n[0])
//                           .join("")}
//                       </AvatarFallback>
//                     </Avatar>
//                     {conversation.otherParticipant.isOnline && (
//                       <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
//                     )}
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center justify-between">
//                       <h3 className="font-semibold text-gray-900 truncate">
//                         {conversation.otherParticipant.displayName}
//                       </h3>
//                       <span className="text-xs text-gray-500">{formatTime(conversation.lastMessage.createdAt)}</span>
//                     </div>
//                     <p className="text-sm text-gray-600 truncate">
//                       {conversation.lastMessage.sender.username === user?.username ? "You: " : ""}
//                       {conversation.lastMessage.content}
//                     </p>
//                   </div>

//                   {conversation.unreadCount > 0 && (
//                     <Badge className="bg-blue-600 text-white">{conversation.unreadCount}</Badge>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </ScrollArea>
//       </div>

//       {/* Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {selectedConv ? (
//           <>
//             {/* Chat Header */}
//             <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <Avatar className="w-10 h-10">
//                   <AvatarImage src={selectedConv.otherParticipant.avatar || "/placeholder.svg"} />
//                   <AvatarFallback>
//                     {selectedConv.otherParticipant.displayName
//                       .split(" ")
//                       .map((n) => n[0])
//                       .join("")}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <h3 className="font-semibold text-gray-900">{selectedConv.otherParticipant.displayName}</h3>
//                   <p className="text-sm text-gray-600">
//                     {selectedConv.otherParticipant.isOnline ? "Online" : "Offline"}
//                   </p>
//                 </div>
//               </div>
//               <Button variant="ghost" size="sm">
//                 <MoreVertical className="w-4 h-4" />
//               </Button>
//             </div>

//             {/* Messages */}
//             <ScrollArea className="flex-1 p-4">
//               <div className="space-y-4">
//                 {messages.map((message) => (
//                   <div
//                     key={message._id}
//                     className={`flex ${message.sender._id === user?.id ? "justify-end" : "justify-start"}`}
//                   >
//                     <div
//                       className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
//                         message.sender._id === user?.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
//                       }`}
//                     >
//                       {message.replyTo && (
//                         <div className="mb-2 p-2 bg-black bg-opacity-10 rounded text-xs">
//                           <div className="font-semibold">{message.replyTo.sender.displayName}</div>
//                           <div className="truncate">{message.replyTo.content}</div>
//                         </div>
//                       )}

//                       <div className="break-words">{message.content}</div>

//                       {message.reactions.length > 0 && (
//                         <div className="flex flex-wrap gap-1 mt-2">
//                           {message.reactions.map((reaction, index) => (
//                             <span key={index} className="text-xs bg-black bg-opacity-10 px-2 py-1 rounded-full">
//                               {reaction.emoji}
//                             </span>
//                           ))}
//                         </div>
//                       )}

//                       <div className="flex items-center justify-between mt-1">
//                         <span className="text-xs opacity-70">{formatTime(message.createdAt)}</span>
//                         {message.sender._id === user?.id && (
//                           <div className="flex items-center space-x-1">
//                             {message.readBy.some((read) => read.user !== user?.id) && (
//                               <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}

//                 {typingUsers.length > 0 && (
//                   <div className="flex justify-start">
//                     <div className="bg-gray-200 px-4 py-2 rounded-lg">
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
//                         <div
//                           className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
//                           style={{ animationDelay: "0.1s" }}
//                         ></div>
//                         <div
//                           className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
//                           style={{ animationDelay: "0.2s" }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div ref={messagesEndRef} />
//               </div>
//             </ScrollArea>

//             {/* Message Input */}
//             <div className="p-4 bg-white border-t border-gray-200">
//               <div className="flex items-center space-x-2">
//                 <Button variant="ghost" size="sm">
//                   <Paperclip className="w-4 h-4" />
//                 </Button>
//                 <div className="flex-1 relative">
//                   <Input
//                     value={newMessage}
//                     onChange={(e) => {
//                       setNewMessage(e.target.value)
//                       handleTyping()
//                     }}
//                     onKeyPress={(e) => {
//                       if (e.key === "Enter" && !e.shiftKey) {
//                         e.preventDefault()
//                         sendMessage()
//                       }
//                     }}
//                     placeholder="Type a message..."
//                     disabled={sendingMessage}
//                   />
//                 </div>
//                 <Button variant="ghost" size="sm">
//                   <Smile className="w-4 h-4" />
//                 </Button>
//                 <Button onClick={sendMessage} disabled={!newMessage.trim() || sendingMessage} size="sm">
//                   <Send className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center bg-gray-50">
//             <div className="text-center">
//               <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Send className="w-8 h-8 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
//               <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
