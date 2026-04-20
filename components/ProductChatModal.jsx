"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  X, 
  Palette, 
  Ruler, 
  FileText, 
  Package, 
  Truck, 
  Shirt,
  HelpCircle
} from "lucide-react";


const predefinedQuestions = [
  { id: "color", question: "What colors are available?", icon: Palette },
  { id: "size", question: "What sizes are available?", icon: Ruler },
  { id: "description", question: "Tell me about this product", icon: FileText },
  { id: "stock", question: "Is this in stock?", icon: Package },
  { id: "delivery", question: "When can I get this?", icon: Truck },
  { id: "material", question: "What material is this?", icon: Shirt },
];

export default function ProductChatModal({ isOpen, onClose, product }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle escape key and body overflow
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handlePredefinedQuestion = (questionId, questionText) => {
    // Add user question
    const newUserMessage = { type: "user", text: questionText };
    setMessages(prev => [...prev, newUserMessage]);

    // Generate bot response based on question
    let answer = "";
    switch (questionId) {
      case "color":
        answer = `This ${product.title} is available in the standard color shown in the images. For specific color options, please check the product details page.`;
        break;
      case "size":
        answer = `Available sizes: ${product.sizes.join(", ")}. Try our Fitting Room to see how it looks on you!`;
        break;
      case "description":
        answer = product.description || "This is a premium quality product from " + product.brand;
        break;
      case "stock":
        answer = "Yes! This item is currently in stock and ready to ship.";
        break;
      case "delivery":
        answer = "Standard delivery takes 3-5 business days. Express delivery (1-2 days) is also available at checkout.";
        break;
      case "material":
        answer = "This product is made from high-quality materials. For detailed material information, please check the product specifications.";
        break;
      default:
        answer = "I'm here to help! Select a question or type your own.";
    }

    // Add bot response after a short delay
    setTimeout(() => {
      setMessages(prev => [...prev, { type: "bot", text: answer }]);
    }, 500);
  };

  const handleClose = () => {
    setMessages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={handleClose}>
      <div 
        className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Product Assistant</h3>
              <p className="text-xs text-gray-300">Ask me anything</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex gap-3">
            <img
              src={product.images?.[0] || product.image || '/placeholder-product.jpg'}
              alt={product.title}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{product.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
              {!product.hidePrice && (
                <p className="text-sm font-bold text-black mt-1">
                  {product.specialPrice || product.price}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">Hi! Click any question below to learn more</p>
              <p className="text-xs text-gray-500 mt-1">Select from the options below</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === "user" 
                      ? "bg-black text-white rounded-br-sm" 
                      : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-1"></div>
            </>
          )}
        </div>

        {/* Quick Questions - Always visible */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-gray-600" />
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Select a Question</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {predefinedQuestions.map((q) => {
              const IconComponent = q.icon;
              return (
                <button
                  key={q.id}
                  onClick={() => handlePredefinedQuestion(q.id, q.question)}
                  className="text-left p-3 bg-white hover:bg-gray-50 rounded-lg text-xs font-medium transition-all border border-gray-200 hover:border-black hover:shadow-sm group"
                >
                  <div className="flex items-start gap-2">
                    <IconComponent className="w-4 h-4 text-gray-600 group-hover:text-black mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 group-hover:text-black">{q.question}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}

