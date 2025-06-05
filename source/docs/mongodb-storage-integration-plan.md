# MongoDB Storage Integration Plan

## Overview
Replace the current file-based storage implementations (`FileSystemStorage`, `JsonStorage`) with MongoDB-based storage classes that implement the same interfaces (`IAgentStorage` and `AgentSecureStorage`). This will maintain compatibility with existing agent configuration while providing persistent, scalable storage.

## Architecture Design

```mermaid
graph TB
    subgraph "Current File Storage"
        FS[FileSystemStorage] --> |implements| IAS[IAgentStorage]
        JS[JsonStorage] --> |implements| ASS[AgentSecureStorage]
        VS[VaultStorage] --> |implements| ASS
    end
    
    subgraph "New MongoDB Storage"
        MS[MongoStorage] --> |implements| IAS
        MSS[MongoSecureStorage] --> |implements| ASS
    end
    
    subgraph "MongoDB Collections"
        AC[agent_storage]
        VC[vc_storage] 
        SC[secure_storage]
    end
    
    subgraph "Agent Usage"
        A[Agent] --> |agentStorage| MS
        A --> |vcStorage| MS
        A --> |secureStorage| MSS
    end
    
    MS --> AC
    MS --> VC
    MSS --> SC
    
    subgraph "Configuration"
        ENV[Environment Variables] --> |MONGO_URI_INTERNAL<br/>MONGO_URI_EXTERNAL| CONFIG[Configuration]
        CONFIG --> MS
        CONFIG --> MSS
    end
```

## Implementation Plan

### Phase 1: Environment Configuration
1. **Update Configuration**
   - Add `MONGO_URI_INTERNAL` and `MONGO_URI_EXTERNAL` to environment variables
   - Update `src/config/index.ts` to include MongoDB configuration
   - Add environment selection logic (internal vs external URL)

### Phase 2: MongoDB Schema Design
2. **Create MongoDB Schemas**
   - Design document structure for key-value storage
   - Create Mongoose schemas for each collection type
   - Add indexes for performance optimization

### Phase 3: Storage Implementation
3. **Create MongoDB Storage Classes**
   - `MongoStorage` class implementing `IAgentStorage`
   - `MongoSecureStorage` class implementing `AgentSecureStorage`
   - Both classes will be configurable for different collections

### Phase 4: Dependency Injection Setup
4. **Update Dependency Injection**
   - Create MongoDB module with connection setup
   - Update providers to use MongoDB storage instead of file storage
   - Maintain backward compatibility during transition

### Phase 5: Agent Integration
5. **Update Agent Provider**
   - Replace `FileSystemStorage` instances with `MongoStorage`
   - Configure different collections for `agentStorage` and `vcStorage`
   - Update secure storage injection

### Phase 6: Testing & Validation
6. **Direct MongoDB Implementation**
   - **No Migration**: Switch directly to MongoDB storage (no parallel operation)
   - Add error handling and connection resilience
   - Test all storage operations

## Technical Specifications

### Document Structure
```typescript
interface StorageDocument {
  _id: string;           // MongoDB ObjectId
  key: string;           // Storage key (indexed)
  value: any;            // Stored data (JSON)
  createdAt: Date;       // Creation timestamp
  updatedAt: Date;       // Last update timestamp
}
```

### Collections
- **agent_storage**: For agent-related data (DID, keys, etc.)
- **vc_storage**: For verifiable credentials storage
- **secure_storage**: For sensitive data (private keys, secrets)

### Environment Variables
```bash
# MongoDB Configuration
MONGO_URI_INTERNAL=mongodb://internal-railway-url/database
MONGO_URI_EXTERNAL=mongodb://external-railway-url/database
MONGO_DB_NAME=agent_storage_db

# Current Public URL for Development
MONGO_URI=mongodb://mongo:bayXoPYYXudRXJjLRBXQKaMlGsuXKkls@shuttle.proxy.rlwy.net:27222
```

### Key Features
- **Interface Compatibility**: Maintains existing `IAgentStorage` and `AgentSecureStorage` interfaces
- **Collection Isolation**: Separate collections for different storage types
- **Environment Flexibility**: Support for Railway's internal/external URLs
- **Error Handling**: Robust connection and operation error handling
- **Performance**: Indexed queries for fast key lookups
- **Logging**: Comprehensive logging for debugging and monitoring

### Implementation Strategy
1. **Direct Replacement**: Replace file storage with MongoDB storage immediately
2. **Clean Implementation**: No parallel operation or migration complexity
3. **Fresh Start**: Begin with empty MongoDB collections
4. **Validation**: Verify all storage operations work correctly
5. **Cleanup**: Remove file-based storage code

## Benefits
- **Scalability**: MongoDB handles large datasets better than JSON files
- **Reliability**: Built-in replication and backup capabilities
- **Performance**: Indexed queries and optimized storage
- **Monitoring**: Better observability and debugging capabilities
- **Multi-instance**: Supports multiple application instances sharing data
- **Simplicity**: Direct implementation without migration complexity

## Implementation Order
1. Update environment configuration
2. Create MongoDB connection module
3. Create Mongoose schemas
4. Implement MongoStorage class
5. Implement MongoSecureStorage class
6. Update dependency injection
7. Update agent provider
8. Test and validate functionality