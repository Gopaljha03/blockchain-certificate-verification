package com.certificate.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    private Long id;
    private String studentId;
    private String name;
    private String email;
    private String course;
    private String branch;
    private Integer academicYear;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int resultCount;
    private int certificateCount;
}
