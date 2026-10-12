package com.campuscare.service;

import com.campuscare.dto.chatbot.ChatMessageDto;
import com.campuscare.dto.chatbot.ChatRequest;
import com.campuscare.dto.chatbot.ChatResponse;
import com.campuscare.entity.ChatbotMessage;
import com.campuscare.entity.ChatbotSession;
import com.campuscare.entity.User;
import com.campuscare.repository.ChatbotMessageRepository;
import com.campuscare.repository.ChatbotSessionRepository;
import com.campuscare.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotService.class);

    private final ChatbotSessionRepository sessionRepository;
    private final ChatbotMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${app.ai.api-key:}")
    private String aiApiKey;

    @Value("${app.ai.model:gemini-1.5-flash}")
    private String aiModel;

    @Value("${app.ai.endpoint:https://generativelanguage.googleapis.com/v1beta/models}")
    private String aiEndpoint;

    public ChatbotService(ChatbotSessionRepository sessionRepository,
                          ChatbotMessageRepository messageRepository,
                          UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public ChatResponse processMessage(ChatRequest request, Long currentUserId) {
        String sessionId = request.getSessionId();
        ChatbotSession session;

        if (StringUtils.hasText(sessionId) && sessionRepository.existsById(sessionId)) {
            session = sessionRepository.findById(sessionId).get();
        } else {
            String newSessionId = UUID.randomUUID().toString();
            User user = currentUserId != null ? userRepository.findById(currentUserId).orElse(null) : null;
            session = new ChatbotSession(newSessionId, user);
            session = sessionRepository.save(session);
        }

        // Save User Message
        ChatbotMessage userMsg = new ChatbotMessage(session, "USER", request.getMessage(), null);
        messageRepository.save(userMsg);

        // Process message via AI provider or Rule-based FAQ fallback
        ChatResponse response;
        if (StringUtils.hasText(aiApiKey)) {
            try {
                response = callAiProvider(request.getMessage(), session.getId());
            } catch (Exception ex) {
                logger.warn("AI provider invocation failed, falling back to FAQ engine: {}", ex.getMessage());
                response = answerFromFaq(request.getMessage(), session.getId());
                response.setSource("FALLBACK");
            }
        } else {
            response = answerFromFaq(request.getMessage(), session.getId());
        }

        // Save Bot Response
        ChatbotMessage botMsg = new ChatbotMessage(session, "BOT", response.getReply(), response.getSource());
        messageRepository.save(botMsg);

        return response;
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getSessionMessages(String sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map(ChatMessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    private ChatResponse answerFromFaq(String query, String sessionId) {
        String lower = query.toLowerCase().trim();
        String reply;
        String source = "FAQ";
        List<String> suggestions = new ArrayList<>();

        if (lower.contains("submit") || lower.contains("how to file") || lower.contains("new complaint") || lower.contains("raise")) {
            reply = "To submit a new complaint:\n" +
                    "1. Navigate to the **Submit Complaint** page from your student dashboard.\n" +
                    "2. Enter a descriptive title (e.g., 'Projector bulb fused in LH-2').\n" +
                    "3. Select the correct Department (IT Support, Hostel, Maintenance, Library, Administration).\n" +
                    "4. Specify exact Location and Priority (Low, Medium, High, Urgent).\n" +
                    "5. Optionally attach an image photo proof.\n" +
                    "6. Click Submit to receive your instant reference tracking number (e.g., CC-2026-000001).";
            suggestions = Arrays.asList("What do the statuses mean?", "Which department handles Wi-Fi issues?", "How to track my complaint?");
        } else if (lower.contains("status") || lower.contains("meaning") || lower.contains("stages")) {
            reply = "Here are the CampusCare complaint lifecycle stages:\n" +
                    "• **SUBMITTED**: Complaint recorded and waiting for administrator review.\n" +
                    "• **ASSIGNED**: Delegated to a qualified departmental staff technician.\n" +
                    "• **IN_PROGRESS**: Technician is actively diagnosing or resolving the campus issue.\n" +
                    "• **RESOLVED**: Resolution notes and repairs completed by staff.\n" +
                    "• **REOPENED**: Student marked the resolution as incomplete within the grace period.\n" +
                    "• **CLOSED**: Verified complete and finalized.";
            suggestions = Arrays.asList("How can I reopen a complaint?", "How long does resolution take?", "How to track my complaint?");
        } else if (lower.contains("wifi") || lower.contains("wi-fi") || lower.contains("internet") || lower.contains("network")) {
            reply = "For Wi-Fi or internet problems, select the **IT Support** department with category **Network & Internet**.\n" +
                    "Please include:\n" +
                    "• Building, Floor, and Room number\n" +
                    "• Whether other devices connect successfully\n" +
                    "• Time the disruption started.";
            suggestions = Arrays.asList("How to submit a complaint?", "Projector not working", "Library AC issue");
        } else if (lower.contains("projector") || lower.contains("display") || lower.contains("screen") || lower.contains("lab equipment") || lower.contains("computer")) {
            reply = "For classroom equipment (projectors, smart boards, computers, printers, or laboratory equipment), select:\n" +
                    "• Department: **IT Support** (for electronic devices, PCs, and A/V systems)\n" +
                    "• Include the Classroom/Lab number (e.g. Lab 3, LH-102) and equipment tag if visible.";
            suggestions = Arrays.asList("How to submit a complaint?", "Hostel water supply issue", "How to track my complaint?");
        } else if (lower.contains("hostel") || lower.contains("water") || lower.contains("washroom") || lower.contains("mess") || lower.contains("room")) {
            reply = "For hostel-related issues (water supply, plumbing, geyser, mess, furniture):\n" +
                    "• Select Department: **Hostel**\n" +
                    "• Priority: Set to **HIGH** or **URGENT** for water shortages or electrical safety.\n" +
                    "• Specify Hostel Block, Wing, and Room number clearly in the location field.";
            suggestions = Arrays.asList("How to submit a complaint?", "What do the statuses mean?", "Maintenance issues");
        } else if (lower.contains("library") || lower.contains("book") || lower.contains("reading room")) {
            reply = "For library complaints (AC cooling, quiet-room maintenance, digital library computers, lighting):\n" +
                    "• Select Department: **Library**\n" +
                    "• Specify the exact floor and aisle/reading section.";
            suggestions = Arrays.asList("How to submit a complaint?", "What do the statuses mean?");
        } else if (lower.contains("reopen") || lower.contains("not resolved") || lower.contains("unsatisfied") || lower.contains("still not working")) {
            reply = "To reopen a resolved complaint:\n" +
                    "1. Open your complaint from **My Complaints**.\n" +
                    "2. If the status is **RESOLVED**, click the orange **Reopen Complaint** button.\n" +
                    "3. Enter the reason why the problem persists.\n" +
                    "4. The complaint status will change to **REOPENED** and the assigned staff will be re-notified.";
            suggestions = Arrays.asList("What do the statuses mean?", "How to submit a complaint?");
        } else if (lower.contains("track") || lower.contains("check") || lower.contains("progress") || lower.contains("reference")) {
            reply = "You can track any complaint instantly by opening **My Complaints** on your dashboard.\n" +
                    "You will see the interactive status timeline, assigned staff member details, and audit remarks.";
            suggestions = Arrays.asList("What do the statuses mean?", "How to submit a complaint?");
        } else {
            reply = "Welcome to the CampusCare AI Assistant! I can help you with campus complaints, procedures, and policies.\n" +
                    "You can ask me:\n" +
                    "• How to report an issue (Wi-Fi, classroom projector, hostel water, sanitation, library)\n" +
                    "• Explanations of complaint statuses\n" +
                    "• How to track or reopen an issue\n" +
                    "• Department routing guidelines.";
            suggestions = Arrays.asList("How to submit a complaint?", "What do the statuses mean?", "Wi-Fi not working", "Hostel water issue");
        }

        return new ChatResponse(sessionId, reply, source, suggestions);
    }

    private ChatResponse callAiProvider(String prompt, String sessionId) {
        String url = String.format("%s/%s:generateContent?key=%s", aiEndpoint, aiModel, aiApiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String systemInstruction = "You are CampusCare Assistant, an AI helper for a college complaint management portal. " +
                "Help students file complaints accurately, guide them to proper departments (IT Support, Hostel, Maintenance, Library, Administration), " +
                "explain complaint status cycles, and give constructive advice for describing issues. Do not hallucinate administrative policies.";

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", systemInstruction + "\nUser Question: " + prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(textPart));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", Collections.singletonList(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map bodyMap = response.getBody();
            List candidates = (List) bodyMap.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map firstCand = (Map) candidates.get(0);
                Map contentObj = (Map) firstCand.get("content");
                List parts = (List) contentObj.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    Map firstPart = (Map) parts.get(0);
                    String text = (String) firstPart.get("text");
                    List<String> suggestions = Arrays.asList("How to submit a complaint?", "What do the statuses mean?", "Check my complaints");
                    return new ChatResponse(sessionId, text, "AI", suggestions);
                }
            }
        }

        throw new RuntimeException("Could not parse AI provider response");
    }
}
