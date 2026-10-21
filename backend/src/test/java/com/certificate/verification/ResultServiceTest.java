package com.certificate.verification;

import com.certificate.verification.dto.AddResultRequestDto;
import com.certificate.verification.dto.ResultDto;
import com.certificate.verification.entity.Result;
import com.certificate.verification.entity.ResultStatus;
import com.certificate.verification.entity.Student;
import com.certificate.verification.exception.DuplicateResourceException;
import com.certificate.verification.repository.ResultRepository;
import com.certificate.verification.repository.StudentRepository;
import com.certificate.verification.service.ResultService;
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
public class ResultServiceTest {

    @Mock
    private ResultRepository resultRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private ResultService resultService;

    private Student mockStudent;
    private Result mockResult;
    private AddResultRequestDto addResultDto;

    @BeforeEach
    void setUp() {
        mockStudent = Student.builder()
                .id(1L)
                .studentId("GU2027CS001")
                .name("Gopal Kumar")
                .build();

        mockResult = Result.builder()
                .id(10L)
                .student(mockStudent)
                .semester(8)
                .cgpa(8.7)
                .resultStatus(ResultStatus.PASS)
                .build();

        addResultDto = AddResultRequestDto.builder()
                .studentId(1L)
                .semester(8)
                .cgpa(8.7)
                .resultStatus(ResultStatus.PASS)
                .build();
    }

    @Test
    @DisplayName("Should successfully add academic result for student")
    void testAddResultSuccess() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(resultRepository.findByStudentIdAndSemester(1L, 8)).thenReturn(Optional.empty());
        when(resultRepository.save(any(Result.class))).thenReturn(mockResult);

        ResultDto result = resultService.addResult(addResultDto);

        assertNotNull(result);
        assertEquals(8, result.getSemester());
        assertEquals(8.7, result.getCgpa());
        assertEquals(ResultStatus.PASS, result.getResultStatus());
        verify(resultRepository, times(1)).save(any(Result.class));
    }

    @Test
    @DisplayName("Should reject duplicate result for same student and semester")
    void testAddDuplicateResult() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(resultRepository.findByStudentIdAndSemester(1L, 8)).thenReturn(Optional.of(mockResult));

        assertThrows(DuplicateResourceException.class, () -> resultService.addResult(addResultDto));
        verify(resultRepository, never()).save(any(Result.class));
    }
}
