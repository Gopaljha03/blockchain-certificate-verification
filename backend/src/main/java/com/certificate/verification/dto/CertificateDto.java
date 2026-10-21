package com.certificate.verification.dto;

import com.certificate.verification.entity.ResultStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateDto {
    private Long id;
    private String certificateId;
    private Long studentDatabaseId;
    private String studentId;
    private String studentName;
    private String email;
    private String course;
    private String branch;
    private Integer academicYear;
    private Integer semester;
    private Double cgpa;
    private ResultStatus resultStatus;
    private String verificationId;
    private String certificateHash;
    private String transactionHash;
    private Long blockNumber;
    private LocalDateTime issuedAt;
    private String qrCodeBase64;
    private String verificationUrl;
}
