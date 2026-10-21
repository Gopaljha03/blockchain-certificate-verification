package com.certificate.verification.service;

import com.certificate.verification.blockchain.BlockchainService;
import com.certificate.verification.dto.DashboardStatsDto;
import com.certificate.verification.repository.CertificateRepository;
import com.certificate.verification.repository.ResultRepository;
import com.certificate.verification.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final StudentRepository studentRepository;
    private final ResultRepository resultRepository;
    private final CertificateRepository certificateRepository;
    private final BlockchainService blockchainService;

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long students = studentRepository.count();
        long results = resultRepository.count();
        long certificates = certificateRepository.count();

        boolean connected = blockchainService.isConnected();
        Long latestBlock = connected ? blockchainService.getLatestBlockNumber() : null;

        return DashboardStatsDto.builder()
                .totalStudents(students)
                .totalResults(results)
                .totalCertificates(certificates)
                .blockchainConnected(connected)
                .contractAddress(blockchainService.getContractAddress())
                .latestBlockNumber(latestBlock)
                .rpcUrl(blockchainService.getRpcUrl())
                .build();
    }
}
