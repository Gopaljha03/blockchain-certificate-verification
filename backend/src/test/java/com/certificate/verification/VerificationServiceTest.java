package com.certificate.verification;

import com.certificate.verification.blockchain.BlockchainCertificateRecord;
import com.certificate.verification.blockchain.BlockchainService;
import com.certificate.verification.dto.VerificationResponseDto;
import com.certificate.verification.entity.Certificate;
import com.certificate.verification.entity.Result;
import com.certificate.verification.entity.ResultStatus;
import com.certificate.verification.entity.Student;
import com.certificate.verification.repository.CertificateRepository;
import com.certificate.verification.service.CertificateHashService;
import com.certificate.verification.service.VerificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VerificationServiceTest {

    @Mock
    private CertificateRepository certificateRepository;

    @Mock
    private CertificateHashService certificateHashService;

    @Mock
    private BlockchainService blockchainService;

    @InjectMocks
    private VerificationService verificationService;

    private Student mockStudent;
    private Result mockResult;
    private Certificate mockCertificate;
    private final String validVerId = "VER-2027-000001";
    private final String validHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    private final String alteredHash = "8f91a6d45b78901234567890abcdef1234567890abcdef1234567890abcdef12";

    @BeforeEach
    void setUp() {
        mockStudent = Student.builder()
                .id(1L)
                .studentId("GU2027CS001")
                .name("Gopal Kumar")
                .course("B.Tech")
                .branch("CSE")
                .academicYear(2027)
                .build();

        mockResult = Result.builder()
                .id(10L)
                .student(mockStudent)
                .semester(8)
                .cgpa(8.7)
                .resultStatus(ResultStatus.PASS)
                .build();

        mockCertificate = Certificate.builder()
                .id(100L)
                .certificateId("CERT-2027-000001")
                .verificationId(validVerId)
                .certificateHash(validHash)
                .student(mockStudent)
                .result(mockResult)
                .transactionHash("0x123abc456def")
                .blockNumber(42L)
                .issuedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should return VALID when recalculated hash matches blockchain hash")
    void testVerifyCertificateSuccess() {
        when(certificateRepository.findByVerificationId(validVerId)).thenReturn(Optional.of(mockCertificate));
        when(certificateHashService.generateCertificateHash(
                "GU2027CS001", "Gopal Kumar", "B.Tech", "CSE", 2027, 8, 8.7, ResultStatus.PASS
        )).thenReturn(validHash);

        BlockchainCertificateRecord onChainRecord = BlockchainCertificateRecord.builder()
                .verificationId(validVerId)
                .certificateHash(validHash)
                .timestamp(BigInteger.valueOf(1700000000L))
                .issuer("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
                .build();
        when(blockchainService.getCertificate(validVerId)).thenReturn(Optional.of(onChainRecord));

        VerificationResponseDto response = verificationService.verifyCertificate(validVerId);

        assertTrue(response.isValid(), "Verification must return true when hashes match");
        assertEquals(validVerId, response.getVerificationId());
        assertEquals(validHash, response.getGeneratedHash());
        assertEquals(validHash, response.getBlockchainHash());
        assertTrue(response.getMessage().contains("authentic"));
    }

    @Test
    @DisplayName("Should return INVALID/TAMPERED when recalculated hash mismatches blockchain hash")
    void testVerifyCertificateTampered() {
        when(certificateRepository.findByVerificationId(validVerId)).thenReturn(Optional.of(mockCertificate));
        // Database data changed, producing altered hash
        when(certificateHashService.generateCertificateHash(
                "GU2027CS001", "Gopal Kumar", "B.Tech", "CSE", 2027, 8, 8.7, ResultStatus.PASS
        )).thenReturn(alteredHash);

        BlockchainCertificateRecord onChainRecord = BlockchainCertificateRecord.builder()
                .verificationId(validVerId)
                .certificateHash(validHash) // Blockchain retains original hash
                .timestamp(BigInteger.valueOf(1700000000L))
                .issuer("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
                .build();
        when(blockchainService.getCertificate(validVerId)).thenReturn(Optional.of(onChainRecord));

        VerificationResponseDto response = verificationService.verifyCertificate(validVerId);

        assertFalse(response.isValid(), "Verification must return false when hashes do not match");
        assertEquals(alteredHash, response.getGeneratedHash());
        assertEquals(validHash, response.getBlockchainHash());
        assertTrue(response.getMessage().contains("modified") || response.getMessage().contains("does not match"));
    }

    @Test
    @DisplayName("Should return INVALID when certificate ID is not in database")
    void testVerifyCertificateNotFoundInDb() {
        when(certificateRepository.findByVerificationId("UNKNOWN-ID")).thenReturn(Optional.empty());

        VerificationResponseDto response = verificationService.verifyCertificate("UNKNOWN-ID");

        assertFalse(response.isValid());
        assertTrue(response.getMessage().contains("not found"));
    }
}
