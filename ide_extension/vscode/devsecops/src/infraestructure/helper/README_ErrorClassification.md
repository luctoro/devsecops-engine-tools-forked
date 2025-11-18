# Error Classification Module

## Overview
This module provides intelligent error classification for the DevSecOps extension, categorizing errors from scanner operations, Docker interactions, and network issues.

## Architecture

### Files Created/Modified:

1. **ErrorClassifierService.ts** - Core classification logic
2. **errorPatterns.json** - Configurable error patterns
3. **IMetricsData.ts** - Enhanced with `error_category` field
4. **MetricsCollectorService.ts** - Integrated classification logic
5. **ErrorClassifierTest.ts** - Test cases and examples

## Usage

### Basic Classification
```typescript
import { ErrorClassifierService } from './ErrorClassifierService';

const errorMessage = "Cannot connect to the Docker daemon";
const category = ErrorClassifierService.classifyError(errorMessage);
// Returns: "Docker Daemon"
```

### Multiple Error Classification
```typescript
const errors = [
  "Some general error",
  "Cannot connect to Docker daemon",
  "SCAN Error occurred"
];
const category = ErrorClassifierService.classifyErrors(errors);
// Returns: "Docker Daemon" (highest priority)
```

### Integration with Metrics
The classification is automatically integrated into the metrics pipeline:

```typescript
// When scan_status is "Error", error_category is automatically populated
const metrics = MetricsCollectorService.collectMetrics(input);
console.log(metrics.error_category); // e.g., "VPN Connectivity"
```

## Error Categories

1. **Docker Daemon** - Docker service not running
2. **VPN Connectivity** - Network/VPN related issues
3. **Image Not Found** - Docker image unavailable locally
4. **Network Connectivity** - General network issues
5. **Registry Issues** - Docker registry problems
6. **Scanner Engine** - Internal scanner errors
7. **Container Runtime** - Container execution issues
8. **Timeout** - Operation timeouts
9. **Authentication** - Auth/token issues
10. **JSON Parsing** - Data parsing errors
11. **Operation Cancelled** - User-cancelled operations
12. **Unknown** - Unclassified errors

## Configuration

### Adding New Patterns
Edit `errorPatterns.json`:
```json
{
  "New Category": [
    "new error pattern",
    "another pattern"
  ]
}
```

### Runtime Pattern Addition
```typescript
ErrorClassifierService.addPattern("Docker Daemon", "new docker error pattern");
```

## Priority System

When multiple error types are detected, the system uses this priority order:
1. VPN Connectivity (most specific)
2. Docker Daemon
3. Registry Issues
4. Network Connectivity
5. Authentication
6. Image Not Found
7. Container Runtime
8. Scanner Engine
9. Timeout
10. Operation Cancelled
11. JSON Parsing

## Testing

Run the test suite:
```typescript
import { ErrorClassifierTest } from './ErrorClassifierTest';
ErrorClassifierTest.runTests();
```

## Clean Architecture Benefits

- **Separation of Concerns**: Pattern matching isolated in service
- **Configurable**: Patterns stored in external JSON
- **Testable**: Pure functions with predictable outputs
- **Extensible**: Easy to add new categories and patterns
- **Integrated**: Seamlessly works with existing metrics pipeline

## Future Enhancements

1. **Machine Learning**: Train models on historical error data
2. **Severity Scoring**: Add severity levels to categories
3. **User Feedback**: Allow users to correct classifications
4. **Analytics**: Track most common error categories
5. **Auto-Resolution**: Suggest fixes based on error category