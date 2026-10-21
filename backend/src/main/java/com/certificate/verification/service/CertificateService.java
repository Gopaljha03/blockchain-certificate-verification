package com.certificate.verification.service;

import com.certificate.verification.blockchain.BlockchainService;
import com.certificate.verification.blockchain.BlockchainTransactionResult;
import com.certificate.verification.dto.CertificateDto;
import com.certificate.verification.dto.IssueCertificateRequestDto;
import com.certificate.verification.entity.Certificate;
import com.certificate.verification.entity.Result;
import com.certificate.verification.entity.Student;
import com.certificate.verification.exception.DuplicateResourceException;
import com.certificate.verification.exception.ResourceNotFoundException;
import com.certificate.verification.exception.ValidationException;
import com.certificate.verification.repository.CertificateRepository;
import com.certificate.verification.repository.ResultRepository;
import com.certificate.verification.repository.StudentRepository;
import com.certificate.verification.util.QrCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final StudentRepository studentRepository;
    private final ResultRepository resultRepository;
    private final CertificateHashService certificateHashService;
    private final BlockchainService blockchainService;
    private final QrCodeService qrCodeService;

    @Value("${app.frontend.verify-url:http://localhost:5173/verify}")
    private String verifyBaseUrl;

    @Transactional
    public CertificateDto issueCertificate(IssueCertificateRequestDto request) {
        log.info("Issuing certificate for studentId: {}, resultId: {}", request.getStudentId(), request.getResultId());

        // 1. Find student
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        // 2. Find result
        Result result = resultRepository.findById(request.getResultId())
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with ID: " + request.getResultId()));

        // 3. Validate student/result association
        if (!result.getStudent().getId().equals(student.getId())) {
            throw new ValidationException("Result does not belong to the selected student");
        }

        // 4. Generate unique certificate ID and verification ID
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String certificateId = String.format("CERT-%d-%s", student.getAcademicYear(), randomSuffix);
        String verificationId = String.format("VER-%d-%s", student.getAcademicYear(), randomSuffix);

        // Ensure uniqueness
        while (certificateRepository.existsByCertificateId(certificateId) || certificateRepository.existsByVerificationId(verificationId)) {
            randomSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            certificateId = String.format("CERT-%d-%s", student.getAcademicYear(), randomSuffix);
            verificationId = String.format("VER-%d-%s", student.getAcademicYear(), randomSuffix);
        }

        // 5 & 6. Construct canonical string and generate SHA-256 hash
        String certificateHash = certificateHashService.generateCertificateHash(
                student.getStudentId(),
                student.getName(),
                student.getCourse(),
                student.getBranch(),
                student.getAcademicYear(),
                result.getSemester(),
                result.getCgpa(),
                result.getResultStatus()
        );

        // 7. Store on Blockchain
        log.info("Recording certificate hash on blockchain with verificationId: {}", verificationId);
        BlockchainTransactionResult txResult = blockchainService.issueCertificate(verificationId, certificateHash);

        // 8. Save in PostgreSQL
        Certificate certificate = Certificate.builder()
                .certificateId(certificateId)
                .student(student)
                .result(result)
                .verificationId(verificationId)
                .certificateHash(certificateHash)
                .transactionHash(txResult.getTransactionHash())
                .blockNumber(txResult.getBlockNumber())
                .build();

        Certificate saved = certificateRepository.save(certificate);
        log.info("Certificate successfully stored in database with ID: {}", saved.getId());

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CertificateDto> getAllCertificates() {
        return certificateRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CertificateDto getCertificateById(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found with ID: " + id));
        return mapToDto(certificate);
    }

    @Transactional(readOnly = true)
    public CertificateDto getCertificateByVerificationId(String verificationId) {
        Certificate certificate = certificateRepository.findByVerificationId(verificationId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found with verification ID: " + verificationId));
        return mapToDto(certificate);
    }

    public CertificateDto mapToDto(Certificate cert) {
        Student student = cert.getStudent();
        Result result = cert.getResult();

        String verifyUrl = verifyBaseUrl + "/" + cert.getVerificationId();
        String qrBase64 = null;
        try {
            qrBase64 = qrCodeService.generateQrCodeBase64(verifyUrl);
        } catch (Exception e) {
            log.warn("Failed to generate QR code for certificate {}: {}", cert.getCertificateId(), e.getMessage());
        }

        return CertificateDto.builder()
                .id(cert.getId())
                .certificateId(cert.getCertificateId())
                .studentDatabaseId(student != null ? student.getId() : null)
                .studentId(student != null ? student.getStudentId() : null)
                .studentName(student != null ? student.getName() : null)
                .email(student != null ? student.getEmail() : null)
                .course(student != null ? student.getCourse() : null)
                .branch(student != null ? student.getBranch() : null)
                .academicYear(student != null ? student.getAcademicYear() : null)
                .semester(result != null ? result.getSemester() : null)
                .cgpa(result != null ? result.getCgpa() : null)
                .resultStatus(result != null ? result.getResultStatus() : null)
                .verificationId(cert.getVerificationId())
                .certificateHash(cert.getCertificateHash())
                .transactionHash(cert.getTransactionHash())
                .blockNumber(cert.getBlockNumber())
                .issuedAt(cert.getIssuedAt())
                .qrCodeBase64(qrBase64)
                .verificationUrl(verifyUrl)
                .build();
    }
}
