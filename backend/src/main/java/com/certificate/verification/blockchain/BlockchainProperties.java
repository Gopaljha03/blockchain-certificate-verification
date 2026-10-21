package com.certificate.verification.blockchain;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "blockchain")
@Data
public class BlockchainProperties {
    /**
     * RPC URL for the local Ethereum-compatible network (Hardhat node default: http://127.0.0.1:8545)
     */
    private String rpcUrl = "http://127.0.0.1:8545";

    /**
     * Address of the deployed CertificateVerification smart contract
     */
    private String contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    /**
     * Private key for signing smart contract transactions (Hardhat Account #0 default)
     * Configurable via environment variable BLOCKCHAIN_PRIVATE_KEY
     */
    private String privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

    /**
     * Gas limit for smart contract transactions
     */
    private long gasLimit = 500000L;

    /**
     * Gas price in Wei (20 Gwei default)
     */
    private long gasPrice = 20_000_000_000L;
}
