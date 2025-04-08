
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function MessageList({ messages, onRequestResponse }) {
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to bottom on new messages
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom on component mount
  React.useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence initial={false} mode="popLayout">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            {msg.type === "request" ? (
              <div className="bg-yellow-50 rounded-lg p-4 w-full">
                <p className="text-yellow-800">{msg.text}</p>
                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => onRequestResponse(true)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accetta
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onRequestResponse(false)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rifiuta
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender === "me"
                    ? "bg-purple-600 text-white"
                    : msg.sender === "system"
                    ? "bg-gray-200 text-gray-800 text-center"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === "me" ? "text-purple-200" : "text-gray-500"
                }`}>
                  {msg.time}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
