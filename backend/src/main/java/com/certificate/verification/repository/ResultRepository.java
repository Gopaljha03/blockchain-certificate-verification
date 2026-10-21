package com.certificate.verification.repository;

import com.certificate.verification.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByStudentId(Long studentId);
    List<Result> findByStudentStudentId(String studentId);
    Optional<Result> findByStudentIdAndSemester(Long studentId, Integer semester);
}
