package com.certificate.verification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "certificate_id", nullable = false, unique = true, length = 64)
    private String certificateId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    @ToString.Exclude
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "result_id")
    @ToString.Exclude
    private Result result;

    @Column(name = "verification_id", nullable = false, unique = true, length = 64)
    private String verificationId;

    @Column(name = "certificate_hash", nullable = false, length = 128)
    private String certificateHash;

    @Column(name = "transaction_hash", nullable = false, length = 128)
    private String transactionHash;

    @Column(name = "block_number")
    private Long blockNumber;

    @CreationTimestamp
    @Column(name = "issued_at", nullable = false, updatable = false)
    private LocalDateTime issuedAt;
}
