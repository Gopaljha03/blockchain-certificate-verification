package com.certificate.verification;

import com.certificate.verification.entity.ResultStatus;
import com.certificate.verification.service.CertificateHashService;
import com.certificate.verification.service.HashService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class CertificateHashServiceTest {

    private CertificateHashService certificateHashService;
    private HashService hashService;

    @BeforeEach
    void setUp() {
        hashService = new HashService();
        certificateHashService = new CertificateHashService(hashService);
    }

    @Test
    @DisplayName("Should build exact canonical certificate string format")
    void testBuildCanonicalString() {
        String canonical = certificateHashService.buildCanonicalString(
                "GU2027CS001",
                "Gopal Kumar",
                "B.Tech",
                "CSE",
                2027,
                8,
                8.7,
                ResultStatus.PASS
        );

        assertEquals("GU2027CS001|Gopal Kumar|B.Tech|CSE|2027|8|8.7|PASS", canonical);
    }

    @Test
    @DisplayName("Should generate deterministic 64-character hex SHA-256 hash")
    void testGenerateCertificateHash() {
        String hash1 = certificateHashService.generateCertificateHash(
                "GU2027CS001", "Gopal Kumar", "B.Tech", "CSE", 2027, 8, 8.7, ResultStatus.PASS
        );

        String hash2 = certificateHashService.generateCertificateHash(
                "GU2027CS001", "Gopal Kumar", "B.Tech", "CSE", 2027, 8, 8.7, ResultStatus.PASS
        );

        assertNotNull(hash1);
        assertEquals(64, hash1.length());
        assertEquals(hash1, hash2, "Identical input data must generate identical SHA-256 hash");
    }

    @Test
    @DisplayName("Should generate completely different hash when single field (CGPA) changes (Tampering Detection)")
    void testTamperHashDifference() {
        String originalHash = certificateHashService.generateCertificateHash(
                "GU2027CS001", "Gopal Kumar", "B.Tech", "CSE", 2027, 8, 8.7, ResultStatus.PASS
        );

        String tamperedHash = certificateHashService.generateCertificateHash(
                "GU2027CS001", "Gopal Kumar", "B.Tech", "CSE", 2027, 8, 9.7, ResultStatus.PASS
        );

        assertNotEquals(originalHash, tamperedHash, "Altered CGPA must result in avalanche change in SHA-256 hash");
    }
}
