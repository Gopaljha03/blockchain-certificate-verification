# Blockchain-Based Academic Certificate Verification System

An enterprise-grade, cryptographically secure academic credential management and verification platform inspired by academic research in distributed ledger technology.

The system empowers educational institutions to issue tamper-proof academic certificates whose cryptographic integrity is anchored directly to an Ethereum-compatible Solidity smart contract. Anyone can instantly verify a certificate's authenticity through a public portal or by scanning a dynamic QR code without needing an account.

---

## 1. Project Overview

Academic certificate fraud and transcript alteration present major challenges for employers, universities, and verification agencies. This project addresses this vulnerability using a **hybrid cryptographic architecture**:

1. High-volume student profiles and detailed records are maintained efficiently in **PostgreSQL**.
2. An invariant, deterministic **canonical string** is constructed from student and academic outcome data.
3. A **SHA-256 cryptographic digest** (the integrity fingerprint) is calculated using Java's standard cryptographic engine.
4. The fingerprint and verification ID are permanently committed to an **EVM smart contract** running on a local **Hardhat node**.
5. During verification, the system **reconstructs the canonical string**, **recalculates the SHA-256 hash**, queries the blockchain, and performs a byte-by-byte comparison.
6. If the database record was altered in any way (e.g. altering CGPA from 8.7 to 9.7), the recalculated hash mismatches the immutable blockchain record, immediately triggering **INVALID / TAMPERED**.

---

## 2. Core Features (The 5 Pillars)

| # | Feature | Description |
|---|---|---|
| 1 | **Admin Login & Role-Based Access Control** | Secure authentication powered by Spring Security, BCrypt password hashing, and stateless JWT Bearer tokens. Protects administrative CRUD operations while keeping verification completely public. |
| 2 | **Student, Result & Certificate Management** | Full lifecycle management: student enrollment, semester grade evaluation (CGPA, PASS/FAIL), and certificate issuance with relational integrity. |
| 3 | **SHA-256 Canonical Hashing** | Strict, deterministic canonicalization format (`studentId\|name\|course\|branch\|academicYear\|semester\|cgpa\|resultStatus`) hashed using SHA-256 to ensure exact reproducibility across creation and verification. |
| 4 | **Blockchain Hash Storage (Solidity + Hardhat)** | Gas-optimized smart contract (`CertificateVerification.sol`) with overwrite protection and event emission deployed on a local Hardhat node. |
| 5 | **Certificate Verification + QR Code** | Zero-login public verification portal. Real-time cryptographic recalculation and comparison against on-chain data. Dynamic high-resolution QR codes that resolve directly to the public verification URL. |

---

## 3. Technology Stack

### Backend
- **Java:** OpenJDK 21 LTS
- **Framework:** Spring Boot 3.3.4
- **Security:** Spring Security 6, JJWT (io.jsonwebtoken 0.12.6), BCrypt
- **Persistence:** Spring Data JPA / Hibernate
- **Database:** PostgreSQL 18
- **Blockchain Integration:** Web3j 4.10.3 (JSON-RPC over HTTP)
- **QR Generation:** Google ZXing 3.5.3
- **Build Tool:** Apache Maven 3.9+
- **Testing:** JUnit 5, Mockito, Spring Boot MockMvc, H2 In-Memory DB

### Blockchain
- **Smart Contract Language:** Solidity ^0.8.20
- **EVM Development Environment:** Hardhat 2.22+
- **EVM Libraries:** `@nomicfoundation/hardhat-toolbox`, `ethers.js`
- **Network:** Local Hardhat Node (`http://127.0.0.1:8545`, Chain ID: 31337)

### Frontend
- **Library:** React 18
- **Bundler & Server:** Vite 5
- **Routing:** React Router DOM 6
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **QR Rendering:** `qrcode.react`
- **Styling:** Custom Academic Design System with Print Stylesheets

---

## 4. Project Structure

