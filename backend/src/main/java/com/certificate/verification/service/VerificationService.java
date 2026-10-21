package com.certificate.verification.service;

import com.certificate.verification.blockchain.BlockchainCertificateRecord;
import com.certificate.verification.blockchain.BlockchainService;
import com.certificate.verification.dto.VerificationResponseDto;
import com.certificate.verification.entity.Certificate;
import com.certificate.verification.entity.Result;
import com.certificate.verification.entity.Student;
import com.certificate.verification.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final CertificateRepository certificateRepository;
    private final CertificateHashService certificateHashService;
    private final BlockchainService blockchainService;

    /**
     * Public certificate verification method.
     * Reconstructs the canonical string from database data, recalculates the SHA-256 hash,
     * queries the blockchain for the original immutable hash, and performs a cryptographic comparison.
     */
    @Transactional(readOnly = true)
    public VerificationResponseDto verifyCertificate(String verificationId) {
        log.info("Starting cryptographic verification for verificationId: {}", verificationId);

        String trimmedVerId = verificationId != null ? verificationId.trim() : "";

        // 1 & 2. Find certificate in PostgreSQL
        Optional<Certificate> certOpt = certificateRepository.findByVerificationId(trimmedVerId);
        if (certOpt.isEmpty()) {
            log.warn("Verification failed: Certificate with verificationId '{}' not found in database", trimmedVerId);
            return VerificationResponseDto.builder()
                    .valid(false)
                    .verificationId(trimmedVerId)
                    .message("Certificate not found in database records.")
                    .build();
        }

        Certificate certificate = certOpt.get();
        Student student = certificate.getStudent();
        Result result = certificate.getResult();

        if (student == null || result == null) {
            log.warn("Corrupt database record for certificate: student or result is null");
            return VerificationResponseDto.builder()
                    .valid(false)
                    .verificationId(trimmedVerId)
                    .certificateId(certificate.getCertificateId())
                    .message("Certificate records are incomplete or corrupted.")
                    .build();
        }

        // 3, 4, 5. Reconstruct canonical string and recalculate SHA-256 hash
        String regeneratedHash = certificateHashService.generateCertificateHash(
                student.getStudentId(),
                student.getName(),
                student.getCourse(),
                student.getBranch(),
                student.getAcademicYear(),
                result.getSemester(),
                result.getCgpa(),
                result.getResultStatus()
        );

        log.info("Recalculated SHA-256 hash: {}", regeneratedHash);

        // 6 & 7. Query blockchain for original on-chain hash
        Optional<BlockchainCertificateRecord> onChainOpt = blockchainService.getCertificate(trimmedVerId);
        if (onChainOpt.isEmpty()) {
            log.warn("Verification failed: Verification ID '{}' not found on blockchain", trimmedVerId);
            return VerificationResponseDto.builder()
                    .valid(false)
                    .verificationId(trimmedVerId)
                    .certificateId(certificate.getCertificateId())
                    .studentId(student.getStudentId())
                    .studentName(student.getName())
                    .course(student.getCourse())
                    .branch(student.getBranch())
                    .academicYear(student.getAcademicYear())
                    .semester(result.getSemester())
                    .cgpa(result.getCgpa())
                    .resultStatus(result.getResultStatus())
                    .generatedHash(regeneratedHash)
                    .blockchainHash(null)
                    .transactionHash(certificate.getTransactionHash())
                    .blockNumber(certificate.getBlockNumber())
                    .issuedAt(certificate.getIssuedAt())
                    .message("Certificate record not found on blockchain. Verification cannot proceed.")
                    .build();
        }

        BlockchainCertificateRecord onChainRecord = onChainOpt.get();
        String blockchainHash = onChainRecord.getCertificateHash();
        log.info("Retrieved on-chain hash: {}", blockchainHash);

        // 8. Cryptographic hash comparison: regeneratedHash vs blockchainHash
        boolean isAuthentic = regeneratedHash.equalsIgnoreCase(blockchainHash);

        if (isAuthentic) {
            log.info("VERIFICATION SUCCESS: Hashes MATCH for verificationId: {}", trimmedVerId);
            return VerificationResponseDto.builder()
                    .valid(true)
                    .verificationId(trimmedVerId)
                    .certificateId(certificate.getCertificateId())
                    .studentId(student.getStudentId())
                    .studentName(student.getName())
                    .course(student.getCourse())
                    .branch(student.getBranch())
                    .academicYear(student.getAcademicYear())
                    .semester(result.getSemester())
                    .cgpa(result.getCgpa())
                    .resultStatus(result.getResultStatus())
                    .generatedHash(regeneratedHash)
                    .blockchainHash(blockchainHash)
                    .transactionHash(certificate.getTransactionHash())
                    .blockNumber(certificate.getBlockNumber())
                    .issuedAt(certificate.getIssuedAt())
                    .message("Certificate is authentic and has not been tampered with.")
                    .build();
        } else {
            log.warn("VERIFICATION FAILED: Tampering detected! Hash mismatch. Regenerated: {} vs Blockchain: {}",
                    regeneratedHash, blockchainHash);
            return VerificationResponseDto.builder()
                    .valid(false)
                    .verificationId(trimmedVerId)
                    .certificateId(certificate.getCertificateId())
                    .studentId(student.getStudentId())
                    .studentName(student.getName())
                    .course(student.getCourse())
                    .branch(student.getBranch())
                    .academicYear(student.getAcademicYear())
                    .semester(result.getSemester())
                    .cgpa(result.getCgpa())
                    .resultStatus(result.getResultStatus())
                    .generatedHash(regeneratedHash)
                    .blockchainHash(blockchainHash)
                    .transactionHash(certificate.getTransactionHash())
                    .blockNumber(certificate.getBlockNumber())
                    .issuedAt(certificate.getIssuedAt())
                    .message("Certificate data has been modified or does not match the blockchain record.")
                    .build();
        }
    }
}
