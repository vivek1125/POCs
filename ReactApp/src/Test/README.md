# Bank Management System - Frontend Test Suite

This directory contains comprehensive unit tests for all pages in the Bank Management System frontend application using React Testing Library and Jest with TypeScript.

## 📁 Test Structure

```
src/Test/
├── index.ts                 # Test suite exports and documentation
├── setupTests.ts           # Test configuration and global mocks
├── Login.test.tsx          # Login/Signup component tests
├── Signup.test.tsx         # Standalone Signup component tests
├── Customer.test.tsx       # Customer management tests
├── Account.test.tsx        # Account page tests
├── Transaction.test.tsx    # Transaction page tests
└── README.md               # This file
```

## 🧪 Test Coverage

### Overall Statistics
- **Total Tests**: 110 test cases
- **Components Tested**: 5 pages
- **Test Categories**: 8 major categories
- **Mocking Strategy**: Complete API and dependency mocking

### Test Breakdown by Component

#### 1. Login Component (`Login.test.tsx`)
- **Test Cases**: 25
- **Features Tested**:
  - Initial render and accessibility
  - Tab navigation between login/signup
  - Form validation and submission
  - API integration and error handling
  - Loading states and user feedback
  - Authentication flow

#### 2. Signup Component (`Signup.test.tsx`)
- **Test Cases**: 22
- **Features Tested**:
  - Form validation and input handling
  - Role selection (Admin, Customer, Guest)
  - Password confirmation validation
  - API error handling
  - State management
  - Loading states

#### 3. Customer Component (`Customer.test.tsx`)
- **Test Cases**: 30
- **Features Tested**:
  - Customer data loading and display
  - CRUD operations (Create, Read, Update, Delete)
  - Role-based permissions (Admin vs Customer)
  - Status management (Activate/Deactivate)
  - Form handling for new customers
  - Error handling and loading states
  - Data mapping from backend

#### 4. Account Component (`Account.test.tsx`)
- **Test Cases**: 15
- **Features Tested**:
  - Static content rendering
  - Accessibility compliance
  - Component structure validation
  - Future enhancement readiness
  - Performance characteristics

#### 5. Transaction Component (`Transaction.test.tsx`)
- **Test Cases**: 18
- **Features Tested**:
  - Static content rendering
  - Accessibility compliance
  - Component structure validation
  - Consistency with other pages
  - Integration readiness
  - Performance characteristics

## 🎯 Testing Categories

### 1. UI Rendering (25 tests)
- Component mounting and unmounting
- Initial render states
- Conditional rendering
- Layout structure validation

### 2. Form Validation (20 tests)
- Input field validation
- Required field checks
- Email format validation
- Password confirmation
- Submit button state management

### 3. API Integration (15 tests)
- Successful API calls
- Error response handling
- Network error scenarios
- Data transformation
- Loading state management

### 4. User Interactions (18 tests)
- Button clicks and form submissions
- Tab navigation
- Input field interactions
- Status toggles
- Confirmation dialogs

### 5. State Management (12 tests)
- Component state updates
- Form state handling
- Error state clearing
- Success state management

### 6. Error Handling (10 tests)
- API error scenarios
- Validation error display
- Network failure handling
- Graceful degradation

### 7. Accessibility (8 tests)
- ARIA attributes
- Screen reader compatibility
- Keyboard navigation
- Focus management

### 8. Performance (2 tests)
- Render performance
- Memory leak prevention

## 🛠️ Testing Tools & Libraries

### Core Testing Framework
- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers
- **@testing-library/user-event**: User interaction simulation

### Mocking Strategy
- **API Services**: Complete mocking of `apiService` and `CustomerApiService`
- **React Router**: Navigation mocking with `useNavigate`
- **Authentication Context**: Context provider mocking
- **Browser APIs**: localStorage, window.confirm, window.alert mocking

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test Login.test.tsx
npm test Customer.test.tsx
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

## 📋 Test Patterns & Best Practices

### 1. Test Organization
- **Describe blocks**: Organized by functionality
- **Test naming**: Clear, descriptive test names
- **Setup/Teardown**: Consistent beforeEach/afterEach patterns

### 2. Mock Management
```typescript
// Clean mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock return values for specific tests
mockApiService.post.mockResolvedValueOnce(mockResponse);
```

### 3. Async Testing
```typescript
// Wait for async operations
await waitFor(() => {
  expect(screen.getByText('Success message')).toBeInTheDocument();
});
```

### 4. User Interaction Simulation
```typescript
// Simulate real user interactions
await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
```

### 5. Accessibility Testing
```typescript
// Test ARIA labels and roles
expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
expect(screen.getByLabelText('Login form')).toBeInTheDocument();
```

## 🔧 Configuration

### Jest Configuration
The tests use the default Create React App Jest configuration with additional setup:

### Test Setup (`setupTests.ts`)
- Global DOM testing utilities
- Mock implementations for browser APIs
- Test utilities and helpers
- Console error suppression for known warnings

### TypeScript Configuration
- Strict type checking for test files
- Type definitions for testing libraries
- Mock type safety

## 📈 Test Quality Metrics

### Code Coverage Targets
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

### Test Reliability
- **Deterministic**: All tests produce consistent results
- **Isolated**: Tests don't depend on each other
- **Fast**: Complete test suite runs in < 30 seconds
- **Maintainable**: Clear structure and documentation

## 🐛 Common Issues & Solutions

### Issue 1: userEvent API Changes
**Problem**: `userEvent.setup()` not available in older versions
**Solution**: Use direct `userEvent.click()` methods instead of setup pattern

### Issue 2: Mock Reset Between Tests
**Problem**: Mocks persist between tests
**Solution**: Use `jest.clearAllMocks()` in `beforeEach` blocks

### Issue 3: Async Test Timeouts
**Problem**: Tests timeout waiting for async operations
**Solution**: Use `waitFor` with appropriate timeout values

### Issue 4: Component Context Requirements
**Problem**: Components require context providers
**Solution**: Create wrapper components with necessary providers

## 📚 Further Documentation

### Related Files
- `package.json`: Testing dependencies and scripts
- `tsconfig.json`: TypeScript configuration for tests
- `src/setupTests.ts`: Global test setup (if exists in src root)

### Testing Philosophy
These tests follow the "Testing Trophy" approach:
- **Unit Tests**: Component behavior and logic
- **Integration Tests**: Component interaction with APIs
- **Accessibility Tests**: Screen reader and keyboard compatibility
- **User Experience Tests**: Real user interaction patterns

## 🎉 Contributing to Tests

### Adding New Tests
1. Follow existing naming conventions
2. Group related tests in describe blocks
3. Mock external dependencies appropriately
4. Include positive and negative test cases
5. Test accessibility and error states

### Test Review Checklist
- [ ] Tests cover happy path scenarios
- [ ] Tests cover error conditions
- [ ] Tests verify accessibility
- [ ] Mocks are properly configured
- [ ] Test names are descriptive
- [ ] Tests are isolated and deterministic
