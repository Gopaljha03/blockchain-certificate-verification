package com.certificate.verification.blockchain;

import com.certificate.verification.exception.BlockchainException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthBlockNumber;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.response.PollingTransactionReceiptProcessor;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class Web3jBlockchainServiceImpl implements BlockchainService {

    private final BlockchainProperties blockchainProperties;

    private Web3j web3j;
    private Credentials credentials;

    @PostConstruct
    public void init() {
        try {
            log.info("Initializing Web3j connection to RPC URL: {}", blockchainProperties.getRpcUrl());
            this.web3j = Web3j.build(new HttpService(blockchainProperties.getRpcUrl()));
            if (blockchainProperties.getPrivateKey() != null && !blockchainProperties.getPrivateKey().isBlank()) {
                this.credentials = Credentials.create(blockchainProperties.getPrivateKey());
                log.info("Blockchain credentials loaded successfully. Signer address: {}", credentials.getAddress());
            } else {
                log.warn("No private key provided in blockchain properties.");
            }
        } catch (Exception e) {
            log.error("Failed to initialize Web3j: {}", e.getMessage(), e);
        }
    }

    private Web3j getWeb3j() {
        if (this.web3j == null) {
            this.web3j = Web3j.build(new HttpService(blockchainProperties.getRpcUrl()));
        }
        return this.web3j;
    }

    private Credentials getCredentials() {
        if (this.credentials == null) {
            this.credentials = Credentials.create(blockchainProperties.getPrivateKey());
        }
        return this.credentials;
    }

    @Override
    public BlockchainTransactionResult issueCertificate(String verificationId, String certificateHash) {
        log.info("Sending certificate hash to blockchain. VerificationId: {}, Hash: {}", verificationId, certificateHash);
        try {
            Web3j client = getWeb3j();
            Credentials signer = getCredentials();

            // Prepare smart contract function: issueCertificate(string, string)
            Function function = new Function(
                    "issueCertificate",
                    Arrays.asList(new Utf8String(verificationId), new Utf8String(certificateHash)),
                    Collections.emptyList()
            );

            String encodedFunction = FunctionEncoder.encode(function);
            BigInteger gasPrice = BigInteger.valueOf(blockchainProperties.getGasPrice());
            BigInteger gasLimit = BigInteger.valueOf(blockchainProperties.getGasLimit());

            // Fetch chainId dynamically from connected node (e.g. 31337 for Hardhat)
            long chainId = client.ethChainId().send().getChainId().longValue();

            RawTransactionManager txManager = new RawTransactionManager(client, signer, chainId);
            EthSendTransaction sendTx = txManager.sendTransaction(
                    gasPrice,
                    gasLimit,
                    blockchainProperties.getContractAddress(),
                    encodedFunction,
                    BigInteger.ZERO
            );

            if (sendTx.hasError()) {
                String errorMsg = sendTx.getError().getMessage();
                log.error("Blockchain transaction error: {}", errorMsg);
                throw new BlockchainException("Blockchain transaction rejected: " + errorMsg);
            }

            String txHash = sendTx.getTransactionHash();
            log.info("Transaction broadcasted with hash: {}. Waiting for receipt...", txHash);

            // Wait for receipt (polling every 1000ms for up to 30 attempts)
            PollingTransactionReceiptProcessor receiptProcessor =
                    new PollingTransactionReceiptProcessor(client, 1000, 30);
            TransactionReceipt receipt = receiptProcessor.waitForTransactionReceipt(txHash);

            if (!receipt.isStatusOK()) {
                log.error("Transaction {} reverted on-chain. Status: {}", txHash, receipt.getStatus());
                throw new BlockchainException("Smart contract transaction reverted on-chain. Verification ID may already exist.");
            }

            Long blockNumber = receipt.getBlockNumber() != null ? receipt.getBlockNumber().longValue() : null;
            log.info("Transaction confirmed in block {}. Gas used: {}", blockNumber, receipt.getGasUsed());

            return BlockchainTransactionResult.builder()
                    .transactionHash(txHash)
                    .blockNumber(blockNumber)
                    .status("CONFIRMED")
                    .gasUsed(receipt.getGasUsed() != null ? receipt.getGasUsed().toString() : "0")
                    .build();

        } catch (BlockchainException be) {
            throw be;
        } catch (Exception e) {
            log.error("Failed to execute issueCertificate on blockchain: {}", e.getMessage(), e);
            throw new BlockchainException("Blockchain service temporarily unavailable: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<BlockchainCertificateRecord> getCertificate(String verificationId) {
        log.info("Querying blockchain for verification ID: {}", verificationId);
        try {
            Web3j client = getWeb3j();
            Credentials signer = getCredentials();

            // Prepare function: getCertificate(string) returns (string, string, uint256, address)
            Function function = new Function(
                    "getCertificate",
                    Collections.singletonList(new Utf8String(verificationId)),
                    Arrays.asList(
                            new TypeReference<Utf8String>() {},
                            new TypeReference<Utf8String>() {},
                            new TypeReference<Uint256>() {},
                            new TypeReference<Address>() {}
                    )
            );

            String encodedFunction = FunctionEncoder.encode(function);
            EthCall ethCall = client.ethCall(
                    Transaction.createEthCallTransaction(
                            signer.getAddress(),
                            blockchainProperties.getContractAddress(),
                            encodedFunction
                    ),
                    DefaultBlockParameterName.LATEST
            ).send();

            if (ethCall.hasError()) {
                log.warn("Blockchain ethCall error for verificationId {}: {}", verificationId, ethCall.getError().getMessage());
                return Optional.empty();
            }

            String value = ethCall.getValue();
            // Empty result or revert returns "0x"
            if (value == null || value.equals("0x") || value.isEmpty()) {
                log.warn("Empty response from contract for verificationId {}", verificationId);
                return Optional.empty();
            }

            List<Type> decoded = FunctionReturnDecoder.decode(value, function.getOutputParameters());
            if (decoded.size() < 4) {
                log.warn("Decoded return parameters length is {} for verificationId {}", decoded.size(), verificationId);
                return Optional.empty();
            }

            String retVerId = ((Utf8String) decoded.get(0)).getValue();
            String certHash = ((Utf8String) decoded.get(1)).getValue();
            BigInteger timestamp = ((Uint256) decoded.get(2)).getValue();
            String issuer = ((Address) decoded.get(3)).getValue();

            return Optional.of(BlockchainCertificateRecord.builder()
                    .verificationId(retVerId)
                    .certificateHash(certHash)
                    .timestamp(timestamp)
                    .issuer(issuer)
                    .build());

        } catch (Exception e) {
            log.error("Failed to retrieve certificate from blockchain: {}", e.getMessage(), e);
            throw new BlockchainException("Unable to query blockchain: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean certificateExists(String verificationId) {
        try {
            Web3j client = getWeb3j();
            Credentials signer = getCredentials();

            Function function = new Function(
                    "certificateExists",
                    Collections.singletonList(new Utf8String(verificationId)),
                    Collections.singletonList(new TypeReference<Bool>() {})
            );

            String encodedFunction = FunctionEncoder.encode(function);
            EthCall ethCall = client.ethCall(
                    Transaction.createEthCallTransaction(
                            signer.getAddress(),
                            blockchainProperties.getContractAddress(),
                            encodedFunction
                    ),
                    DefaultBlockParameterName.LATEST
            ).send();

            if (ethCall.hasError() || ethCall.getValue() == null || ethCall.getValue().equals("0x")) {
                return false;
            }

            List<Type> decoded = FunctionReturnDecoder.decode(ethCall.getValue(), function.getOutputParameters());
            if (!decoded.isEmpty() && decoded.get(0) instanceof Bool) {
                return ((Bool) decoded.get(0)).getValue();
            }
            return false;
        } catch (Exception e) {
            log.warn("Failed to check certificateExists for {}: {}", verificationId, e.getMessage());
            return false;
        }
    }

    @Override
    public boolean isConnected() {
        try {
            EthBlockNumber blockNumber = getWeb3j().ethBlockNumber().send();
            return blockNumber != null && blockNumber.getBlockNumber() != null;
        } catch (Exception e) {
            log.debug("Blockchain connection check failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public Long getLatestBlockNumber() {
        try {
            EthBlockNumber blockNumber = getWeb3j().ethBlockNumber().send();
            return blockNumber.getBlockNumber().longValue();
        } catch (Exception e) {
            log.debug("Unable to fetch latest block number: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public String getContractAddress() {
        return blockchainProperties.getContractAddress();
    }

    @Override
    public String getRpcUrl() {
        return blockchainProperties.getRpcUrl();
    }
}
