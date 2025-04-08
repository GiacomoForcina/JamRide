
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Clock, User, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { initializeStripePayment } from "@/lib/stripe";
import MessageList from "@/components/chat/MessageList";

function Messages({ user }) {
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [chats, setChats] = React.useState([]);

  // Carica le chat dal localStorage
  React.useEffect(() => {
    if (user) {
      const userChats = JSON.parse(localStorage.getItem(`chats_${user.uid}`) || '[]');
      setChats(userChats);
    }
  }, [user]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "message"
    };

    // Aggiorna immediatamente lo stato locale per mostrare il messaggio
    const updatedChats = chats.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, messages: [...chat.messages, newMessage] }
        : chat
    );
    setChats(updatedChats);
    setMessage(""); // Pulisci l'input immediatamente

    // Aggiorna il localStorage per l'utente corrente
    localStorage.setItem(`chats_${user.uid}`, JSON.stringify(updatedChats));

    // Aggiorna la chat del destinatario
    const recipientMessage = {
      ...newMessage,
      sender: "other"
    };
    const recipientChats = JSON.parse(localStorage.getItem(`chats_${selectedChat.user.id}`) || '[]');
    const updatedRecipientChats = recipientChats.map(chat => 
      chat.user.id === user.uid
        ? { ...chat, messages: [...chat.messages, recipientMessage] }
        : chat
    );
    localStorage.setItem(`chats_${selectedChat.user.id}`, JSON.stringify(updatedRecipientChats));
  };

  const handleRequestResponse = async (chatId, accepted) => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        const filteredMessages = chat.messages.filter(msg => msg.type !== "request");
        return {
          ...chat,
          ride: { ...chat.ride, status: accepted ? "accepted" : "rejected" },
          messages: [
            ...filteredMessages,
            {
              id: Date.now(),
              sender: "system",
              text: accepted ? "Richiesta accettata" : "Richiesta rifiutata",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "system"
            }
          ]
        };
      }
      return chat;
    });

    setChats(updatedChats);
    localStorage.setItem(`chats_${user.uid}`, JSON.stringify(updatedChats));

    // Aggiorna la chat del richiedente
    const requesterChats = JSON.parse(localStorage.getItem(`chats_${selectedChat.user.id}`) || '[]');
    const updatedRequesterChats = requesterChats.map(chat => 
      chat.user.id === user.uid
        ? {
            ...chat,
            ride: { ...chat.ride, status: accepted ? "accepted" : "rejected" },
            messages: [
              ...chat.messages.filter(msg => msg.type !== "request"),
              {
                id: Date.now(),
                sender: "system",
                text: accepted ? "Richiesta accettata" : "Richiesta rifiutata",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: "system"
              }
            ]
          }
        : chat
    );
    localStorage.setItem(`chats_${selectedChat.user.id}`, JSON.stringify(updatedRequesterChats));

    toast({
      title: accepted ? "Richiesta accettata" : "Richiesta rifiutata",
      description: accepted 
        ? "Il passeggero può ora procedere con il pagamento"
        : "Il passeggero verrà notificato del rifiuto"
    });
  };

  const handleDeleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    localStorage.setItem(`chats_${user.uid}`, JSON.stringify(updatedChats));
    
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }

    toast({
      title: "Chat eliminata",
      description: "La conversazione è stata eliminata"
    });
  };

  const handlePayment = async (chatId) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      if (chat?.ride.status !== "accepted") {
        toast({
          title: "Impossibile procedere",
          description: "Attendi l'accettazione della richiesta prima di procedere al pagamento",
          variant: "destructive"
        });
        return;
      }

      await initializeStripePayment(stripeConfig.priceId);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile procedere con il pagamento. Riprova più tardi.",
        variant: "destructive"
      });
    }
  };

  const handleViewProfile = (userId) => {
    toast({
      title: "Visualizzazione profilo",
      description: "Apertura del profilo utente..."
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Lista chat */}
          <div className="border-r">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Messaggi</h2>
            </div>
            <div className="overflow-y-auto h-[calc(600px-4rem)]">
              <AnimatePresence>
                {chats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                    className={`p-4 cursor-pointer border-b relative group ${
                      selectedChat?.id === chat.id ? "bg-purple-50" : ""
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <img src={chat.user.avatar} alt={chat.user.name} />
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-800">{chat.user.name}</h3>
                          {chat.unread > 0 && (
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                              {chat.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{chat.ride.concert}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{chat.ride.date}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Area chat */}
          <div className="col-span-2 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Avatar 
                      className="h-10 w-10 cursor-pointer"
                      onClick={() => handleViewProfile(selectedChat.user.id)}
                    >
                      <img src={selectedChat.user.avatar} alt={selectedChat.user.name} />
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-800">{selectedChat.user.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProfile(selectedChat.user.id)}
                        >
                          <User className="h-4 w-4" />
                          <span className="ml-1">Profilo</span>
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">{selectedChat.ride.concert}</p>
                    </div>
                  </div>
                  {selectedChat.ride.status === "accepted" && (
                    <Button
                      onClick={() => handlePayment(selectedChat.id)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Paga con PayPal
                    </Button>
                  )}
                </div>

                <MessageList 
                  messages={selectedChat.messages}
                  onRequestResponse={(accepted) => handleRequestResponse(selectedChat.id, accepted)}
                />

                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Scrivi un messaggio..."
                      className="flex-1 rounded-md border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Seleziona una chat per iniziare a messaggiare
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
