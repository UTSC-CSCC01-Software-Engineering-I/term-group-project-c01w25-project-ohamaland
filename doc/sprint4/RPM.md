# Release Plan

## Release Name: Sprint 4 – Enhanced Collaboration & Insights  
**Planned Release Date:** April 4, 2025

---

## Release Objectives  
Sprint 4 focuses on enhancing collaboration through group and notification features, improving insights with dynamic analytics and subscription detection, and refining the user interface to align with Figma designs. It also aims to increase reliability through extended test coverage and stronger security.

---

## Specific Goals

### Notification System
- Notify users when added to a group or when receipts are added.
- Display notifications in-app and as optional push notifications.

### Dynamic Graphs and Insights
- Implement real-time graph updates.
- Ensure graphs reflect financial data changes accurately.

### Group Dashboard and Balances
- Display total expenses and member contributions.
- Show who owes whom and add "Settle Up" suggestions.

### Subscription Detection
- Detect recurring subscriptions based on receipt/transaction history.
- Show subscription name, amount, and billing date.

### UI Refactoring and Design Consistency
- Align Groups and Subscriptions UI with finalized Figma designs.
- Update app logo and branding elements.
- Refactor Insights, Register, and Login screens for consistency.

### Test Coverage
- Add unit/integration tests for frontend and backend components.
- Ensure CI test reliability and coverage for edge cases.
- Test major user flows like group joins and receipt uploads.

### Security Enhancements
- Implement input validation and sanitization.
- Use CSRF protection for sensitive actions.
- Prevent SQL injection with ORM or parameterized queries.

### Group Creation and Management
- Allow users to create and name groups.
- Invite users by email or link.
- Display group member lists.

---

## Metrics for Measurement
- **Notification Accuracy:** % of correct group and receipt alerts sent  
- **Graph Sync Success:** Rate of real-time update synchronization  
- **UI Consistency Score:** Based on design review against Figma  
- **Test Pass Rate:** % of tests passing in CI  
- **Security Compliance:** # of inputs properly sanitized and protected  

---

## Release Scope

### Included Features
- Notification system (group events, receipt additions)  
- Real-time graphs and analytics updates  
- Group dashboard for expenses and balances  
- Subscription detection  
- UI refactoring and brand alignment with Figma  
- Unit/integration tests and CI reliability  
- Backend and frontend security improvements  
- Group creation, invitations, and member lists  

### Excluded Features
- Advanced expense prediction and budget planning  
- External calendar integrations for subscriptions  
- Mobile offline support  

---

## Bug Fixes
- Resolved receipt display layout inconsistencies.  
- Fixed category deletion logic for unassigned receipts.  
- Corrected delayed UI rendering on group dashboard.  
- Patched backend errors in subscription detection queries.  

---

## Non-Functional Requirements
- **Performance:** Maintain fast API responses.  
- **Reliability:** Ensure end-to-end tests pass on CI pipeline.  
- **Security:** Protect all form inputs and endpoints.  
- **Usability:** Follow consistent design system in all UI elements.  

---

## Dependencies and Limitations

### Dependencies
- Backend notification service  
- Real-time graph update system  
- Subscription detection logic and rules  

### Limitations
- Subscription detection accuracy may vary based on input quality.  
- Push notification delivery may depend on browser/device settings.  
- Real-time graph updates require stable internet connectivity.  
- UI responsiveness depends on device/browser compatibility.  
