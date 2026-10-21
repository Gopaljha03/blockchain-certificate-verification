# Academic Certificate Verification System — API Documentation

This document describes the REST APIs exposed by the Spring Boot backend (`http://localhost:8080`).

---

## Base URL & Authentication

- **Base URL:** `http://localhost:8080/api`
- **Authentication Scheme:** Bearer Token (JWT) in HTTP header:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- **Public Endpoints (No Auth Required):**
  - `POST /api/auth/login`
  - `GET /api/verify/{verificationId}`
  - `GET /api/certificates/qr/{verificationId}`

---

## 1. Authentication APIs

### `POST /api/auth/login`
Authenticates administrative users and issues a JWT token.

- **Access:** Public
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "username": "admin",
      "role": "ADMIN"
    }
    ```
  - `401 Unauthorized`:
    ```json
    {
      "timestamp": "2026-10-14T20:45:00",
      "status": 401,
      "error": "Unauthorized",
      "message": "Invalid username or password",
      "path": "/api/auth/login"
    }
    ```

---

## 2. Student Management APIs (Admin Only)

### `POST /api/students`
Registers a new student.

- **Access:** `ADMIN` role required
- **Request Body:**
  ```json
  {
    "studentId": "GU2027CS001",
    "name": "Gopal Kumar",
    "email": "gopal@example.com",
    "course": "B.Tech",
    "branch": "CSE",
    "academicYear": 2027
  }
  ```
- **Responses:**
  - `201 Created`: Returns created `StudentDto`
  - `400 Bad Request`: Field validation error (e.g. invalid email format)
  - `409 Conflict`: Student ID or Email already exists

### `GET /api/students`
Lists all enrolled students.
- **Access:** `ADMIN`
- **Response:** `200 OK` with JSON array of `StudentDto` objects.

### `GET /api/students/{id}`
Retrieves a single student by database ID.
- **Access:** `ADMIN`
- **Response:** `200 OK` or `404 Not Found`.

### `PUT /api/students/{id}`
Updates details of an existing student.
- **Access:** `ADMIN`
- **Request Body:** Same as Add Student (excluding read-only `studentId`).
- **Response:** `200 OK` or `404 Not Found`.

### `DELETE /api/students/{id}`
Deletes a student and cascades to their results and certificates.
- **Access:** `ADMIN`
- **Response:** `200 OK`.

---

## 3. Academic Result Management APIs (Admin Only)

### `POST /api/results`
Records semester evaluation grades for a student.

- **Access:** `ADMIN`
- **Request Body:**
  ```json
  {
    "studentId": 1,
    "semester": 8,
    "cgpa": 8.7,
    "resultStatus": "PASS"
  }
  ```
- **Responses:**
  - `201 Created`: Returns recorded `ResultDto`
  - `400 Bad Request`: Invalid CGPA (must be 0.0 to 10.0) or invalid semester
  - `409 Conflict`: Result for this student and semester already exists

### `GET /api/results`
Returns all recorded academic semester results.
- **Access:** `ADMIN`
- **Response:** `200 OK`.

### `GET /api/results/student/{studentId}`
Returns all semester results recorded for a specific student.
- **Access:** `ADMIN`
- **Response:** `200 OK`.

---

## 4. Certificate Issuance & Management APIs (Admin Only)

### `POST /api/certificates/issue`
Issues an academic certificate, constructs the canonical data string, computes the SHA-256 cryptographic digest, commits the hash to the local Hardhat smart contract, generates a verification QR code, and saves the record in PostgreSQL.

- **Access:** `ADMIN`
- **Request Body:**
  ```json
  {
    "studentId": 1,
    "resultId": 10
  }
  ```
- **Issuance Pipeline:**
  1. Validates student and result existence and association.
  2. Constructs canonical certificate string:
     `studentId|name|course|branch|academicYear|semester|cgpa|resultStatus`
  3. Computes SHA-256 hash.
  4. Calls `CertificateVerification.sol:issueCertificate(verificationId, hash)`.
  5. Obtains blockchain transaction hash & block number.
  6. Stores in PostgreSQL `certificates` table.
- **Response:** `201 Created`:
  ```json
  {
    "id": 1,
    "certificateId": "CERT-2027-E4988F9A",
    "studentId": "GU2027CS001",
    "studentName": "Gopal Kumar",
    "course": "B.Tech",
    "branch": "CSE",
    "academicYear": 2027,
    "semester": 8,
    "cgpa": 8.7,
    "resultStatus": "PASS",
    "verificationId": "VER-2027-E4988F9A",
    "certificateHash": "66c59ce5e6570d318690938d76361eebe40b39677899eb80280ae310c1fa010d",
    "transactionHash": "0x3a4b9...",
    "blockNumber": 1,
    "issuedAt": "2026-10-14T20:55:00",
    "qrCodeBase64": "data:image/png;base64,...",
    "verificationUrl": "http://localhost:5173/verify/VER-2027-E4988F9A"
  }
  ```

### `GET /api/certificates`
Retrieves all issued certificates.
- **Access:** `ADMIN`
- **Response:** `200 OK`.

### `GET /api/certificates/{id}`
Retrieves a certificate by database ID.
- **Access:** `ADMIN`
- **Response:** `200 OK`.

### `GET /api/certificates/qr/{verificationId}`
Public endpoint rendering raw PNG QR code image.
- **Access:** Public
- **Response:** `200 OK` (`image/png`).

### `POST /api/certificates/tamper-demo/{id}`
Demonstration endpoint to simulate database tampering (altering student CGPA in PostgreSQL without modifying the blockchain).
- **Access:** `ADMIN`
- **Response:** `200 OK`.

---

## 5. Public Certificate Verification API (PUBLIC)

### `GET /api/verify/{verificationId}`
The primary public cryptographic verification endpoint. Does not require login.

- **Access:** **PUBLIC**
- **Process:**
  1. Fetches candidate certificate data from PostgreSQL.
  2. Rebuilds exact canonical string.
  3. Recalculates SHA-256 hash.
  4. Queries deployed smart contract `getCertificate(verificationId)` on Hardhat node.
  5. Cryptographically compares `recalculatedHash` vs `blockchainHash`.
- **Response — Valid Certificate (`200 OK`):**
  ```json
  {
    "valid": true,
    "verificationId": "VER-2027-E4988F9A",
    "certificateId": "CERT-2027-E4988F9A",
    "studentId": "GU2027CS001",
    "studentName": "Gopal Kumar",
    "course": "B.Tech",
    "branch": "CSE",
    "academicYear": 2027,
    "semester": 8,
    "cgpa": 8.7,
    "resultStatus": "PASS",
    "generatedHash": "66c59ce5e6570d318690938d76361eebe40b39677899eb80280ae310c1fa010d",
    "blockchainHash": "66c59ce5e6570d318690938d76361eebe40b39677899eb80280ae310c1fa010d",
    "transactionHash": "0x3a4b9...",
    "blockNumber": 1,
    "issuedAt": "2026-10-14T20:55:00",
    "message": "Certificate is authentic and has not been tampered with."
  }
  ```
- **Response — Tampered / Modified Certificate (`200 OK`):**
  ```json
  {
    "valid": false,
    "verificationId": "VER-2027-E4988F9A",
    "certificateId": "CERT-2027-E4988F9A",
    "studentId": "GU2027CS001",
    "studentName": "Gopal Kumar",
    "course": "B.Tech",
    "branch": "CSE",
    "academicYear": 2027,
    "semester": 8,
    "cgpa": 9.9,
    "resultStatus": "PASS",
    "generatedHash": "9b12a88...",
    "blockchainHash": "66c59ce5e6570d318690938d76361eebe40b39677899eb80280ae310c1fa010d",
    "transactionHash": "0x3a4b9...",
    "blockNumber": 1,
    "issuedAt": "2026-10-14T20:55:00",
    "message": "Certificate data has been modified or does not match the blockchain record."
  }
  ```
- **Response — Unknown Certificate (`200 OK`):**
  ```json
  {
    "valid": false,
    "verificationId": "UNKNOWN-ID",
    "message": "Certificate not found in database records."
  }
  ```

---

## 6. Dashboard Metrics API (Admin Only)

### `GET /api/dashboard/stats`
Returns aggregated count metrics and blockchain network status.
- **Access:** `ADMIN`
- **Response:** `200 OK`:
  ```json
  {
    "totalStudents": 1,
    "totalResults": 1,
    "totalCertificates": 1,
    "blockchainConnected": true,
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "latestBlockNumber": 2,
    "rpcUrl": "http://127.0.0.1:8545"
  }
  ```
