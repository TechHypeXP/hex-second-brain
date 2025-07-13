# Master Implementation Directive (v3.0)

## Context-Setting Preamble
You are building a **'Truth-Seeking Engine,'** an expert system designed to be an objective, evidence-based thought partner. Its primary goal is to **challenge and guide** by synthesizing internal and external knowledge. The initial user is a **'Professional Strategist,'** and the immediate task is to implement the **'Debate Prep' workflow** by following the plan below.

---
## The Implementation Plan

### **Phase 1: Foundation & Setup**

#### **Task 1.1: Verify Project Configuration**
* **Details:** Verify the file `lib/config.ts` exists and correctly exports configured instances of the Prisma, Redis, and Google AI clients using environment variables. If missing or incorrect, create/overwrite it.
* **`Verification & Acceptance Criteria`:**
    * 1.1.1: The `lib/config.ts` file exists and is free of errors.
    * 1.1.2: The application can connect to all three services.

#### **Task 1.2 (Corrected): Finalize Database Setup**
* **Details:** The database schema must be verified and synchronized with the Prisma client, accounting for known network limitations.

* **Critical Context:** The standard prisma migrate dev command will fail in this environment with a P1001: Can't reach database server error. This is expected behavior. The root cause is a network incompatibility between the development environment (IPv4) and the Supabase direct database connection (IPv6). To bypass this, the initial database schema has already been applied manually. Your task is not to create the schema from scratch, but to use the commands below to safely synchronize Prisma's state with the existing database.

* **Action 1 (Enable pgvector):** You must first confirm the pgvector extension is enabled. Go to the Supabase SQL Editor and run: `CREATE EXTENSION IF NOT EXISTS vector;`

* **Action 2 (Synchronize Schema):** The migration history is unreliable due to the connection issue. Instead of migrate dev, you will use a more direct command to sync the schema. Run: `pnpm prisma db push`. This command will update the database to match the prisma.schema file without creating new migration files, which is the correct procedure for this environment.

* **Action 3 (Generate Client):** After a successful db push, run `pnpm prisma generate` to ensure your Prisma client is up-to-date.

* **`Verification & Acceptance Criteria`:**
    * 1.2.1: The pgvector extension is successfully enabled.
    * 1.2.2: The `pnpm prisma db push` command completes without any errors, successfully synchronizing the schema.
    * 1.2.3: The `pnpm prisma generate` command completes without any errors.

#### **Task 1.3 (NEW): Create `ExecutionLog` Table**
* **Details:** Add the new `ExecutionLog` model to the `prisma.schema` file to track the real-time progress of this implementation plan.
* **Action 1:** Add the following model to `prisma.schema`:
    ```prisma
    model ExecutionLog {
      id          String   @id @default(cuid())
      taskId      String
      taskName    String
      status      String   // e.g., 'PENDING', 'COMPLETED', 'FAILED'
      logOutput   String?  @db.Text
      errorMessage String? @db.Text
      startTime   DateTime @default(now())
      endTime     DateTime?
    }
    ```
* **Action 2:** Run `pnpm prisma migrate dev --name "add-execution-log"`.
* **`Verification & Acceptance Criteria`:**
    * 1.3.1: The migration completes successfully and the `ExecutionLog` table exists in the database.

#### **Task 1.4: Verify Worker Scaffolding**
* **Details:** Verify the worker entry point at `app/worker/index.ts` exists and is connected to the queue.
* **`Verification & Acceptance Criteria`:**
    * 1.4.1: The `app/worker/index.ts` file exists and is free of errors.

**Phase 2: Core Engine Implementation - The Agent Chain (Target: 5 Days)**

- **Task 2.1: Implement 'Ingestion Agent'**
  - **Details:** Create the first agent in the worker's chain to fetch and sanitize raw text content from a URL.
  - **Verification & Acceptance Criteria:**
    - **2.1.1:** Given a YouTube URL, the agent must return the full, sanitized text transcript.
    - **2.1.2:** Given an article URL, the agent must return the full, sanitized text content of the article body.
    - **2.1.3:** If a URL is unreachable or returns a 404 error, the job must fail gracefully and report the error.
