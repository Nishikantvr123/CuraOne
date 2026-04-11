// src/components/chat/ChatWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { apiService } from '../../services/api';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadSuggestions();
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Namaste! I'm CuraBot, your Ayurvedic wellness assistant. How can I help you today?",
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const normalizeSuggestion = (s) => {
    // API might return string or { text, action } etc.
    if (!s && s !== 0) return '';
    if (typeof s === 'string') return s;
    if (typeof s === 'object') {
      if (s.text) return s.text;
      if (s.label) return s.label;
      // fallback to JSON if nothing useful
      try {
        return JSON.stringify(s);
      } catch {
        return String(s);
      }
    }
    return String(s);
  };

  const loadSuggestions = async () => {
    try {
      const response = await apiService.get('/chat/suggestions');
      if (response && response.success) {
        const raw = response.data?.suggestions || [];
        setSuggestions(raw.map(normalizeSuggestion));
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const normalizeResponseText = (resp) => {
    // resp can be string or { text, action } or other structure
    if (resp == null) return '';
    if (typeof resp === 'string') return resp;
    if (typeof resp === 'object') {
      if (resp.text) return resp.text;
      if (resp.content) return resp.content;
      // fallback to JSON
      try {
        return JSON.stringify(resp);
      } catch {
        return String(resp);
      }
    }
    return String(resp);
  };

  const normalizeSuggestionsArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(normalizeSuggestion);
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiService.post('/chat', { message: messageText.trim() });

      if (response && response.success) {
        // normalize assistant content and suggestions
        const respData = response.data || {};
        const assistantContent = normalizeResponseText(respData.response);
        const assistantSuggestions = normalizeSuggestionsArray(respData.suggestions);

        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: assistantContent,
          action: respData.action || null, // keep as data but don't render directly as a child
          suggestions: assistantSuggestions,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // server returned success=false
        const errorMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: (response && response.message) || 'I could not process that request. Please try again.',
          isError: true,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat request failed:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an issue. Please try again in a moment.',
        isError: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion) => {
    // suggestion is a normalized string now
    sendMessage(suggestion);
  };

  const formatMessage = (content) => {
    // content is a string (we normalized it). Safe to split & map.
    if (typeof content !== 'string') {
      content = String(content);
    }
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} className="block">{line.slice(2, -2)}</strong>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={i} className="ml-4 list-inside">{line.slice(2)}</li>;
      }
      return <p key={i} className="mb-1">{line}</p>;
    });
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50 flex items-center gap-2"
          aria-label="Open CuraBot Chat"
        >
          <Bot className="w-6 h-6" />
          <span className="hidden sm:inline font-medium">CuraBot</span>
          <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">CuraBot</h3>
                <p className="text-xs text-emerald-100">Ayurvedic Wellness Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-emerald-500 text-white rounded-br-md'
                      : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-md'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' && (
                      <Bot className={`w-4 h-4 mt-1 flex-shrink-0 ${message.isError ? 'text-red-500' : 'text-emerald-500'}`} />
                    )}
                    <div className="text-sm leading-relaxed">
                      {formatMessage(message.content)}
                    </div>
                  </div>

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-500" />
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {suggestions.length > 0 && messages.length <= 1 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask CuraBot anything..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