```
blockChainProject/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/certificate/verification/
│   │   │   │   ├── blockchain/          # Web3j integration & properties
│   │   │   │   ├── config/              # SecurityConfig & CORS
│   │   │   │   ├── controller/          # REST API endpoints
│   │   │   │   ├── dto/                 # Request & Response DTOs
│   │   │   │   ├── entity/              # JPA Entities (User, Student, Result, Certificate)
│   │   │   │   ├── exception/           # Global exception handler & error response
│   │   │   │   ├── repository/          # Spring Data JPA Repositories
│   │   │   │   ├── security/            # JWT service & Auth filter
│   │   │   │   ├── service/             # Business logic & Canonical Hash service
│   │   │   │   └── util/                # ZXing QR code generator
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application-test.properties
│   │   └── test/                        # 18 JUnit & MockMvc integration tests
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/                  # Navbar, Sidebar, AdminLayout, CertificateTemplate
│   │   ├── context/                     # AuthContext (JWT session state)
│   │   ├── pages/                       # Login, Dashboard, Students, Results, Issue, Details, Verify
│   │   ├── services/                    # Axios API client
│   │   ├── App.jsx
│   │   ├── index.css                    # Professional responsive stylesheet
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── blockchain/
│   ├── contracts/
│   │   └── CertificateVerification.sol  # Solidity smart contract
│   ├── scripts/
│   │   └── deploy.js                    # Contract deployment script
│   ├── test/
│   │   └── CertificateVerification.test.js # Smart contract unit tests
│   ├── hardhat.config.cjs
│   └── package.json
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   └── api.md
│
├── API_DOCUMENTATION.md
├── .env.example
├── .gitignore
└── README.md
```

---

## 5. Database Design

Four core relational tables:

1. **`users`**: Administrative authentication credentials (`id`, `username`, `password` [BCrypt], `role`, `created_at`).
2. **`students`**: Student records (`id`, `student_id` [Unique Roll No], `name`, `email`, `course`, `branch`, `academic_year`, `created_at`, `updated_at`).
3. **`results`**: Semester evaluations (`id`, `student_id` [FK], `semester`, `cgpa`, `result_status` [PASS/FAIL], `created_at`).
4. **`certificates`**: Issued credentials (`id`, `certificate_id` [Unique], `verification_id` [Unique], `student_id` [FK], `result_id` [FK], `certificate_hash` [SHA-256], `transaction_hash`, `block_number`, `issued_at`).

See [`docs/database.md`](docs/database.md) for full schema details and constraints.

---

## 6. Smart Contract: `CertificateVerification.sol`

The Solidity smart contract stores only the minimum cryptographic proof required for verification:
- `verificationId` (e.g. `VER-2027-XXXXXXXX`)
- `certificateHash` (64-character SHA-256 hex string)
- `timestamp` (Block timestamp of issuance)
- `issuer` (Ethereum address of the administrator who signed the transaction)

### Overwrite Protection
The contract prevents accidental overwriting of an existing certificate:
```solidity
require(!exists[_verificationId], "Certificate already issued for this verification ID");
```

---

## 7. Step-by-Step Local Setup & Execution

### Prerequisites
- **Java 21 LTS**
- **Node.js (v18+) & npm**
- **Maven 3.9+**
- **PostgreSQL 18**

---

### Step 1: Start PostgreSQL & Create Database
Open PostgreSQL terminal (`psql`) or pgAdmin and run:
```sql
CREATE DATABASE cert_db;
```
Ensure your credentials match `backend/src/main/resources/application.properties` (default: user `postgres`, password `postgres` or set via `DB_PASSWORD`).

---

### Step 2: Start Local Hardhat Blockchain Node
Open a new terminal window in the `blockchain/` folder:
```powershell
cd blockchain
npm install
npm run node
```
This launches a local EVM blockchain running at `http://127.0.0.1:8545` with 20 pre-funded test accounts (10,000 ETH each).

---

### Step 3: Compile & Deploy Smart Contract
In a second terminal window in the `blockchain/` folder:
```powershell
cd blockchain
npm run deploy:local
```
Output:
```
==================================================
Deploying CertificateVerification smart contract...
==================================================
Deploying from account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
>> CertificateVerification deployed successfully!
>> Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
==================================================
```
The contract address `0x5FbDB2315678afecb367f032d93F642f64180aa3` is already configured by default in `application.properties`.

