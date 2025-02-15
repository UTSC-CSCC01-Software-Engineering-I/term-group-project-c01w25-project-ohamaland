# System Design Document (SDD)

## Ohama Land - Sprint 1

### 1. Introduction
This document provides an overview of the system design for Ohama Land, including the class structure, system interactions, architecture, and error handling mechanisms. Since the system is in early development, the design may undergo changes in future iterations.

### 2. CRC Cards (Class-Responsibility-Collaborator)
#### **Class Name: User**
- **Parent Class:** None  
- **Subclass:** Admin, RegularUser  
- **Responsibilities:**
  - Handle user authentication (login, logout, registration)
  - Store and retrieve user profile information
  - Implement role-based access control
- **Collaborators:**
  - Database (stores user data)
  - Authentication API (handles login requests)

#### **Class Name: Receipt**
- **Parent Class:** None  
- **Subclass:** None  
- **Responsibilities:**
  - Store receipt details (merchant, amount, currency, date, items, payment method, image URL)
  - Provide CRUD operations for receipts
- **Collaborators:**
  - User (Each receipt is linked to a user account)
  - Database (Stores receipt data)

#### **Class Name: Group**
- **Parent Class:** None  
- **Subclass:** None  
- **Responsibilities:**
  - Manage shared expenses among multiple users
  - Provide group creation, member addition, and expense tracking features
- **Collaborators:**
  - User (Each group consists of multiple users)
  - Receipt (Shared expenses are linked to receipts)

### 3. System Interaction with the Environment
The system is designed with the following assumptions and dependencies:
- **Operating System:** Linux/Windows/macOS
- **Programming Language:** Python (Django for backend), JavaScript (React for frontend)
- **Database:** PostgreSQL
- **Network Configuration:** Requires stable internet access

### 4. System Architecture
The system follows a modular architecture, dividing components into frontend, backend, and database layers.

#### **Components & Interactions:**
- **Frontend (React + MUI):** Sends API requests to the backend for authentication and receipt management.
- **Backend (Django + REST API):** Processes API requests, handles authentication, and performs CRUD operations.
- **Database (PostgreSQL):** Stores user, receipt, and group data.

**Architecture Diagram:**
(A diagram showing the interactions between these components will be generated in Draw.io and linked here.)

### 5. System Decomposition
The system consists of the following major modules:
- **User Module:** Handles authentication, profiles, and access control.
- **Receipt Module:** Manages user receipts, including storing images and financial data.
- **Group Module:** Enables users to form groups and manage shared expenses.

Each module interacts with the backend API and database to ensure data consistency.

### 6. Error Handling & Exception Strategy
| **Error Type**              | **Handling Strategy**                      |
|----------------------------|------------------------------------------|
| Invalid User Input         | Frontend validation, backend checks      |
| Network Failure           | Automatic retries, user notifications    |
| Database Connection Issues | Logs error, returns user-friendly message |
| Authentication Failure     | Displays login error, prevents unauthorized access |
| File Upload Errors        | Handled gracefully                        |

### 7. Conclusion
This document provides a high-level design overview of the Ohama Land system. Future iterations will refine these structures based on implementation feedback. The modular architecture ensures flexibility and scalability.
