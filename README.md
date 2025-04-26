Backend API for a health management system providing:
- Client CRUD operations
- Program management
- Enrollment tracking
- Reporting endpoints

## 🔌 API Endpoints

| Endpoint                | Method | Description                     |
|-------------------------|--------|---------------------------------|
| `/api/clients`          | GET    | Get all clients                |
| `/api/clients`          | POST   | Register new client            |
| `/api/programs`         | GET    | List all health programs       |
| `/api/enrollments`      | POST   | Enroll client in program       |
| `/api/reports/enrollments` | GET | Program enrollment statistics |

## 🛠️ Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/lmanyeki/CEMA-backend.git
   cd CEMA-backend
   ```