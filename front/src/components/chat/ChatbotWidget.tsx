"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Home, Bot } from 'lucide-react';
import { chatService } from '@/services/chatService';
import Image from 'next/image';
import Link from 'next/link';

// 1. Interfaces estrictas para que TypeScript no arroje errores
interface ChatProperty {
  id: string;
  name: string;
  city: string;
  price: number;
  priceUnit: string;
  image: string | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  properties?: ChatProperty[];
}

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      sender: 'bot', 
      text: '¡Hola! Soy el asistente virtual de Vesta. ¿En qué ciudad buscás alojarte o qué dudas tenés?' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll al último mensaje cuando se agrega uno nuevo
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    
    // Agregamos mensaje del usuario a la UI
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMsg);
      
      // Agregamos la respuesta del bot (texto + propiedades si la IA las encontró)
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        sender: 'bot', 
        text: response.message || 'No pude generar una respuesta. Intentá de nuevo.',
        properties: response.properties 
      }]);
    } catch (error) {
      console.error("Error en chatbot:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: 'bot', 
        text: 'Lo siento, tuve un problema de conexión con la Inteligencia Artificial. Intentá nuevamente.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Ventana de Chat */}
      {isOpen && (
        <div className="bg-surface w-[350px] sm:w-[400px] h-[550px] rounded-2xl shadow-2xl border border-subtle flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5">
          
          {/* Header */}
         <div className="bg-primary text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Vesta AI</h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> En línea
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-blue-100 hover:text-white transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-app">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Globo de texto */}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-br-sm' 
                    : 'bg-surface border border-subtle text-main rounded-bl-sm shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Tarjetas de propiedades si la IA devuelve resultados */}
                {msg.properties && msg.properties.length > 0 && (
                  <div className="mt-2 w-full max-w-[90%] space-y-2">
                    {msg.properties.map((prop) => (
                      <Link key={prop.id} href={`/catalog/${prop.id}`} className="flex items-center gap-3 bg-surface p-2 rounded-xl border border-subtle hover:border-primary transition-colors group shadow-sm cursor-pointer">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden shrink-0 bg-app">
                          {prop.image ? (
                            <Image src={prop.image} alt={prop.name} fill sizes="48px" className="object-cover" />
                          ) : (
                            <Home size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-main truncate group-hover:text-primary">{prop.name}</p>
                          <p className="text-[10px] text-muted truncate">{prop.city}</p>
                          <p className="text-xs font-bold text-main mt-0.5">US$ {prop.price} <span className="text-[9px] font-normal text-muted">/ {prop.priceUnit}</span></p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-surface border border-subtle rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            {/* Div invisible para anclar el scroll automático al final */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de texto inferior */}
          <form onSubmit={handleSend} className="p-3 bg-surface border-t border-subtle shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-app border border-subtle rounded-full pl-4 pr-12 py-2.5 text-sm outline-none focus:border-primary transition-colors text-main"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Botón flotante para abrir el chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center cursor-pointer relative group"
        >
          <MessageCircle size={28} />
          <span className="absolute -top-10 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Hablar con IA
          </span>
        </button>
      )}
    </div>
  );
};