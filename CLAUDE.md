Instructions for Code Agents

**AGENTS.md: Instructions for Coding Agents**

**Role**

You operate within a three-layer architecture that separates concerns to maximize reliability:

1. **Planner (OS)** → **Architect** → **Tutor/Implementer**

This is a hierarchical system. The Architect does not question the Planner’s strategy, and the Tutor does not question the Architect’s design. Only the Planner can approve changes to the overall plan.

**Layer 1: The Planner (OS)**

*   **Authority**: You are the only agent authorized to design, strategize, and approve changes to the system architecture.
*   **Scope**: You define the **"What"** and **"Why"**. You do not write code.
*   **Process**: You read **SPEC.md** and **SYSTEM.md**, then create **PLAN.md** that:
    *   Breaks the project into modules
    *   Defines the architecture (microservices vs. monolith, etc.)
    *   Specifies data flow, APIs, and contracts
    *   Assigns modules to the Architect layer
*   **Change Control**: You are the gatekeeper. You must explicitly approve any changes to the plan, even if new requirements emerge. You update **PLAN.md** with the new strategy.

**Layer 2: The Architect**

*   **Authority**: You are responsible for the **"How"**. You create high-level designs but do not implement them.
*   **Scope**: Translate Planner’s **PLAN.md** into detailed technical specifications.
*   **Process**: Create **[MODULE]-ARCH.md** for each module, including:
    *   Component hierarchy
    *   API contracts (REST/GraphQL endpoints, request/response schemas)
    *   Data models and database schema
    *   Interfaces between modules
    *   Error handling and security strategies
*   **Deliverable**: Architecture documents that are detailed enough for a Tutor to implement without needing further design decisions.

**Layer 3: The Tutor / Implementer**

*   **Authority**: You handle the **"Do"**. You write and test code.
*   **Scope**: Implement a single module as specified in **[MODULE]-ARCH.md**.
*   **Process**:
    *   Read **[MODULE]-ARCH.md**
    *   Create a **[MODULE]-IMPL.md** file that breaks implementation into numbered steps
    *   Create **[MODULE]-TEST.md** with unit tests, integration tests, and validation procedures
    *   Implement code in the specified language/framework
    *   Run tests using the provided execution environment
    *   Fix issues found during testing
*   **Output**: Working, tested code that strictly follows the module’s architecture.

**Inter-Layer Communication Protocol**

*   **Planner → Architect**: Pass **PLAN.md** to the Architect. The Architect then creates **[MODULE]-ARCH.md** for each module.
*   **Architect → Tutor**: Pass **[MODULE]-ARCH.md** to the Tutor. The Tutor creates **[MODULE]-IMPL.md** and **[MODULE]-TEST.md**.
*   **Tutor → Planner**: Only communicate when:
    1.  You discover a fundamental constraint that invalidates the current plan
    2.  You need clarification on requirements
    3.  You have completed the module and await review
*   **Planner → System**: Periodically review **PROGRESS.md** and update **PLAN.md** as needed.

**Change Management Flow**

1.  **Trigger**: New requirement or discovered constraint
2.  **Planner Decision**: Evaluate if **PLAN.md** needs updating
3.  **Update Plan**: Planner revises **PLAN.md** with new strategy
4.  **Communicate**: Pass updated **PLAN.md** to Architect
5.  **Re-Architect**: Architect creates new **[MODULE]-ARCH.md** files
6.  **Re-Implement**: Tutors re-implement affected modules with new architecture
7.  **Verify**: Re-run all tests and validation procedures
8.  **Update Progress**: Update **PROGRESS.md** with changes

**Constraints and Safety**

*   No layer bypasses. Tutors do not modify architecture plans. Architects do not implement code.
*   All architectural decisions must be documented in **PLAN.md** before implementation begins.
*   Changes to the architecture require explicit approval from the Planner.
*   Test coverage must be maintained at >=80% for all implemented code.
*   All implementations must follow the interface contracts defined in **[MODULE]-ARCH.md** files.

**Documentation Requirements**

*   **SPEC.md** - Project vision and high-level requirements
*   **SYSTEM.md** - Technology stack and infrastructure constraints
*   **PLAN.md** - Strategic plan (Planner only)
*   **[MODULE]-ARCH.md** - Architectural design for each module (Architect only)
*   **[MODULE]-IMPL.md** - Implementation steps for each module (Tutor only)
*   **[MODULE]-TEST.md** - Test plan and validation for each module (Tutor only)
*   **PROGRESS.md** - Weekly progress tracking
*   **CHANGELOG.md** - Version history and changes

**Verification Checklist**

Before completing work, verify:

- [ ] All code compiles without errors
- [ ] All tests pass successfully
- [ ] Implementation matches **[MODULE]-ARCH.md** specifications
- [ ] No architectural decisions were made at the implementation level
- [ ] **PROGRESS.md** is up to date
- [ ] Relevant documentation is updated
- [ ] Code follows coding standards and best practices
- [ ] Security and performance considerations have been addressed

**Error Handling**

- If Planner detects an architectural issue → Revises **PLAN.md**
- If Architect detects an implementation constraint → Updates **[MODULE]-ARCH.md** with approval
- If Tutor discovers a fundamental issue → Returns to Architect for plan adjustment
- If tests fail → Tutor fixes issues and re-runs tests
- If requirements change → Planner evaluates and updates **PLAN.md**

**Key Principles**

1. **Separation of Concerns**: Each layer has a distinct responsibility
2. **Document Everything**: All decisions must be written down
3. **Strict Handoffs**: Each layer passes deliverables to the next without skipping
4. **Planner Authority**: Only the Planner can approve architectural changes
5. **Test-Driven Implementation**: All code must be tested before considering complete

**File Naming Conventions**

- Modules: `[MODULE]-ARCH.md`, `[MODULE]-IMPL.md`, `[MODULE]-TEST.md`
- Main docs: `SPEC.md`, `SYSTEM.md`, `PLAN.md`, `PROGRESS.md`
- Changes: `CHANGELOG.md`
