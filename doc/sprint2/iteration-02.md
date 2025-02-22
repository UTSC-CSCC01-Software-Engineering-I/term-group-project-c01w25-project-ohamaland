# Ohama Land - Sprint 2 Planning

## Iteration 02
**Start Date:** February 19, 2025  
**End Date:** March 07, 2025  

---

## Process

### Roles & Responsibilities
- **RJ:** Backend cleanup, refining relational database structure, API refinements, Account Log in and Sign up.
- **Mel:** Add subscription tracking backend, notify group members and sync it between users, add subscription frontend.
- **Hari:** Ensure Uploading & Editing Calls the API Endpoint, implement graph on receipt spending.
- **Leo:** Sprint 1 cleanups, adding items to receipt display (implements tables and typing).
- **Ohama:** Working on receipt parsing with image recognition, managing sprint progress, ensuring backlog tasks are completed, and handling required documentation.

### Events
- **Daily Standup Meetings:** Online, held at 10 PM.  
  - *Purpose:* To review progress, discuss blockers, and plan next steps.
- **Code Review Sessions:** Conducted as needed on Discord.  
  - *Purpose:* To ensure high code quality before merging into the main branch.
- **Sprint Review Meeting:** Scheduled at the end of the sprint to showcase progress.
- **Demo Preparation Meeting:** A session before the sprint demo to align on key talking points.

---

## Artifacts

### Jira Board
- Used for task tracking and sprint planning.
- Tasks have a difficulty rating on a scale from **1 to 5**.
- Tasks are sorted by urgency in planning meetings, considering importance and impact on production.
- Example: Backend endpoints must be completed before frontend UI to ensure proper integration.
- Any changes are discussed in standups and through Discord for immediate updates.

### Task Assignment
- Assigned in planning meetings based on sprint goals.
- Assigned based on expertise and ensuring the right person works on a task.
- Motivation also plays a role—if a team member is interested in a task, they can take it on.

---

## Product

### Goals and Tasks

#### Receipt Parsing with Image Recognition *(Estimated Time: 5)*
- Implement OCR to extract data from uploaded receipts.
- Ensure accuracy of extracted data for merchant, amount, date, and items.

#### Adding Items to Receipt Display *(Estimated Time: 3)*
- Implement tables and proper structuring for displaying receipt items.
- Ensure consistency with UI components.

#### Accounts Login/Signup Implementation *(Estimated Time: 2)*
- Secure user authentication system with login and signup features.
- Ensure proper error handling and security measures.

#### Group Expense Synchronization & Notifications *(Estimated Time: 2)*
- Notify group members when new expenses are added or updated.
- Ensure real-time synchronization between users.

#### Graph on Receipt Spending Trends *(Estimated Time: 3)*
- Implement dynamic spending breakdown with interactive graphs.
- Ensure smooth UI experience.

#### Subscription Tracking Backend *(Estimated Time: 2)*
- Add a backend system to track user subscriptions.
- Ensure database schema updates are handled properly.

#### Subscription Tracking Frontend *(Estimated Time: 2)*
- Implement UI components for subscription tracking.
- Ensure integration with backend API.

#### Backend Cleanup & API Refinements *(Estimated Time: 3)*
- Cleanup outdated or redundant code in the backend.
- Ensure consistency in API response formats.

#### Refine Data Structure for Relational Databases *(Estimated Time: 3)*
- Ensure well-structured and optimized data relationships.
- Update documentation for the revised structure.

---

## Sprint Schedule & Deadlines

📌 **By Feb 23, 2025:**  
- Complete tasks **SCRUM-36 to SCRUM-43**.
- Show progress on assigned user stories.

📌 **Feb 24 - Feb 25, 2025:**  
- **SCRUM-2:** Enable new users to create accounts securely.
- **SCRUM-3:** Allow returning users to log in and securely access their account.

📌 **Feb 26 - Feb 27, 2025:**  
- Focus on Subscription Tracking & Receipt Display Fixes.
- **SCRUM-44:** Add Subscription Tracking Feature.
- **SCRUM-45:** Fix Display Items in Receipt View.

📌 **Feb 28, 2025 (Friday):**  
- Final bug fixing and merging before sprint close.

---

## Artifacts

### API Documentation *(Code)*
- We maintain a structured API documentation using **Postman** to clearly define all backend endpoints.
- Ensures frontend developers can efficiently interact with the backend.

### Demo-ready Feature Implementations *(Code & Video)*
- At least **two working features** will be implemented and demonstrated for the sprint review.
- A short recorded **demo** of the implemented features will be created to showcase system functionality.
- Helps with presentation preparation and allows everyone to understand progress.

### Testing Reports *(Text & Code)*
- We maintain **testing logs** that include **manual and automated test results** for backend and frontend functionality.
- Helps identify bugs early and ensures system stability across different use cases.
