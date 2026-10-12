package com.campuscare.dto.chatbot;

import com.campuscare.entity.ChatbotMessage;
import java.time.LocalDateTime;

public class ChatMessageDto {
    private Long id;
    private String sender;
    private String message;
    private String source;
    private LocalDateTime createdAt;

    public ChatMessageDto() {
    }

    public static ChatMessageDto fromEntity(ChatbotMessage msg) {
        if (msg == null) return null;
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(msg.getId());
        dto.setSender(msg.getSender());
        dto.setMessage(msg.getMessage());
        dto.setSource(msg.getSource());
        dto.setCreatedAt(msg.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
