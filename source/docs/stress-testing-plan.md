# Stress Testing Plan for Agent Messaging

## Objective

To stress test the issuer/verifier agent's ability to handle multiple simultaneous Out-of-Band (OOB) invitation creations and subsequent DIDComm message exchanges over WebSockets.

## Architecture

The stress test will utilize a central orchestration script that launches and manages multiple instances of a headless receiver agent.

## Plan Steps

1.  **Prepare the Headless Receiver Agent:**
    *   Ensure you have a version of your receiver agent logic that can be run programmatically (e.g., as a command-line application or a background process).
    *   This headless agent must be able to accept an OOB invitation URL as input (e.g., via a command-line argument or standard input).
    *   The headless agent should automatically process the OOB invitation, establish the WebSocket connection, and complete the relevant DIDComm flow (Issuance or Presentation) without requiring user interaction.
    *   The headless agent should ideally provide some form of output upon completion (success or failure) and potentially log relevant events.

2.  **Develop the Stress Orchestration Script (Node.js):**
    *   This script will be the central controller for the stress test.
    *   **Concurrency Management:** Use a library like `p-limit` or `async.queue` to control the number of simultaneous stress test flows (i.e., the number of concurrent receiver agent instances launched).
    *   **Flow Simulation Loop:** The script will run a loop for a specified duration or number of iterations. In each iteration (or as allowed by the concurrency limit), it will:
        *   **Initiate OOB:** Send an HTTP POST request to your issuer/verifier agent's `/message` endpoint to create a new OOB invitation.
        *   **Extract OOB URL:** Parse the response from the `/message` endpoint to get the OOB invitation URL.
        *   **Launch Receiver Agent:** Launch a new process for the headless receiver agent, passing the extracted OOB URL as an argument.
        *   **Monitor Receiver Agent (Optional but Recommended):** Keep track of the launched process. You might capture its standard output/error or wait for it to exit to determine if the flow was successful.
        *   **Collect Metrics:** Record the start time of the flow and, if monitoring the process, the end time and outcome.
    *   **Error Handling:** Implement error handling for HTTP requests and for launching/monitoring receiver agent processes.
    *   **Reporting:** After the test duration or iterations are complete, the script should report aggregated metrics (e.g., total flows attempted, successful flows, failed flows, average latency).

3.  **Configure and Execute the Test:**
    *   Set parameters like the target URL of the issuer/verifier agent, the path to the headless receiver agent executable, the desired concurrency level, and the test duration/iteration count.
    *   Run the orchestration script.

4.  **Monitor System Resources:**
    *   While the test is running, monitor the resource usage (CPU, memory, network I/O) on the machine hosting the issuer/verifier agent and the machine running the orchestration script and headless receiver agent instances.

5.  **Analyze Results:**
    *   Review the metrics reported by the orchestration script.
    *   Examine the logs from both the issuer/verifier agent and the headless receiver agent instances to understand the cause of any failures or performance issues.

## Mermaid Diagram

```mermaid
graph TD
    A[Stress Orchestration Script] --> B{Send Concurrent POST /message Requests};
    B --> C{Receive OOB Invitations};
    C --> D{Launch Headless Receiver Agent Process};
    D --> E[Headless Receiver Agent Instance];
    E --> F{Process OOB Invitation};
    F --> G{Engage in DIDComm Message Exchange};
    G --> H{Complete Flow};
    H --> I{Report Status/Metrics back to Orchestration Script};
    I --> A;