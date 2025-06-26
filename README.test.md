# Motion MCP Server - Testing Guide

## Overview

The Motion MCP Server includes a comprehensive test suite with unit, integration, and end-to-end tests to ensure reliability and correctness.

## Test Structure

```
tests/
├── unit/                  # Unit tests for individual components
│   ├── config/           # Configuration tests
│   ├── lib/              # Library tests (client, rate limiter)
│   └── tools/            # Individual tool tests
├── integration/          # Integration tests for server
├── e2e/                  # End-to-end tests (real API)
├── fixtures/             # Mock data and responses
└── setup.ts             # Test configuration
```

## Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests |
| `npm run test:e2e` | Run E2E tests (requires real API key) |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:watch` | Run tests in watch mode |

## Test Categories

### Unit Tests

Unit tests focus on individual components in isolation:

- **Configuration**: Validates config loading and validation
- **Rate Limiter**: Tests rate limiting logic with in-memory SQLite
- **Motion Client**: Tests API client with mocked HTTP requests
- **Tools**: Tests each tool's schema validation and execution

Example:
```typescript
describe('RateLimiter', () => {
  it('should allow requests within rate limit', async () => {
    const result = await rateLimiter.checkRateLimit();
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(11);
  });
});
```

### Integration Tests

Integration tests verify the MCP server setup and tool registration:

- Server initialization
- Tool registration and discovery
- Error handling
- Transport communication

### End-to-End Tests

E2E tests interact with the real Motion API (disabled by default):

```bash
# Run E2E tests with real API
export MOTION_API_KEY='your-real-api-key'
npm run test:e2e
```

Tests cover:
- Workspace listing
- Task CRUD operations
- Rate limit handling
- Error scenarios

## Test Coverage

The project maintains 80%+ test coverage across:
- Branches
- Functions
- Lines
- Statements

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Writing Tests

### Test File Naming

- Unit tests: `*.test.ts`
- Integration tests: `*.test.ts` in `tests/integration/`
- E2E tests: `*.test.ts` in `tests/e2e/`

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Component', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Arrange
    const input = { /* ... */ };
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toEqual(expected);
  });
});
```

### Custom Matchers

The test suite includes custom Jest matchers:

```typescript
expect('task-123').toBeValidMotionId();
expect('2024-01-15T10:00:00Z').toBeValidISODate();
```

### Mocking

Use Jest mocks for external dependencies:

```typescript
jest.mock('axios');
jest.mock('../../../src/lib/motion-client.js');

const mockClient = {
  get: jest.fn(),
  post: jest.fn(),
  // ...
};
```

## Fixtures

Test fixtures provide consistent mock data:

```typescript
import { mockTask, mockProject, mockListResponse } from '../fixtures/motion-responses.js';

// Use in tests
mockClient.get.mockResolvedValueOnce(mockListResponse);
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Push to main branch
- Pre-publish checks

GitHub Actions workflow ensures code quality before deployment.

## Debugging Tests

### Run Single Test File

```bash
npm test -- tests/unit/lib/rate-limiter.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="should allow requests"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clarity**: Use descriptive test names
3. **Coverage**: Aim for 80%+ coverage
4. **Mocking**: Mock external dependencies
5. **Fixtures**: Use consistent test data
6. **Cleanup**: Clean up resources after tests

## Troubleshooting

### Tests Failing

1. Check environment variables
2. Ensure dependencies are installed
3. Clear test cache: `npm test -- --clearCache`

### Rate Limit Issues

Tests use in-memory SQLite to avoid persistence issues.

### E2E Test Failures

1. Verify API key is valid
2. Check Motion API status
3. Ensure test data cleanup

## Contributing

When adding new features:

1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain coverage above 80%
4. Update test documentation

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.