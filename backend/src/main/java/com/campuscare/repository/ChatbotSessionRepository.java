package com.campuscare.repository;

import com.campuscare.entity.ChatbotSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatbotSessionRepository extends JpaRepository<ChatbotSession, String> {
    List<ChatbotSession> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
