package com.certificate.verification.controller;

import com.certificate.verification.dto.VerificationResponseDto;
import com.certificate.verification.service.VerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verify")
@RequiredArgsConstructor
@Slf4j
public class VerificationController {

    private final VerificationService verificationService;

    /**
     * Public endpoint to verify certificate authenticity.
     * No authentication required.
     */
    @GetMapping("/{verificationId}")
    public ResponseEntity<VerificationResponseDto> verifyCertificate(@PathVariable String verificationId) {
        log.info("Received public verification request for ID: {}", verificationId);
        VerificationResponseDto response = verificationService.verifyCertificate(verificationId);
        return ResponseEntity.ok(response);
    }
}
