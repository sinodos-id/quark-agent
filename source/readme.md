# Backend Agent

A NestJS-based backend agent for handling verifiable credentials and secure messaging.

## Features

- 🔐 Secure credential issuance and verification
- 📨 WebSocket-based messaging
- 🔒 Vault integration for secure storage
- 📝 Structured logging system
- 🚀 Railway deployment ready

## Getting Started

### Prerequisites

- Node.js 18
- pnpm / npm

### Installation

```bash
pnpm install
```

### Development

```bash
# Start in development mode
pnpm start:dev

# Start in debug mode
pnpm start:debug
```

### Production

```bash
# Build
pnpm build

# Start production server
pnpm start:prod
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
WEBSOCKET_ENDPOINT_ID=MessagingWebSocket
DID_METHOD=your-did-method
WEBSOCKET_ENDPOINT_URL=your-websocket-url
MODENA_URL=your-modena-url
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
