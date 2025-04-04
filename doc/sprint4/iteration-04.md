
# Ohama Land - Sprint 4 Planning

## Iteration 04

**Start Date:** March 21, 2025

**End Date:** April 6, 2025

---

## Process

### Roles & Responsibilities

- **RJ:** Finish the cost-splitting logic in backend, and the in-app notification for receipts added in a group.

- **Mel:** Finish the subscriptions page, mail and in-app notification for upcoming subscriptions, and refactor UI.

- **Hari:** Improve graphs and analytics page, and create dashboard that includes all the important graphs and activity.

- **Leo:** Revamp the UI for receipts, and deploy the application using Google Cloud.

- **Ohama:** Add more unit tests in backend and frontend, and create UI for groups page.

### Events

- **Daily Standup Meetings:** Online, held at 10 PM.

- _Purpose:_ To review progress, discuss blockers, and plan next steps.

- **Code Review Sessions:** Conducted as needed on Discord.

- _Purpose:_ To ensure high code quality before merging into the main branch.

- **Sprint Review Meeting:** Scheduled at the end of the sprint to showcase progress.

- **Demo Preparation Meeting:** A session before the sprint demo to align on key talking points.

### Artifacts

#### Jira Board

- Used for task tracking and sprint planning.

- Tasks have a difficulty rating on a scale from **1 to 5**.

- Tasks are sorted by urgency in planning meetings, considering importance and impact on production.

- Example: Backend endpoints must be completed before frontend UI to ensure proper integration.

- Any changes are discussed in standups and through Discord for immediate updates.

#### Task Assignment

- Assigned in planning meetings based on sprint goals.

- Assigned based on expertise and ensuring the right person works on a task.

- Motivation also plays a role—if a team member is interested in a task, they can take it on.

---

## Product

### Goals and Tasks

#### Receipt Display and Categorization _(Estimated Time: 4)_

**(SCRUM-7 - Receipt List/Grid View [4], SCRUM-6 - Receipt Categorization [2])**

- Create a "Receipts" page showing summary info (date, amount, store, category).
- Enable sorting and filtering of receipts by different fields.
- Allow users to click on a receipt to view details.
- Implement default and custom categories for organizing receipts.
- Support editing and deleting categories with no active associations.

#### Notification System _(Estimated Time: 4)_

**(SCRUM-15 - Notifications)**

- Notify users when they are added to a group or when receipts are added.
- Include relevant info in notifications (e.g., who did what).
- Display notifications in-app and optionally as push notifications.

#### Dynamic Graphs and Insights _(Estimated Time: 3)_

**(SCRUM-56 - Graphs and Analytics)**

- Implement real-time updates for analytics graphs when receipts or groups change.
- Ensure graphs reflect all recent financial data accurately.
- Maintain responsive and smooth UI during graph updates.

#### Group Balances and Dashboard _(Estimated Time: 3)_

**(SCRUM-10 - Group Dashboard)**

- Show total expenses and each member’s contributions in a dashboard.
- Calculate and display who owes whom and how much.
- Add a “Settle Up” button or suggestion to simplify debts.

#### Subscription Detection _(Estimated Time: 3)_

**(SCRUM-14 - Detect Recurring Subscriptions)**

- Identify recurring subscriptions based on transaction or receipt history.
- Show a list of detected subscriptions with billing date and amount.

#### UI Refactoring and Figma Alignment _(Estimated Time: 3)_

**(SCRUM-76 - UI Refactoring, SCRUM-75 - Finalizing Figma)**

- Refactor UI for Groups and Subscriptions to match Figma designs.
- Ensure layout, colors, and interactions are consistent with design system.
- Complete Figma designs for the Insights, Register, and Log In screens.
- Update the app logo to align with brand identity.

#### Test Coverage _(Estimated Time: 3)_

**(SCRUM-74 - Unit Tests)**

- Write unit/integration tests for key frontend components and backend endpoints.
- Ensure tests pass consistently in the CI pipeline.
- Cover both successful and edge/error cases.
- Test major user flows like joining groups and uploading receipts end-to-end.

#### Security Enhancements _(Estimated Time: 2)_

**(SCRUM-20 - Security Improvements)**

- Add input validation and sanitization for all forms.
- Use CSRF tokens for sensitive frontend actions.
- Ensure all DB interactions use parameterized queries or ORM to prevent SQL injection.

#### Group Creation and Management _(Estimated Time: 2)_

**(SCRUM-8 - Group Feature)**

- Allow users to create and name groups.
- Let users invite others by email or link.
- Display group member lists to all participants.


## Sprint Schedule & Deadlines

📌 **By March 25, 2025:**

- **SCRUM-6:** Complete the ability to organize receipts using folders.

- **SCRUM-7:** Revamp the UI for receipt upload and display.

📌 **March 27, 2025:**

- **SCRUM-10:** Finish the logic for cost-splitting in the backend.

- **SCRUM-74:** Add additional unit tests in backend and frontend.

📌 **March 29, 2025:**

- **SCRUM-15:** Finish in-app notifications for general use.

- **SCRUM-8:** Finish integrating the groups page with backend and frontend.

📌 **March 31, 2025:**

- **SCRUM-56:** Finish integrating the dynamic graphs for receipts.

- **SCRUM-14:** Automatically detect recurring subscriptions

---

### Artifacts

#### API Documentation _(Code)_

- We maintain a structured API documentation using **Postman** to clearly define all backend endpoints.

- Ensures frontend developers can efficiently interact with the backend.

#### Demo-ready Feature Implementations _(Code & Video)_

- At least **two working features** will be implemented and demonstrated for the sprint review.

- A short recorded **demo** of the implemented features will be created to showcase system functionality.

- Helps with presentation preparation and allows everyone to understand progress.

#### Testing Reports _(Text & Code)_

- We maintain **testing logs** that include **manual and automated test results** for backend and frontend functionality.

- Helps identify bugs early and ensures system stability across different use cases.