---

### Step 4: Run Smart Contract Tests
To verify all contract test cases:
```powershell
cd blockchain
npm test
```
Result: `4 passing (3s)`

---

### Step 5: Start Spring Boot Backend
Open a third terminal window in the `backend/` folder:
```powershell
cd backend
mvn spring-boot:run
```
*(Or use the IDEA / system Maven command).*
The backend starts at `http://localhost:8080`.
On first launch, it automatically seeds the default administrator account:
- **Username:** `admin`
- **Password:** `admin123`

To run all 18 backend automated tests:
```powershell
cd backend
mvn test
```
Result: `Tests run: 18, Failures: 0, Errors: 0, Skipped: 0`

---

### Step 6: Start React Frontend
Open a fourth terminal window in the `frontend/` folder:
```powershell
cd frontend
npm install
npm run dev
```
The application opens at `http://localhost:5173`.

---

## 8. End-to-End Workflow & Verification

1. Open `http://localhost:5173`.
2. Login with credentials: `admin` / `admin123`.
3. Go to **Students** -> Click **Add Student** -> Fill in details (e.g. ID `GU2027CS001`, Name `Gopal Kumar`).
4. Go to **Academic Results** -> Click **Add Academic Result** -> Select the student, enter Semester `8`, CGPA `8.7`, Status `PASS`.
5. Go to **Issue Certificate** -> Select the student and result -> Preview the canonical string -> Click **Generate Hash & Issue Certificate**.
6. The backend computes the SHA-256 hash, signs a transaction to the Hardhat node, records the transaction hash and block number, and generates a QR code.
7. Click **View & Print Official Certificate** to see the certificate complete with gold seal, QR code, and signatures.
8. Click **Verify Live** or open `http://localhost:5173/verify/<verificationId>` in an incognito window without logging in.
9. Result:
   ```
   ✓ CERTIFICATE VERIFIED & AUTHENTIC
   ✓ Recalculated SHA-256 Hash matches Immutable Blockchain Hash!
   ```

---

## 9. Live Tampering Demonstration (Research Concept)

The system includes a dedicated demonstration mechanism to illustrate why blockchain verification is tamper-proof:

1. In the Admin Portal, navigate to **Issued Certificates** or open any certificate detail page.
2. Click the orange **Simulate DB Tamper (Demo)** button.
3. This modifies the student's CGPA in PostgreSQL (e.g., from `8.7` to `9.9`) **without modifying the blockchain**.
4. Now click **Verify Certificate** or re-scan the QR code.
5. The public verification endpoint recalculates the SHA-256 hash from the current database data and retrieves the original hash from the blockchain:
   ```
   Recalculated SHA-256 Hash:  9b12a88c... (calculated from altered DB CGPA 9.9)
   Blockchain Immutable Hash:  66c59ce5... (recorded on-chain during issuance)
   
   Result:
   ✗ VERIFICATION FAILED / TAMPERED
   Certificate data has been modified or does not match the blockchain record!
   ```
6. This provides undeniable cryptographic proof of data alteration for presentations and academic reviews!

---

## 10. Connecting MetaMask (Optional)

To inspect transactions in MetaMask:
1. Open MetaMask -> **Add Network** -> **Add Network Manually**.
2. **Network Name:** Hardhat Localhost
3. **RPC URL:** `http://127.0.0.1:8545`
4. **Chain ID:** `31337`
5. **Currency Symbol:** ETH
6. Import Account #0 using private key:
   `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
7. You will see the 10,000 ETH test balance and contract deployment transactions.

---

## 11. Known Limitations & Future Enhancements

- **IPFS Integration:** Decentralized storage for downloadable PDF certificate artifacts.
- **Multi-Signature Issuance:** Requiring multiple academic deans to sign before contract commitment.
- **Certificate Revocation Registry:** Adding an on-chain revocation mapping for canceled credentials.

---

## 12. License & Academic Attribution
Developed for research and educational purposes in blockchain integrity and academic credential verification.
