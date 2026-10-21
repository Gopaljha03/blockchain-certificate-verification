// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateVerification
 * @dev Smart contract for storing and verifying academic certificate integrity hashes.
 * Only the cryptographic SHA-256 fingerprint, verification identifier, issuer address,
 * and timestamp are stored on-chain to protect student privacy while guaranteeing tamper-evidence.
 */
contract CertificateVerification {

    struct CertificateRecord {
        string verificationId;
        string certificateHash;
        uint256 timestamp;
        address issuer;
    }

    // Mapping from unique verification ID to CertificateRecord
    mapping(string => CertificateRecord) private certificates;

    // Mapping to track if a verification ID already exists
    mapping(string => bool) private exists;

    // Total count of issued certificates on-chain
    uint256 public totalCertificates;

    // Owner / administrator of the smart contract
    address public owner;

    // Event emitted when a certificate hash is recorded
    event CertificateIssued(
        string indexed verificationId,
        string certificateHash,
        address indexed issuer,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Store a certificate hash associated with a unique verification ID.
     * @dev Prevents accidental overwriting of already issued certificates.
     * @param _verificationId Unique verification identifier (e.g. VER-2027-000001)
     * @param _certificateHash SHA-256 hash (64 hex characters) of canonical certificate data
     */
    function issueCertificate(
        string memory _verificationId,
        string memory _certificateHash
    ) external {
        require(bytes(_verificationId).length > 0, "Verification ID cannot be empty");
        require(bytes(_certificateHash).length == 64, "Certificate hash must be a valid 64-character SHA-256 hex string");
        require(!exists[_verificationId], "Certificate already issued for this verification ID");

        certificates[_verificationId] = CertificateRecord({
            verificationId: _verificationId,
            certificateHash: _certificateHash,
            timestamp: block.timestamp,
            issuer: msg.sender
        });

        exists[_verificationId] = true;
        totalCertificates += 1;

        emit CertificateIssued(_verificationId, _certificateHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Retrieve certificate hash and metadata by verification ID.
     * @param _verificationId The verification identifier to query.
     * @return verificationId The verification ID
     * @return certificateHash The SHA-256 hash recorded on blockchain
     * @return timestamp Block timestamp when the certificate was issued
     * @return issuer Address of the issuer who signed the transaction
     */
    function getCertificate(string memory _verificationId)
        external
        view
        returns (
            string memory verificationId,
            string memory certificateHash,
            uint256 timestamp,
            address issuer
        )
    {
        require(exists[_verificationId], "Certificate not found on blockchain");
        CertificateRecord memory cert = certificates[_verificationId];
        return (
            cert.verificationId,
            cert.certificateHash,
            cert.timestamp,
            cert.issuer
        );
    }

    /**
     * @notice Checks if a verification ID exists on blockchain.
     */
    function certificateExists(string memory _verificationId) external view returns (bool) {
        return exists[_verificationId];
    }
}
