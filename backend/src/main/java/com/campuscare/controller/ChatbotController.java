package com.campuscare.controller;

import com.campuscare.dto.chatbot.ChatMessageDto;
import com.campuscare.dto.chatbot.ChatRequest;
import com.campuscare.dto.chatbot.ChatResponse;
import com.campuscare.dto.common.ApiResponse;
import com.campuscare.security.UserPrincipal;
import com.campuscare.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getId() : null;
        ChatResponse response = chatbotService.processMessage(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/sessions/{id}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageDto>>> getSessionMessages(
            @PathVariable String id) {
        List<ChatMessageDto> messages = chatbotService.getSessionMessages(id);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }
}
