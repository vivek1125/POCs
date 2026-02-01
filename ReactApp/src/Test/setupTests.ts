import '@testing-library/jest-dom';

// Mock window.confirm globally
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn().mockReturnValue(true),
});

// Mock window.alert globally
Object.defineProperty(window, 'alert', {
  writable: true,
  value: jest.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock performance API for performance tests
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(),
    getEntriesByType: jest.fn(),
  },
});

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test utilities
global.TestUtils = {
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  mockApiResponse: (data: any, delay = 0) => {
    return new Promise(resolve => {
      setTimeout(() => resolve({ data }), delay);
    });
  },
  mockApiError: (error: any, delay = 0) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(error), delay);
    });
  }
};

// Add type declaration for global TestUtils
declare global {
  var TestUtils: {
    waitFor: (ms: number) => Promise<void>;
    mockApiResponse: (data: any, delay?: number) => Promise<{ data: any }>;
    mockApiError: (error: any, delay?: number) => Promise<never>;
  };
}
