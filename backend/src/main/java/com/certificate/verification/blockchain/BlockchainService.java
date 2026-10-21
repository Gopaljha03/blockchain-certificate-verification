package com.certificate.verification.blockchain;

import java.util.Optional;

public interface BlockchainService {

    /**
     * Issues a certificate hash to the smart contract.
     *
     * @param verificationId Unique verification identifier
     * @param certificateHash 64-character hexadecimal SHA-256 hash
     * @return BlockchainTransactionResult containing tx hash and block number
     */
    BlockchainTransactionResult issueCertificate(String verificationId, String certificateHash);

    /**
     * Retrieves the certificate record stored on the blockchain.
     *
     * @param verificationId The verification ID to query
     * @return Optional containing the on-chain certificate record if found
     */
    Optional<BlockchainCertificateRecord> getCertificate(String verificationId);

    /**
     * Checks if the verification ID exists on blockchain.
     */
    boolean certificateExists(String verificationId);

    /**
     * Checks connectivity to the local blockchain node.
     */
    boolean isConnected();

    /**
     * Returns the latest block number on the blockchain.
     */
    Long getLatestBlockNumber();

    /**
     * Returns the configured contract address.
     */
    String getContractAddress();

    /**
     * Returns the RPC URL in use.
     */
    String getRpcUrl();
}
