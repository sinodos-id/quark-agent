# Generic Message Manager ✨

This project is an SSI (Self-Sovereign Identity) API for QuarkID, designed to streamline the operations of a Decentralized Identity agent, specifically focusing on generic Verifiable Credential issuance and presentation flows using DIDComm.

## Overview 📖

The Generic Message Manager acts as a backend service that interacts with an SSI agent library (@extrimian/agent) to handle DIDComm messages related to Verifiable Credentials. It exposes API endpoints to initiate credential issuance and presentation requests, generating Out-of-Band (OOB) invitations that can be shared with agent clients (e.g., mobile wallets, such as the **Quark ID wallet client**).

## How it Works 🛠️

The core flow for both issuance and presentation requests is as follows:

1.  **Request Initiation:** An external system or user initiates an issuance or presentation request by calling the API's `/message` endpoint, providing the desired `goalCode` (Issuance or Presentation) and relevant data (credential details for issuance, presentation requirements for presentation).
2.  **OOB Invitation Creation:** The API uses the underlying agent library to create an OOB invitation message based on the request.
3.  **QR Code Generation:** The API response includes the OOB invitation data, which can be encoded into a QR code by the calling application (as demonstrated in the provided example scripts).
4.  **Client Interaction:** An agent client (e.g., a mobile wallet application, such as the **Quark ID wallet client**) scans the QR code containing the OOB invitation.
5.  **DID Resolution:** The agent client processes the invitation, which typically includes information needed to resolve the issuer's or verifier's Decentralized Identifier (DID). The DID Document contains service endpoints, including the `WEBSOCKET_ENDPOINT_URL`.
6.  **DIDComm Interaction:** The agent client and the API (acting on behalf of the agent) establish a DIDComm connection using the resolved service endpoints. This connection is used to exchange messages for the credential issuance or presentation protocol.

**Note on Testing Environment:** For local testing, the `WEBSOCKET_ENDPOINT_URL` in the DID Document often needs to point to a publicly accessible endpoint that tunnels traffic to your local development server. Tools like **ngrok** are commonly used for this purpose, creating a secure tunnel from a public URL to your `localhost`.

## Setup 🚀

To set up and run the project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Lucero-Labs/message-manager
    cd message-manager
    ```
2.  **Install dependencies:** The project uses pnpm as a package manager.
    ```bash
    pnpm install
    ```
3.  **Environment Configuration:** Copy the example environment file and update it with your configuration.
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file to set necessary variables, such as `TOKEN_SECRET` for API authentication and `TEST_WEBHOOK_URL`/`PROD_WEBHOOK_URL` for webhooks. When `NODE_ENV` is set to `development`, the project uses local JSON file storage, and `MONGO_URI`, `VAULT_URL`, `VAULT_ROLE_ID`, and `VAULT_SECRET_ID` are not required. These variables are needed for production deployments using MongoDB and Vault.
4.  **Run the application:**
    ```bash
    pnpm start:dev
    ```
    This will start the application in development mode, using local JSON files for storage.

## Prerequisites ✅

Before running this project, ensure you have the following installed:

*   Node.js (v18 or higher recommended)
*   pnpm (Package Manager)
*   MongoDB (if running in production mode)
*   ngrok (or a similar tunneling tool for local testing with websockets)

## API Authentication 🔑

The API endpoints are protected using an API key. You need to set the `TOKEN_SECRET` environment variable in your `.env` file. This secret is used to authenticate requests to endpoints like `/message`, `/issued-vcs`, and `/send-invitation`.

## Webhooks 🎣

The application supports outgoing webhooks to notify external systems about events, such as when a verifiable credential is issued or a presentation is verified. Configure the webhook endpoints by setting the `TEST_WEBHOOK_URL` and `PROD_WEBHOOK_URL` environment variables in your `.env` file.

## Storage 🗄️

The project uses different storage mechanisms based on the environment:

*   **Development:** Local JSON files are used to store agent data, verifiable credentials, and protocol-specific information. These files are located in the `./storage` directory.
*   **Production:** MongoDB is used for persistent storage of agent data, verifiable credentials, and protocol-specific information. The connection string is configured via the `MONGO_URI` environment variable. Secure storage for production can optionally use HashiCorp Vault, configured via `VAULT_URL`, `VAULT_ROLE_ID`, and `VAULT_SECRET_ID`.

## Security Note 🔒

**Important:** In this example project setup, the agent's cryptographic keys are stored using the configured storage mechanism (local JSON files in development, MongoDB in production, or Vault for secure storage) and are **not encrypted at rest** by default in the JSON/MongoDB storage options. For production deployments handling sensitive data, it is highly recommended to implement robust key management and encryption solutions. Using a dedicated key management service like HashiCorp Vault (configured via `VaultStorage`) provides a more secure option for key storage.

## License 📄

This project is licensed under the MIT License.

## Example Usage 📝

Refer to the scripts in the `script/` directory (`issue-invitation.ts` and `present-invitation.ts`) for examples of how to interact with the API to initiate issuance and presentation flows.