- **Task 2.2: Implement 'Defensive Analysis Agent'**
  - **Details:** This agent deconstructs an opponent's document to find weaknesses.
  - **Verification & Acceptance Criteria:**
    - **2.2.1:** Given a test text containing a known logical fallacy (e.g., a "strawman argument"), the agent's JSON output must correctly identify and quote the fallacy.
    - **2.2.2:** The agent must successfully pass its structured JSON output to the next agent in the chain.
- **Task 2.3: Implement 'Internal Coherence Agent'**
  - **Details:** This agent compares the opponent's arguments against the user's own knowledge library using pgvector.
  - **Verification & Acceptance Criteria:**
    - **2.3.1:** Given an argument that is known to be contradicted by a document in the user's test library, the agent's output must correctly identify the relationship as "CONTRADICTS" and cite the correct internal document.
    - **2.3.2:** The pgvector search must complete successfully and return the most relevant results.
- **Task 2.4: Implement 'Synthesis & Opinion Agent'**
  - **Details:** This final agent synthesizes all prior findings into the comprehensive "opinion" document.
  - **Verification & Acceptance Criteria:**
    - **2.4.1:** The agent's output must be a single, valid JSON object that conforms to the schema required by the Interactive Report frontend components.
    - **2.4.2:** The generated text must adhere to the "disclaimer-ready" persona, using analytical language rather than prescriptive commands.
- **Task 2.5: Implement 'Persistence Agent'**
  - **Details:** This agent saves the complete analysis to the database within a single transaction.
  - **Verification & Acceptance Criteria:**
    - **2.5.1:** Upon successful completion of a job, a new ContentSummary record and its associated VectorChunk records must exist in the database.
    - **2.5.2:** The parent BatchJob status must be updated to "completed."
    - **2.5.3:** If any database write fails, the entire transaction must be rolled back, and no partial data should be saved.

**Phase 3: Frontend Integration & UI Build (Target: 4 Days)**

_(Each task has an implicit acceptance criterion of being fully responsive and visually polished)_

Of course. My apologies again for the omission. You are correct, the entire implementation plan must be detailed from end to end.

Here is the complete and fully detailed breakdown for all tasks within Phase 3, as they should appear in the final blueprint.

Phase 3: Frontend Integration & UI Build (Target: 4 Days)
(Each task has an implicit acceptance criterion of being fully responsive and visually polished using Framer Motion for transitions.)

Task 3.1: Build the "Debate Prep" UI (DebatePrepView.tsx)
Details: This is the primary user interface for the alpha's core "Debate Prep" workflow. It will be a dedicated page where the user initiates the analysis.

Core Logic:

Use a state management hook (e.g., useState) to handle the uploaded file object.

Implement a file handler that validates the uploaded file (e.g., checking for PDF format, size limits).

On form submission, construct the payload and make a POST request to the /api/v1/batch endpoint.

Handle the API response: on success (status 202), store the returned batchJobId and redirect the user to the OperationalDashboard, passing the batchJobId in the URL so the new run can be highlighted.

Implement robust loading and error states for the submission button and form.

UI Components:

A main heading, e.g., "Analyze an Opposing Document."

A text area for the user to briefly state their own position or goal for context.

A modern, drag-and-drop file input component for the user to upload their opponent's PDF document.

A submit button that shows a loading spinner while the API call is in progress.

Verification & Acceptance Criteria:

3.1.1: A user must be able to select or drag-and-drop a PDF file into the UI.

3.1.2: Clicking the "Analyze" button successfully triggers a POST request to the /api/v1/batch endpoint with the correct payload.

3.1.3: Upon a successful API response, the user is redirected to the status dashboard to monitor the progress of their job.

