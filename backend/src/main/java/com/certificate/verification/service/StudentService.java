package com.certificate.verification.service;

import com.certificate.verification.dto.AddStudentRequestDto;
import com.certificate.verification.dto.StudentDto;
import com.certificate.verification.dto.UpdateStudentRequestDto;
import com.certificate.verification.entity.Student;
import com.certificate.verification.exception.DuplicateResourceException;
import com.certificate.verification.exception.ResourceNotFoundException;
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
public class StudentService {

    private final StudentRepository studentRepository;

    @Transactional
    public StudentDto createStudent(AddStudentRequestDto dto) {
        log.info("Creating student with ID: {}", dto.getStudentId());

        if (studentRepository.existsByStudentId(dto.getStudentId().trim())) {
            throw new DuplicateResourceException("Student with ID '" + dto.getStudentId() + "' already exists");
        }

        if (studentRepository.existsByEmail(dto.getEmail().trim().toLowerCase())) {
            throw new DuplicateResourceException("Student with email '" + dto.getEmail() + "' already exists");
        }

        Student student = Student.builder()
                .studentId(dto.getStudentId().trim().toUpperCase())
                .name(dto.getName().trim())
                .email(dto.getEmail().trim().toLowerCase())
                .course(dto.getCourse().trim())
                .branch(dto.getBranch().trim())
                .academicYear(dto.getAcademicYear())
                .build();

        Student saved = studentRepository.save(student);
        log.info("Student successfully created with ID: {}", saved.getId());
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<StudentDto> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        return mapToDto(student);
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentByRollNo(String studentId) {
        Student student = studentRepository.findByStudentId(studentId.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with Roll No: " + studentId));
        return mapToDto(student);
    }

    @Transactional
    public StudentDto updateStudent(Long id, UpdateStudentRequestDto dto) {
        log.info("Updating student with ID: {}", id);
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        // Check email uniqueness if email changed
        String updatedEmail = dto.getEmail().trim().toLowerCase();
        if (!student.getEmail().equalsIgnoreCase(updatedEmail) && studentRepository.existsByEmail(updatedEmail)) {
            throw new DuplicateResourceException("Email '" + updatedEmail + "' is already registered to another student");
        }

        student.setName(dto.getName().trim());
        student.setEmail(updatedEmail);
        student.setCourse(dto.getCourse().trim());
        student.setBranch(dto.getBranch().trim());
        student.setAcademicYear(dto.getAcademicYear());

        Student updated = studentRepository.save(student);
        log.info("Student ID {} successfully updated", id);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteStudent(Long id) {
        log.info("Deleting student with ID: {}", id);
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with ID: " + id);
        }
        studentRepository.deleteById(id);
        log.info("Student with ID {} deleted successfully", id);
    }

    public StudentDto mapToDto(Student student) {
        return StudentDto.builder()
                .id(student.getId())
                .studentId(student.getStudentId())
                .name(student.getName())
                .email(student.getEmail())
                .course(student.getCourse())
                .branch(student.getBranch())
                .academicYear(student.getAcademicYear())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .resultCount(student.getResults() != null ? student.getResults().size() : 0)
                .certificateCount(student.getCertificates() != null ? student.getCertificates().size() : 0)
                .build();
    }
}
