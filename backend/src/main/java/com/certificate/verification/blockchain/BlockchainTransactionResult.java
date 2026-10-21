package com.certificate.verification.blockchain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainTransactionResult {
    private String transactionHash;
    private Long blockNumber;
    private String status;
    private String gasUsed;
}
