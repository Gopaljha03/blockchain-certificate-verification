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
public class ResultDto {
    private Long id;
    private Long studentId;
    private String studentRollNo;
    private String studentName;
    private Integer semester;
    private Double cgpa;
    private ResultStatus resultStatus;
    private LocalDateTime createdAt;
}
