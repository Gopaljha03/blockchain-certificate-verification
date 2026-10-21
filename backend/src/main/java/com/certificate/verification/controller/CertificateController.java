package com.certificate.verification.controller;

import com.certificate.verification.dto.CertificateDto;
import com.certificate.verification.dto.IssueCertificateRequestDto;
import com.certificate.verification.entity.Certificate;
import com.certificate.verification.entity.Result;
import com.certificate.verification.entity.Student;
import com.certificate.verification.exception.ResourceNotFoundException;
import com.certificate.verification.repository.CertificateRepository;
import com.certificate.verification.repository.ResultRepository;
import com.certificate.verification.repository.StudentRepository;
import com.certificate.verification.service.CertificateService;
import com.certificate.verification.util.QrCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@Slf4j
public class CertificateController {

    private final CertificateService certificateService;
    private final CertificateRepository certificateRepository;
    private final StudentRepository studentRepository;
    private final ResultRepository resultRepository;
    private final QrCodeService qrCodeService;

    @Value("${app.frontend.verify-url:http://localhost:5173/verify}")
    private String verifyBaseUrl;

    @PostMapping("/issue")
    public ResponseEntity<CertificateDto> issueCertificate(@Valid @RequestBody IssueCertificateRequestDto request) {
        CertificateDto issued = certificateService.issueCertificate(request);
        return new ResponseEntity<>(issued, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CertificateDto>> getAllCertificates() {
        return ResponseEntity.ok(certificateService.getAllCertificates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificateDto> getCertificateById(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.getCertificateById(id));
    }

    /**
     * Public endpoint to render raw PNG QR code for any certificate.
     */
    @GetMapping(value = "/qr/{verificationId}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQrCodeImage(@PathVariable String verificationId) {
        String verifyUrl = verifyBaseUrl + "/" + verificationId.trim();
        byte[] qrBytes = qrCodeService.generateQrCodePng(verifyUrl, 300, 300);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        return new ResponseEntity<>(qrBytes, headers, HttpStatus.OK);
    }

    /**
     * Dedicated Tampering Demonstration Endpoint (Requirement Section 28).
     * Modifies the database record (e.g., bumps CGPA or modifies Student Name in PostgreSQL)
     * WITHOUT modifying the blockchain contract, allowing instant live demonstration of
     * hash mismatch and INVALID / TAMPERED detection.
     */
    @PostMapping("/tamper-demo/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> tamperDemoCertificate(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        log.warn("Executing TAMPER DEMONSTRATION for Certificate ID: {}", id);

        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found with ID: " + id));

        Result result = certificate.getResult();
        Double originalCgpa = result.getCgpa();

        // Alter CGPA in PostgreSQL database
        Double tamperedCgpa = 9.9;
        if (body != null && body.containsKey("newCgpa")) {
            tamperedCgpa = Double.valueOf(body.get("newCgpa").toString());
        } else if (originalCgpa.equals(9.9)) {
            tamperedCgpa = 10.0;
        }

        result.setCgpa(tamperedCgpa);
        resultRepository.save(result);

        log.info("Database tampered: CGPA changed from {} to {} for student {}",
                originalCgpa, tamperedCgpa, certificate.getStudent().getStudentId());

        return ResponseEntity.ok(Map.of(
                "message", "Database successfully tampered for demonstration!",
                "certificateId", certificate.getCertificateId(),
                "verificationId", certificate.getVerificationId(),
                "originalCgpa", originalCgpa,
                "tamperedCgpaInDatabase", tamperedCgpa,
                "note", "Verification will now fail because recalculated hash will not match immutable blockchain record."
        ));
    }
}
