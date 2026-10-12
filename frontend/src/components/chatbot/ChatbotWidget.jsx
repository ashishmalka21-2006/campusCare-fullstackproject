import React, { useState, useEffect, useRef } from 'react';
import { chatbotApi } from '../../api/chatbotApi';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('cc_chat_session') || '');
  const [messages, setMessages] = useState([
    {
      sender: 'BOT',
      message: 'Hello! I am your **CampusCare AI Assistant**. How can I assist you today? You can ask about filing complaints, Wi-Fi, classroom equipment, hostel facilities, or status cycles.',
      source: 'FAQ',
      suggestions: ['How to submit a complaint?', 'Wi-Fi not working', 'Hostel water problem', 'What do the statuses mean?'],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    // Append user message
    const userMsg = { sender: 'USER', message: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await chatbotApi.sendMessage({
        sessionId: sessionId || undefined,
        message: query,
      });

      if (res.success && res.data) {
        if (!sessionId && res.data.sessionId) {
          setSessionId(res.data.sessionId);
          localStorage.setItem('cc_chat_session', res.data.sessionId);
        }

        const botMsg = {
          sender: 'BOT',
          message: res.data.reply,
          source: res.data.source,
          suggestions: res.data.suggestions || [],
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'BOT',
          message: 'I am experiencing a momentary connection issue. You can report critical emergencies to the campus administrative desk or retry your query.',
          source: 'FALLBACK',
          suggestions: ['How to submit a complaint?', 'What do the statuses mean?'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="CampusCare AI Assistant"
        aria-label="Toggle AI Chatbot"
      >
        {isOpen ? <i className="bi bi-x-lg fs-4"></i> : <i className="bi bi-robot"></i>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="p-3 bg-primary-navy text-white d-flex align-items-center justify-content-between border-bottom">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <i className="bi bi-robot fs-5"></i>
              </div>
              <div>
                <h6 className="mb-0 fw-bold brand-font text-white">CampusCare Assistant</h6>
                <small className="text-white-50" style={{ fontSize: '0.72rem' }}>AI Complaint & Support Guide</small>
              </div>
            </div>
            <button
              className="btn btn-sm text-white-50 p-0"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <i className="bi bi-dash-lg fs-5"></i>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="p-3 flex-grow-1 overflow-y-auto bg-light" style={{ fontSize: '0.875rem' }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex flex-column mb-3 ${msg.sender === 'USER' ? 'align-items-end' : 'align-items-start'}`}
              >
                <div
                  className={`p-3 rounded-3 shadow-sm ${
                    msg.sender === 'USER'
                      ? 'bg-primary-navy text-white'
                      : 'bg-white text-dark border'
                  }`}
                  style={{
                    maxWidth: '85%',
                    borderRadius: msg.sender === 'USER' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {msg.message}
                </div>

                {/* Source pill for bot */}
                {msg.sender === 'BOT' && msg.source && (
                  <small className="text-muted mt-1 ms-1 d-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                    <i className="bi bi-lightning-charge"></i> Source: {msg.source}
                  </small>
                )}

                {/* Suggestion Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 mt-2 ms-1">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        className="btn btn-outline-primary btn-sm rounded-pill py-1 px-2 border"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => handleSendMessage(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="d-flex align-items-center gap-2 text-muted small p-2">
                <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                <span>Assistant is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-2 border-top bg-white">
            <div className="input-group">
              <input
                type="text"
                className="form-control border-end-0 rounded-start-pill py-2 px-3 text-sm"
                placeholder="Ask about Wi-Fi, hostel, procedures..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
              />
              <button
                className="btn btn-primary-navy rounded-end-pill px-3"
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
