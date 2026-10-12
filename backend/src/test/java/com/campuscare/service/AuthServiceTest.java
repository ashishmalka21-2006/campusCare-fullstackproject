package com.campuscare.service;

import com.campuscare.dto.auth.AuthResponse;
import com.campuscare.dto.auth.LoginRequest;
import com.campuscare.dto.auth.RegisterRequest;
import com.campuscare.entity.Role;
import com.campuscare.entity.User;
import com.campuscare.exception.BadRequestException;
import com.campuscare.repository.UserRepository;
import com.campuscare.security.JwtTokenProvider;
import com.campuscare.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setFullName("Test Student");
        sampleUser.setEmail("test@campuscare.edu");
        sampleUser.setPassword("encodedPassword");
        sampleUser.setRole(Role.STUDENT);
        sampleUser.setActive(true);
    }

    @Test
    void testRegisterStudent_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test Student");
        request.setEmail("test@campuscare.edu");
        request.setPassword("password123");
        request.setStudentId("CS101");

        when(userRepository.existsByEmailIgnoreCase(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock.jwt.token");

        AuthResponse response = authService.registerStudent(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("Test Student", response.getUser().getFullName());
        assertEquals(Role.STUDENT, response.getUser().getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegisterStudent_EmailAlreadyExists_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@campuscare.edu");

        when(userRepository.existsByEmailIgnoreCase(request.getEmail())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerStudent(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("test@campuscare.edu", "password123");

        UserPrincipal principal = UserPrincipal.create(sampleUser);
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock.jwt.token");
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("test@campuscare.edu", response.getUser().getEmail());
    }
}
