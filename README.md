# Description

This is a component that acts as a message orchestrator, managing the workflow within the SSI environment. 
It is designed to work within the same network environment without additional security measures.
It is also designed to interact with a microservice responsible for translating front-end requests to this Backend Agent and vice versa. We call this layer SSI-Integration, which in its presentation layer exposes a REST API with the main functions:

1. Generation of QR invitations
2. Generation of DeepLink invitations
   
## Technologies

The application uses the following technologies:

* JavaScript
* Node.js
* Nest.js
  
## Architecture
[Diagram](https://docs.quarkid.org/en/Arquitectura/)

## Documentation
[Link](https://docs.quarkid.org/en/Arquitectura/componentes/)

## Local Environment Setup

Clone the repository

- Open the project with your selected editor
- Open a terminal and execute:

```bash
- cd source
- yarn
- yarn build
- yarn start
```

When installing dependencies with the "yarn" command, we may get an error with the "@mattrglobal/node-bbs-signatures" library, it's optional to ignore it.

## Steps to install the component on a server

1. Have an empty Linux server. 
2. Install the component and its images, which can be found on [Docker](https://hub.docker.com/r/quarkid/message-manager)

To install a component from Docker Hub on your server, follow these steps:

1. Connect to the server.

2. Install Docker on the server:
If you don't have Docker installed on your server yet, follow the instructions to install Docker for your operating system. You can find detailed guides in the official Docker documentation.

3. Download Docker.

4. [Generate vault](https://developer.hashicorp.com/vault/tutorials/auth-methods/approle#step-1-enable-approle-auth-method)

Policy:
```
path "secret/*" {
  capabilities = [ "create", "read", "update", "list", "delete" ]
}
```
5. Execute:
```
cd source
```
6. Execute:
```
docker compose up
```

## Environment Variables
## General

N/A 

## Logs

N/A

## Network Requirements

The application must have internet connectivity and connection to the DWN Client component.

## Access Route

N/A
