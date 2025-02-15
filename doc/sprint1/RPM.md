# Release Planning Meeting (RPM)

## Date: 2025-02-03

## Participants:
- **RJ (Rhodwell Malicdem)**
- **AbdulRahman Mallisho (Mel)**
- **Hari Balamurali (Hari)**
- **Leo Liao (Leo)**
- **Mohamed Sbeinati (Ohama)**

## Release Goal:
The primary objective of this release is to deliver a **Minimum Viable Product (MVP)** that allows users to:
- Register
- Create and manage receipts
- Interact with the system through a functional UI

This release will focus on **backend infrastructure, frontend implementation, and database integration**.

## Scope:
### Epics / Key Features:
#### **User Authentication & Authorization**
- Implement secure user registration and login.
- Enable role-based access control.

#### **Receipts Management System**
- Users can create, view, and delete receipts.
- Implement receipt image upload functionality.

#### **Database & API Infrastructure**
- Integrate PostgreSQL for relational data storage.
- Develop RESTful API endpoints for user and receipt management.

#### **Frontend UI Development**
- Design core UI components (receipt display, sidebar, error handling pages).
- Implement receipt upload and editing functionality.

#### **Group Expense Tracking**
- Introduce functionality to split costs among users.
- Implement user group creation and management.

## Timeline & Milestones:
### **Sprint 1 (Feb 1 - Feb 14, 2025)**
- Backend setup
- API implementation
- Cost-Splitting feature
- Initial UI components

**Planned Release Date:** February 14, 2025

## Risks & Dependencies:
### **Technical Risks:**
- Potential delays due to database migration from MongoDB to PostgreSQL.
- Ensuring proper integration between frontend and backend.
- Dependency on backend API readiness for frontend integration.
- Ensuring security best practices for authentication and data storage.

### **External Dependencies:**
- PostgreSQL hosting service.

## Team Assignments & Responsibilities:
### **Backend Development:**
- **RJ & Mel** - Database implementation.

### **Frontend Development:**
- **Leo** - UI components and user experience.

### **Data Structures & Testing:**
- **Hari** - Data management and test case preparation.

### **Endpoint Design & Documentation:**
- **Ohama** - API design, API documentation, and CRUD operations.

### **Project Coordination:**
- **Ohama** - Managing sprint progress and communication.

## Next Steps:
1. Finalize the database schema and API documentation.
2. Develop and test core API functionalities.
3. Continue UI development and integrate with backend services.
4. Schedule regular standups to track progress and address blockers.
