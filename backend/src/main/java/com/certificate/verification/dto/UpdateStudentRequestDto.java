package com.certificate.verification.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStudentRequestDto {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Course is required")
    private String course;

    @NotBlank(message = "Branch is required")
    private String branch;

    @NotNull(message = "Academic year is required")
    @Min(value = 1990, message = "Academic year must be valid (>= 1990)")
    @Max(value = 2100, message = "Academic year must be valid (<= 2100)")
    private Integer academicYear;
}
