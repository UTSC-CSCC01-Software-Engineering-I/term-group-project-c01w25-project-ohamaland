# Ohama Land

## Iteration 02 - Review & Retrospect

**When:** March 07, 2025  
**Where:** Online (Discord)

---

## Process - Reflection

### Decisions that turned out well

#### Early Code Cleanup:
- Cleaning up both backend and frontend code early in the sprint helped streamline development.
- UI improvements made navigation and user interactions smoother.

#### Working on Big Features Early:
- Starting major features early in the sprint provided more time for testing and refinements.
- Helped prevent last-minute stress and allowed for proper debugging.

#### Utilizing Azure Form Recognizer for OCR:
- Initially tested multiple OCR solutions (Google Vision API, Tesseract), but Azure Form Recognizer provided the best performance and accuracy.
- Allowed for more precise data extraction, reducing the need for manual corrections.

#### Daily Standups and Regular Communication on Discord:
- Frequent updates kept everyone aligned and helped resolve blockers quickly.
- Allowed for better tracking of progress and accountability.

---

### Decisions that did not turn out as well as we hoped

#### Integration Issues with Subscription and User Authentication:
- One team member was focused on the subscription feature, while another worked on user registration and login.
- User authentication should have been completed earlier to prevent issues when merging the subscription feature.
- The delay in authentication caused conflicts and unexpected bugs during integration.

#### Limited Time for Frontend Refinements:
- Some UI components were left unpolished due to time constraints.
- More buffer time should be allocated in the next sprint for UI enhancements.

---

## Planned Changes
- **Code Cleanup at the Beginning of Next Sprint**
- **UI Consistency Enhancements**

---

## Product - Review

### Goals and/or tasks that were met/completed:
- **OCR Receipt Parsing:** Finalized with Azure Form Recognizer and integrated into the system.
- **Backend Cleanup & API Refinements:** Improved query performance and standardized response formats.
- **Authentication & User Accounts:** Secure login/signup with JWT authentication.
- **Subscription Tracking Backend:** Created and implemented database tables and API endpoints.
- **Graph on Receipt Spending Trends:** Implemented using Recharts.

### Goals and/or tasks that were planned but not met/completed:
- None, all planned tasks were completed successfully.

---

## Meeting Highlights

### Going into the next iteration, our main insights are:
- **Enhance UI Early in the Sprint:** Prioritize UI consistency improvements at the start to ensure a polished user experience.
- **Follow Standard Naming Conventions for Branches and Formats:** Maintain consistent branch naming and file formats to align with best practices and avoid losing marks.
- **Optimize Performance in Frontend Rendering:** Heavy UI components should be replaced or optimized for faster load times.
