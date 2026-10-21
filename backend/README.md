# Backend Service — Academic Certificate Verification

Spring Boot 3.3.4 (Java 21) REST API service integrating with PostgreSQL 18 and Web3j for blockchain smart contract anchoring.

## Features
- **Spring Security 6 + JWT + BCrypt**
- **Canonical String & SHA-256 Hashing Engine**
- **Web3j JSON-RPC Hardhat Blockchain Client**
- **Google ZXing QR Code Engine**
- **Global Exception Handling with Standardized HTTP Responses**

## Running Locally

```powershell
mvn spring-boot:run
```

## Running Automated Tests

```powershell
mvn test
```
All 18 unit and integration tests run against an isolated H2 in-memory test database.
