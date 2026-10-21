package com.certificate.verification.repository;

import com.certificate.verification.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByVerificationId(String verificationId);
    Optional<Certificate> findByCertificateId(String certificateId);
    boolean existsByVerificationId(String verificationId);
    boolean existsByCertificateId(String certificateId);
    List<Certificate> findByStudentId(Long studentId);
}
