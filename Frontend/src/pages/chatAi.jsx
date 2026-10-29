

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../utils/axios.js";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Send, Bot, User } from "lucide-react";

function ChatAi({ problem, code , emailID }) {
  const [messages, setMessages] = useState([
    { role: "model", parts: [{ text: "Hello, I am Nexi." }] }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const { register, reset, handleSubmit } = useForm();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const onSubmit = async (data) => {
   if (!data.message?.trim()) return;

    const newMsg = { role: "user", parts: [{ text: data.message }] };
    const newMessages = [...messages, newMsg];
    
    setMessages(newMessages);
    reset();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/chat/ai", {
        message: newMessages,
        title: problem?.title,
        description: problem?.description,
        testCases: problem?.visibleTestCases,
        code: code,
        emailID : emailID
      });

      const aiText = response?.data?.message || "No response received.";
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: aiText }] },
      ]);

    } catch (error) {
      console.error("Chat API error:", error.response?.data || error.message);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "Something went wrong." }] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  //  STYLING CONFIGURATION
  // ---------------------------------------------------------

  const MarkdownComponents = {
    // 1. BLOCK CODE -> Renders as a separate box
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      
      return !inline && match ? (
        // This is the "Code Container" - fully separate
        <div className="w-full my-2 rounded-lg overflow-hidden border border-gray-700 shadow-md">
          <div className="bg-black text-gray-400 text-xs px-3 py-1 flex justify-between items-center border-b border-gray-800">
             <span>{match[1]}</span>
          </div>
          <div className="bg-black p-0 m-0">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              wrapLongLines={true}
              customStyle={{ 
                margin: 0, 
                padding: '1rem', 
                backgroundColor: '#000000', 
                fontSize: '0.85rem',
                lineHeight: '1.5'
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        </div>
      ) : (
        // Inline code inside text
        <code className="bg-gray-800 text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700" {...props}>
          {children}
        </code>
      );
    },
    
    // 2. TEXT PARAGRAPHS -> Renders as a "Text Bubble"
    p: ({children}) => (
      <div className="bg-[#18181b] text-gray-300 p-3 rounded-lg mb-2 border border-gray-800/50 shadow-sm leading-relaxed">
        {children}
      </div>
    ),

    // 3. LISTS -> Render as "Text Bubble"
    ul: ({children}) => (
      <ul className="bg-[#18181b] text-gray-300 p-3 pl-8 rounded-lg mb-2 border border-gray-800/50 list-disc">
        {children}
      </ul>
    ),
    ol: ({children}) => (
      <ol className="bg-[#18181b] text-gray-300 p-3 pl-8 rounded-lg mb-2 border border-gray-800/50 list-decimal">
        {children}
      </ol>
    ),
    // Headers
    h1: ({children}) => <h1 className="text-xl font-bold text-white mb-2 mt-4 px-1">{children}</h1>,
    h2: ({children}) => <h2 className="text-lg font-bold text-white mb-2 mt-3 px-1">{children}</h2>,
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto mt-8 h-[600px] bg-[#09090b] rounded-xl border border-gray-800 shadow-2xl overflow-hidden font-sans">
      
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-800 bg-[#09090b] flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
         <h2 className="text-sm font-bold text-gray-200 uppercase tracking-widest">Nexi</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div key={index} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[90%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Icons */}
                <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center mt-1 ${isUser ? 'bg-blue-600' : 'bg-[#18181b]'}`}>
                  {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-400" />}
                </div>

                {/* 
                   CONTENT AREA 
                   If it's User: Single blue bubble.
                   If it's AI: Transparent container that lets MarkdownComponents create the bubbles.
                */}
                <div className={`
                  flex flex-col w-full overflow-hidden
                  ${isUser 
                    ? "bg-blue-600 text-white p-3 rounded-lg text-sm" 
                    : "text-sm" // Removed bg and padding here for AI
                  }
                `}>
                  {isUser ? (
                    <p>{msg.parts?.[0]?.text}</p>
                  ) : (
                    // This Markdown will now generate separate divs for text and code
                    <ReactMarkdown components={MarkdownComponents}>
                      {msg.parts?.[0]?.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Animation */}
        {isLoading && (
           <div className="flex w-full justify-start">
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-[#18181b] flex items-center justify-center mt-1">
                  <Bot size={16} className="text-gray-400" />
                </div>
                <div className="bg-[#18181b] px-4 py-3 rounded-lg flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                </div>
             </div>
           </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#09090b] border-t border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="relative group">
          <input
            autoComplete="off"
            className="w-full bg-[#121214] text-gray-200 text-sm rounded-md py-3 pl-4 pr-10 
                       border border-gray-800 focus:border-blue-500/50 focus:outline-none transition-colors placeholder:text-gray-600"
            placeholder="Type your message..."
            disabled={isLoading}
            {...register("message", { required: true })}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-white transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatAi;
