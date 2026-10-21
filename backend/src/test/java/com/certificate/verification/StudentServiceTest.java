package com.certificate.verification;

import com.certificate.verification.dto.AddStudentRequestDto;
import com.certificate.verification.dto.StudentDto;
import com.certificate.verification.dto.UpdateStudentRequestDto;
import com.certificate.verification.entity.Student;
import com.certificate.verification.exception.DuplicateResourceException;
import com.certificate.verification.exception.ResourceNotFoundException;
import com.certificate.verification.repository.StudentRepository;
import com.certificate.verification.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    private Student mockStudent;
    private AddStudentRequestDto addStudentDto;

    @BeforeEach
    void setUp() {
        mockStudent = Student.builder()
                .id(1L)
                .studentId("GU2027CS001")
                .name("Gopal Kumar")
                .email("gopal@example.com")
                .course("B.Tech")
                .branch("CSE")
                .academicYear(2027)
                .build();

        addStudentDto = AddStudentRequestDto.builder()
                .studentId("GU2027CS001")
                .name("Gopal Kumar")
                .email("gopal@example.com")
                .course("B.Tech")
                .branch("CSE")
                .academicYear(2027)
                .build();
    }

    @Test
    @DisplayName("Should successfully create a new student")
    void testCreateStudentSuccess() {
        when(studentRepository.existsByStudentId("GU2027CS001")).thenReturn(false);
        when(studentRepository.existsByEmail("gopal@example.com")).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenReturn(mockStudent);

        StudentDto result = studentService.createStudent(addStudentDto);

        assertNotNull(result);
        assertEquals("GU2027CS001", result.getStudentId());
        assertEquals("Gopal Kumar", result.getName());
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    @DisplayName("Should reject duplicate student ID")
    void testCreateStudentDuplicateId() {
        when(studentRepository.existsByStudentId("GU2027CS001")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> studentService.createStudent(addStudentDto));
        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("Should retrieve student by ID")
    void testGetStudentById() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));

        StudentDto result = studentService.getStudentById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Gopal Kumar", result.getName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when student ID not found")
    void testGetStudentByIdNotFound() {
        when(studentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> studentService.getStudentById(999L));
    }

    @Test
    @DisplayName("Should successfully update student details")
    void testUpdateStudent() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(studentRepository.save(any(Student.class))).thenReturn(mockStudent);

        UpdateStudentRequestDto updateDto = UpdateStudentRequestDto.builder()
                .name("Gopal Kumar Updated")
                .email("gopal@example.com")
                .course("B.Tech")
                .branch("AI & DS")
                .academicYear(2027)
                .build();

        StudentDto updated = studentService.updateStudent(1L, updateDto);

        assertNotNull(updated);
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    @DisplayName("Should delete student when exists")
    void testDeleteStudent() {
        when(studentRepository.existsById(1L)).thenReturn(true);
        doNothing().when(studentRepository).deleteById(1L);

        assertDoesNotThrow(() -> studentService.deleteStudent(1L));
        verify(studentRepository, times(1)).deleteById(1L);
    }
}
