package com.certificate.verification.service;

import com.certificate.verification.dto.AddResultRequestDto;
import com.certificate.verification.dto.ResultDto;
import com.certificate.verification.entity.Result;
import com.certificate.verification.entity.Student;
import com.certificate.verification.exception.DuplicateResourceException;
import com.certificate.verification.exception.ResourceNotFoundException;
import com.certificate.verification.repository.ResultRepository;
import com.certificate.verification.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResultService {

    private final ResultRepository resultRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public ResultDto addResult(AddResultRequestDto dto) {
        log.info("Adding result for student ID: {}, semester: {}", dto.getStudentId(), dto.getSemester());

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + dto.getStudentId()));

        // Check if result for this semester already exists for this student
        resultRepository.findByStudentIdAndSemester(student.getId(), dto.getSemester())
                .ifPresent(existing -> {
                    throw new DuplicateResourceException(
                            "Result already exists for student " + student.getStudentId() + " semester " + dto.getSemester()
                    );
                });

        Result result = Result.builder()
                .student(student)
                .semester(dto.getSemester())
                .cgpa(dto.getCgpa())
                .resultStatus(dto.getResultStatus())
                .build();

        Result saved = resultRepository.save(result);
        log.info("Result saved successfully with ID: {}", saved.getId());
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ResultDto> getResultsByStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with ID: " + studentId);
        }
        return resultRepository.findByStudentId(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultDto> getAllResults() {
        return resultRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResultDto getResultById(Long id) {
        Result result = resultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with ID: " + id));
        return mapToDto(result);
    }

    public ResultDto mapToDto(Result result) {
        return ResultDto.builder()
                .id(result.getId())
                .studentId(result.getStudent().getId())
                .studentRollNo(result.getStudent().getStudentId())
                .studentName(result.getStudent().getName())
                .semester(result.getSemester())
                .cgpa(result.getCgpa())
                .resultStatus(result.getResultStatus())
                .createdAt(result.getCreatedAt())
                .build();
    }
}
