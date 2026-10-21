package com.certificate.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalStudents;
    private long totalResults;
    private long totalCertificates;
    private boolean blockchainConnected;
    private String contractAddress;
    private Long latestBlockNumber;
    private String rpcUrl;
}