Task 3.2: Build the 'Live Operational Dashboard' UI (OperationalDashboard.tsx)
Details: This is the real-time observability page located at /app/dashboard/status. It allows the user to monitor the AI assistant's execution of the implementation plan.

Core Logic:

Initial Fetch: On component mount, use an API route (/api/v1/status) to fetch all records from the ExecutionLog table.

Real-time Subscription: Use the Supabase client-side library within a useEffect hook to subscribe to INSERT and UPDATE events on the ExecutionLog table.

State Management: When a new event is received, update the local state to reflect the change, which will re-render the specific task item in the list.

UI Components:

A list or table where each row represents a task from our implementation plan.

Each row will display Task ID, Task Name, a dynamic status badge (Pending, In Progress, Completed, Failed), and timestamps.

An expandable section on each row to show logOutput or errorMessage.

Verification & Acceptance Criteria:

3.2.1: The dashboard successfully displays all tasks on initial load.

3.2.2: Task statuses update in real-time without a page refresh as the worker updates the database.

3.2.3: Clicking on a failed task correctly displays the logged error message.

Task 3.3: Build the Interactive Report Viewer (InteractiveReport.tsx)
Details: This is the parent component responsible for rendering the complex JSON output from a completed 'Synthesis Agent' job. It will likely exist on a dynamic route like /app/reports/[reportId].

Core Logic:

The component will accept a reportId as a prop from the URL.

It will use this ID to fetch the full analysis JSON from a new API endpoint (e.g., /api/v1/reports/[reportId]).

It will manage the state of the complex report object and pass down relevant pieces of data as props to its modular child components.

UI Components:

This component will be a composition of the specialized widgets we designed: SourceAttributionWidget, MultiAxisAnalysisPanel, InteractiveCitation, KeyFindingsPanel, and the EmbeddedContentViewer.

Verification & Acceptance Criteria:

3.3.1: Given a valid reportId, the component successfully fetches the corresponding analysis JSON.

3.3.2: All child components (widgets) correctly render the data passed to them from the main report object.

Task 3.4: Build the "Ingestion Sandbox" UI (IngestionSandbox.tsx)
Details: This is the user's interface for curating new knowledge discovered by the AI during its external analysis. It could be a dedicated page or a modal.

Core Logic:

Fetch a list of "sandboxed" sources from a new API endpoint. These are sources that the AI found externally but have not yet been added to the user's library.

For each source, there will be an "Add to Library" button. Clicking this button will trigger a new call to the /api/v1/batch endpoint, passing the URL of the sandboxed source to start a new ingestion and analysis job.

The "Dismiss" button will call another endpoint to mark the sandboxed source as ignored.

UI Components:

A list or card-based layout where each card represents a sandboxed source.

Each card will display the 'pre-flight analysis report' (credibility score, summary, etc.) generated by the worker for that source.

"Add to Library" and "Dismiss" buttons on each card.

Verification & Acceptance Criteria:

3.4.1: The UI correctly displays all sources waiting for review in the sandbox.

3.4.2: Clicking the "Add to Library" button successfully triggers a new batch processing job for that specific source.

Task 3.5: Final Wiring & Polish
Details: This is the final integration and quality assurance step that brings the entire application together into a cohesive, world-class experience.

Core Logic:

State Management: Implement a global state management solution (e.g., Zustand or React Context) for user authentication state and notifications.

Routing: Ensure the navigation flow is seamless (e.g., from submitting a job -> to the status dashboard -> to the final interactive report).

Code Quality: Complete the full migration of any remaining .jsx files to .tsx and resolve all TypeScript errors and linter warnings.

UI Components:

This task involves no new components but focuses on refining existing ones.

Apply Framer Motion animations to page transitions, modal pop-ups, and status updates to make the application feel fluid and responsive.

Verification & Acceptance Criteria:

3.5.1: The entire application is in .tsx with zero TypeScript errors.

3.5.2: The end-to-end "Debate Prep" workflow is fully functional and visually polished, from uploading a file to interacting with the final report and managing sandboxed sources.
