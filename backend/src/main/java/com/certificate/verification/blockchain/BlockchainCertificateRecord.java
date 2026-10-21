package com.certificate.verification.blockchain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainCertificateRecord {
    private String verificationId;
    private String certificateHash;
    private BigInteger timestamp;
    private String issuer;
}
