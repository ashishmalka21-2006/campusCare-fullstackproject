package com.campuscare.service;

import com.campuscare.dto.notification.NotificationResponse;
import com.campuscare.entity.Complaint;
import com.campuscare.entity.Notification;
import com.campuscare.entity.User;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.NotificationRepository;
import com.campuscare.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createNotification(User user, String title, String message, String type, Complaint complaint) {
        Notification notification = new Notification(user, title, message, type, complaint);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(NotificationResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long currentUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You are not authorized to access this notification");
        }

        notification.setRead(true);
        notification = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(notification);
    }

    @Transactional
    public void markAllAsRead(Long currentUserId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
