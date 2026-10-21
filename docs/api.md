# API Endpoints Quick Reference

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Admin login, returns JWT token |
| `GET` | `/api/students` | Admin | Get all enrolled students |
| `POST` | `/api/students` | Admin | Register new student |
| `GET` | `/api/students/{id}` | Admin | Get student by database ID |
| `PUT` | `/api/students/{id}` | Admin | Update student details |
| `DELETE` | `/api/students/{id}` | Admin | Delete student record |
| `GET` | `/api/results` | Admin | Get all academic results |
| `POST` | `/api/results` | Admin | Record semester result & CGPA |
| `GET` | `/api/results/student/{studentId}` | Admin | Get all results for a student |
| `POST` | `/api/certificates/issue` | Admin | Hash & Anchor certificate to Blockchain |
| `GET` | `/api/certificates` | Admin | List all issued certificates |
| `GET` | `/api/certificates/{id}` | Admin | Get certificate details & QR code |
| `GET` | `/api/certificates/qr/{verificationId}` | Public | Stream raw PNG QR Code image |
| `POST` | `/api/certificates/tamper-demo/{id}` | Admin | Simulate DB tamper for live presentation |
| `GET` | `/api/verify/{verificationId}` | **Public** | **Recalculates hash & verifies against Blockchain** |
| `GET` | `/api/dashboard/stats` | Admin | Dashboard summary counts & node health |

For full request/response schemas, see [API_DOCUMENTATION.md](../API_DOCUMENTATION.md).
