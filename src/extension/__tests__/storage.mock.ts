
import { DevonnSettings } from '../storage';

// Mock settings data
const mockSettings: DevonnSettings = {
  apiUrl: 'https://api.devonn.ai',
  userId: 'test-user',
  notifications: {
    taskComplete: true,
    errors: true
  },
  lastCheck: Date.now() // Adding the missing lastCheck property
};

// Mock chrome APIs for testing
export const mockChrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({ settings: mockSettings });
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      })
    },
    onChanged: {
      addListener: jest.fn()
    }
  },
  permissions: {
    contains: jest.fn()
  },
  tabs: {
    onActivated: {
      addListener: jest.fn()
    }
  },
  runtime: {
    lastError: undefined
  }
};

// Mock storage implementation
export const mockChromeStorage = {
  get: jest.fn((keys, callback) => {
    callback({ settings: mockSettings });
  }),
  set: jest.fn((items, callback) => {
    if (callback) callback();
  })
};

// Setup chrome storage mock
export function setupChromeStorageMock() {
  return mockChrome;
}

// Reset mock between tests
export function resetChromeStorageMock() {
  mockChromeStorage.get.mockClear();
  mockChromeStorage.set.mockClear();
  mockChrome.storage.local.get.mockClear();
  mockChrome.storage.local.set.mockClear();
}
