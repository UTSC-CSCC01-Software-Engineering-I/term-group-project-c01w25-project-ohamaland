# Ohama Land - Sprint 2 Planning

## Iteration 02
**Start Date:** March 10, 2025  
**End Date:** March 21, 2025  

---

## Process

### Roles & Responsibilities
- **RJ:** Create UI for login and registration, add backend authentication to all API endpoints, and receipt check for total amount.
- **Mel:** Develop new UIs for groups and receipts pages in Figma, and continue on improving the subscriptions page. 
- **Hari:** Create the logic and UI for the delete mechanism in receipts, groups and subscriptions pages and improving the graphs and analytics pages with real-time updates.
- **Leo:** Revamped the receipt structure to include more information such as tax and tips, and improved UIs for the dialog components used for adding and updating data.
- **Ohama:** Worked on integrating the receipt OCR when an image is uploaded, managing the Jira backlog and other adminstrative tasks. 

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

#### UI Improvements for Login/Signup *(Estimated Time: 2)*
- Implement enhanced login and signup forms with basic validations.
- Add password strength requirements and username constaints.
- Ensure responsive design across different screen sizes.

#### Rewriting API Endpoints *(Estimated Time: 3)*
- Implement authentication for all API endpoints.
- Rewrite backend routes with improved security.
- Add validation and error handling for all endpoints.
- Improved endpoints for nested data with PATCH and PUT

#### Real-time Graphs and Analytics *(Estimated Time: 3)*
- Implement real-time updates for analytics graphs.
- Add interactive elements to data visualization.

#### Delete for Receipt, Group, and Subscription *(Estimated Time: 3)*
- Add delete functionality for receipts, groups, and subscriptions.
- Implement confirmation dialogs for delete operations.
- Ensure proper cleanup of related data.
- Add visual feedback for successful deletions.

#### Tax and Tip in Receipts *(Estimated Time: 2)*
- Add tax and tip calculation functionality to receipts.
- Implement UI for entering tax and tip amounts.
- Add validation for tax and tip calculations.
- Ensure proper display of tax and tip in receipt summary.

#### UI Improvement for Receipt, Group and Subscription *(Estimated Time: 2)*
- Enhance receipt display with better layout and typography.
- Update group management interface with improved member controls.
- Implement new dialog designs for subscription management.
- Ensure consistent styling across all interfaces.

#### Receipt OCR Processing *(Estimated Time: 2)*
- Implement image upload and OCR processing functionality.
- Create interface for reviewing and editing OCR results.
- Add fallback for manual entry if OCR fails.
- Ensure proper validation of extracted data.
- Implement error handling for OCR processing.

#### Subscription Management Update *(Estimated Time: 2)*
- Implement billing details update functionality
- Add payment method modification options
- Enable plan type changes with immediate reflection
- Design responsive confirmation and error messages
- Implement real-time validation for subscription updates

---

## Sprint Schedule & Deadlines
## Sprint Schedule & Deadlines

📌 **By March 17, 2025:**
- Complete implementation of authentication system and OCR integration.
- **SCRUM-57:** Finalize API authentication rewrites.
- **SCRUM-51:** Complete OCR integration with receipt system.

📌 **March 18-19, 2025:**
- Focus on deletion functionality and UI improvements.
- **SCRUM-61:** Implement delete mechanisms for receipts, groups, and subscriptions.
- **SCRUM-54:** Complete UI/UX designs for core features.
- **SCRUM-52:** Implement tax and tip functionality.

📌 **March 20, 2025:**
- Implement subscription management updates.
- **SCRUM-60:** Complete subscription page updates.
- **SCRUM-55:** Finish code cleanup and optimization.
- **SCRUM-59:** Finalize group management endpoints.

📌 **March 21, 2025 (Friday):**
- Final testing, bug fixes and documentation.
- Prepare for sprint demo and review.
- Complete all remaining UI improvements.

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
