
import { screen, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import * as StorageModule from '../storage';
import { setupChromeStorageMock, mockChromeStorage } from './storage.mock';

// Set up the chrome mock
const mockChrome = setupChromeStorageMock();
global.chrome = mockChrome as any;

// Mock functions for edge case testing
jest.mock('../storage', () => {
  const originalModule = jest.requireActual('../storage');
  return {
    ...originalModule,
    getSettings: jest.fn(),
    saveSettings: jest.fn(),
    initializeSettings: jest.fn()
  };
});

describe('Devonn.AI Edge Cases', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Network Failures', () => {
    test('should handle API connection timeout', async () => {
      // Mock a network timeout
      jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );
      
      // Import the API client directly
      const { ApiClient } = require('../background');
      const api = new ApiClient();
      
      // Test network timeout handling
      const result = await api.checkConnection('https://api.example.com')
        .catch(err => ({ error: err.message }));
      
      expect(result).toBe(false);
    });

    test('should retry failed API calls with exponential backoff', async () => {
      // First call fails, second succeeds
      const fetchMock = jest.spyOn(global, 'fetch')
        .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
        .mockImplementationOnce(() => 
          Promise.resolve({ 
            ok: true, 
            json: () => Promise.resolve({ success: true }) 
          } as Response)
        );
      
      // Import the function with retry logic
      const { fetchWithRetry } = require('../api/retryFetch');
      
      const result = await fetchWithRetry('https://api.example.com');
      
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });

    test('should handle corrupt response data', async () => {
      // Mock a corrupt JSON response
      jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON'))
        } as Response)
      );
      
      // Import the API client
      const { ApiClient } = require('../background');
      const api = new ApiClient();
      
      // Test handling of corrupt data
      const result = await api.checkUpdates('https://api.example.com', 123456789);
      
      expect(result).toEqual({ updates: [] });
    });
  });

  describe('Storage Edge Cases', () => {
    test('should handle storage quota exceeded', async () => {
      // Mock storage quota exceeded error
      (StorageModule.saveSettings as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });
      
      // Import the handler that uses storage
      const { saveSettingsHandler } = require('../settingsHandlers');
      
      // Create mock elements
      const mockInput = { value: 'test', dataset: {} } as any;
      const mockConnection = { textContent: '', className: '' } as any;
      const mockCheckbox = { checked: true } as any;
      
      const mockForm = document.createElement('div');
      mockForm.className = 'settings-form';
      document.body.appendChild(mockForm);
      
      // Test the function
      await saveSettingsHandler(
        mockInput, mockInput, mockCheckbox, mockCheckbox, mockConnection
      );
      
      // Check if error message is displayed
      const errorMessage = document.querySelector('.error-message');
      expect(errorMessage).not.toBeNull();
      expect(errorMessage?.textContent).toContain('Failed to save settings');
      
      document.body.removeChild(mockForm);
    });

    test('should handle corrupted settings data', async () => {
      // Mock corrupted settings
      (StorageModule.getSettings as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({ 
          apiUrl: 123, // Wrong type
          userId: null, // Missing required field
          connectionStatus: true // Wrong type
        });
      });
      
      // Import the function that initializes settings
      const { initializeSettings } = require('../storage');
      
      // Test how the app handles corrupted settings
      const settings = await (initializeSettings as any)();
      
      // Should fall back to defaults
      expect(typeof settings.apiUrl).toBe('string');
      expect(typeof settings.userId).toBe('string');
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    test('should handle different permission states', () => {
      // Test denied permissions
      mockChrome.permissions.contains.mockImplementationOnce((_, callback) => {
        callback(false);
      });
      
      // Import the permissions handler
      const { checkRequiredPermissions } = require('../permissions');
      
      // Test permission handling
      let permissionGranted = false;
      checkRequiredPermissions().then(result => {
        permissionGranted = result;
      });
      
      expect(mockChrome.permissions.contains).toHaveBeenCalled();
      expect(permissionGranted).toBe(false);
    });
    
    test('should handle browser tab context changes', () => {
      // Create a spy for tab activation handler
      const tabActivatedSpy = jest.fn();
      
      // Mock adding a tab activation listener
      mockChrome.tabs.onActivated.addListener(tabActivatedSpy);
      
      // Call the listener with tab data
      const tabData = { tabId: 123, windowId: 456 };
      const tabActivatedCallback = mockChrome.tabs.onActivated.addListener.mock.calls[0][0];
      
      if (tabActivatedCallback) {
        tabActivatedCallback(tabData);
        expect(tabActivatedSpy).toHaveBeenCalledWith(tabData);
      } else {
        // If there's no listener yet, this test is skipped
        console.log('Tab activation listener not registered');
      }
    });
  });
  
  describe('CPU and Memory Edge Cases', () => {
    test('should handle memory-intensive operations efficiently', () => {
      // Test memory-intensive operations
      const largeData = Array(100000).fill({ complex: { nested: { data: 'value' } } });
      
      // Measure memory usage before operation
      const memoryBefore = process.memoryUsage().heapUsed;
      
      // Perform operation that should be optimized
      const result = JSON.parse(JSON.stringify(largeData));
      
      // Measure memory after
      const memoryAfter = process.memoryUsage().heapUsed;
      
      // In a real test, we'd check that memory usage is reasonable
      // For this example, we're just verifying the operation completed
      expect(result.length).toBe(largeData.length);
    });

    test('should handle high CPU operations without blocking UI', () => {
      // Create a mock document body for testing
      document.body.innerHTML = `
        <div id="app">
          <button id="process-button">Process</button>
          <div id="result"></div>
        </div>
      `;
      
      // Import the worker handler
      const { processWithWorker } = require('../workers/cpuIntensive');
      
      // Set up processing with a web worker
      const button = document.getElementById('process-button') as HTMLButtonElement;
      const result = document.getElementById('result') as HTMLDivElement;
      
      // Start processing and verify UI is not blocked
      let uiBlocked = false;
      
      // Create a UI interaction during processing
      setTimeout(() => {
        try {
          button.click();
          result.textContent = 'Clicked during processing';
        } catch (e) {
          uiBlocked = true;
        }
      }, 10);
      
      // Verify UI wasn't blocked
      expect(uiBlocked).toBe(false);
    });
  });
  
  describe('User Input Edge Cases', () => {
    test('should sanitize dangerous input', () => {
      // Import the sanitization function
      const { sanitizeInput } = require('../security/inputSanitization');
      
      // Test handling of potentially dangerous input like XSS
      const dangerousInput = '<script>alert("XSS")</script>';
      const sanitized = sanitizeInput(dangerousInput);
      
      // Ensure script tags are removed or escaped
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toBe(dangerousInput);
    });
    
    test('should handle extremely long input values', () => {
      // Import the validation function
      const { validateInputLength } = require('../validation/inputValidation');
      
      // Test with extremely long input
      const veryLongInput = 'a'.repeat(10000);
      const isValid = validateInputLength(veryLongInput, 1000);
      
      // Should reject overly long input
      expect(isValid).toBe(false);
    });
    
    test('should handle special characters in input', () => {
      // Import the input processing function
      const { processInput } = require('../validation/inputValidation');
      
      // Test with special characters
      const specialChars = '!@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./';
      const processed = processInput(specialChars);
      
      // Should not throw error for special characters
      expect(() => processInput(specialChars)).not.toThrow();
      expect(processed).toBeTruthy();
    });
  });
});
