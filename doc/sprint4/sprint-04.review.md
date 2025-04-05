# Ohama Land

## Iteration 04 - Review & Retrospect  
**When:** April 4, 2025  
**Where:** Online (Discord)

---

## Process - Reflection

### Decisions that turned out well

#### Parallel Development Approach
- Tasks were more evenly distributed across backend and frontend, reducing idle time and dependency blocks.
- Allowed different team members to make progress simultaneously, even when waiting on integration steps.

#### Notification System Implementation
- Real-time notifications for group actions and receipt updates were successfully integrated.
- Clear UX flow and well-structured backend logic made it easy to test and deploy.

#### Improved Sprint Planning and Deadlines
- Sprint milestones helped the team meet key feature deadlines.
- Intermediate check-ins ensured smoother progress tracking and accountability.

#### UI Refactoring Based on Figma
- Aligning with Figma designs improved visual consistency across pages.
- Refactoring helped improve usability and brand identity alignment.

---

### Decisions that did not turn out as well as we hoped

#### Subscription Detection Complexity
- Logic for detecting recurring subscriptions was more challenging than expected.

#### Graph Responsiveness
- Although functional, real-time graph updates caused slight lags on low-end devices.
- More performance testing is needed to optimize rendering and responsiveness.

---

## Planned Changes
- Introduce throttling or caching strategies for graph updates to improve performance.
- Expand testing dataset for subscription detection to improve accuracy.
- Prioritize completion of remaining minor UI inconsistencies in early next sprint.
- Continue refining the parallel workflow system and dependency tracking in sprint planning.

---

## Product - Review

### Goals and/or tasks that were met/completed
- **Notification System:** Users now receive real-time in-app alerts for group and receipt activities.
- **Dynamic Graphs:** Graphs now reflect live data changes, enhancing financial insights.
- **Group Dashboard:** Expenses and balances across members are clearly displayed.
- **UI Refactoring:** Core views for groups and subscriptions redesigned to match Figma.
- **Test Coverage:** Backend and frontend tests were expanded, with consistent CI pass rate.
- **Group Features:** Group creation, invitation, and member views fully implemented.
- **Security Enhancements:** Input validation and CSRF protection added across forms.

### Goals and/or tasks that were planned but not fully met
- **Graph Performance:** Real-time updates work but need optimization on lower-performance devices.

---

## Meeting Highlights

### Going into the next iteration, our main insights are:

#### UI Polish and Final Touches
- Finalize alignment of all screens with Figma.
- Address lingering inconsistencies in spacing, typography, and responsiveness.

#### Continue Improving Collaboration Flow
- Maintain mid-sprint check-ins.
- Further enforce task dependencies to avoid future bottlenecks.
