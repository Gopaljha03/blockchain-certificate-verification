package com.certificate.verification.service;

import com.certificate.verification.entity.ResultStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateHashService {

    private final HashService hashService;

    // Use consistent decimal format for CGPA across platforms (e.g. "8.7", "8.75")
    private static final DecimalFormat CGPA_FORMAT = new DecimalFormat("0.##", DecimalFormatSymbols.getInstance(Locale.US));

    /**
     * Builds canonical certificate string in strict order:
     * studentId|name|course|branch|academicYear|semester|cgpa|resultStatus
     * Example: GU2027CS001|Gopal Kumar|B.Tech|CSE|2027|8|8.7|PASS
     */
    public String buildCanonicalString(
            String studentId,
            String name,
            String course,
            String branch,
            Integer academicYear,
            Integer semester,
            Double cgpa,
            ResultStatus resultStatus
    ) {
        String formattedCgpa;
        synchronized (CGPA_FORMAT) {
            formattedCgpa = CGPA_FORMAT.format(cgpa);
        }

        String canonical = String.join("|",
                clean(studentId),
                clean(name),
                clean(course),
                clean(branch),
                String.valueOf(academicYear),
                String.valueOf(semester),
                formattedCgpa,
                resultStatus != null ? resultStatus.name() : ""
        );

        log.debug("Constructed canonical certificate string: {}", canonical);
        return canonical;
    }

    /**
     * Computes the SHA-256 hash for the given canonical certificate components.
     */
    public String generateCertificateHash(
            String studentId,
            String name,
            String course,
            String branch,
            Integer academicYear,
            Integer semester,
            Double cgpa,
            ResultStatus resultStatus
    ) {
        String canonical = buildCanonicalString(studentId, name, course, branch, academicYear, semester, cgpa, resultStatus);
        String hash = hashService.calculateSha256(canonical);
        log.info("Generated certificate hash: {} for student: {}", hash, studentId);
        return hash;
    }

    private String clean(String val) {
        return val != null ? val.trim() : "";
    }
}
