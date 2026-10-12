package com.campuscare.dto.chatbot;

import java.util.List;

public class ChatResponse {
    private String sessionId;
    private String reply;
    private String source; // FAQ, AI, FALLBACK
    private List<String> suggestions;

    public ChatResponse() {
    }

    public ChatResponse(String sessionId, String reply, String source, List<String> suggestions) {
        this.sessionId = sessionId;
        this.reply = reply;
        this.source = source;
        this.suggestions = suggestions;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }
}
