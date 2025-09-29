
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import APIPlaygroundTab from '../APIPlaygroundTab';
import { useAPI } from '@/contexts/APIContext';
import { setupMockFetch, createSuccessResponseMock } from '@/hooks/__tests__/useAPIPlayground/testUtils';

// Mock dependencies
jest.mock('@/contexts/APIContext', () => ({
  useAPI: jest.fn(),
}));

jest.mock('@/hooks/useAPIPlayground', () => {
  const originalModule = jest.requireActual('@/hooks/useAPIPlayground');
  
  // Create a function that wraps the original useAPIPlayground with testing hooks
  return {
    ...originalModule,
    useAPIPlayground: (props: any) => {
      const result = originalModule.useAPIPlayground(props);
      
      // Override sendRequest to avoid actual fetch calls during testing
      return {
        ...result,
        sendRequest: jest.fn(() => {
          // Simulate successful API call response
          result.state.response = JSON.stringify({ success: true, data: "Test Response" }, null, 2);
          result.state.status = "200 OK";
          return Promise.resolve();
        }),
      };
    }
  };
});

// Set up mock responses
setupMockFetch();

describe('API Playground Flow', () => {
  const mockSaveResponse = jest.fn();
  const mockAPIConfigs = [
    { name: 'Test API', endpoint: 'https://api.test.com', apiKey: 'test-key', description: 'Test API', isConnected: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAPI as jest.Mock).mockReturnValue({ apiConfigs: mockAPIConfigs });
  });

  it('should allow users to select an API, configure and send a request', async () => {
    render(<APIPlaygroundTab onSaveResponse={mockSaveResponse} />);
    
    // Switch to playground tab if needed
    const playgroundTab = screen.getByRole('tab', { name: 'API Playground' });
    fireEvent.click(playgroundTab);
    
    // Select API
    const apiSelector = screen.getByRole('combobox', { name: /api connection/i });
    fireEvent.click(apiSelector);
    const apiOption = screen.getByText('Test API');
    fireEvent.click(apiOption);
    
    // Select Method
    const methodSelector = screen.getByRole('combobox', { name: /http method/i });
    fireEvent.click(methodSelector);
    const postMethod = screen.getByText('POST');
    fireEvent.click(postMethod);
    
    // Enter Endpoint
    const endpointInput = screen.getByPlaceholderText('https://api.example.com/endpoint');
    fireEvent.change(endpointInput, { target: { value: 'https://api.test.com/users' } });
    
    // Enter Request Body
    const requestBodyTextarea = screen.getByLabelText('Request Body');
    fireEvent.change(requestBodyTextarea, { target: { value: '{"name": "Test User"}' } });
    
    // Click Send Request
    const sendButton = screen.getByRole('button', { name: /send request/i });
    fireEvent.click(sendButton);
    
    // Wait for response to be displayed
    await waitFor(() => {
      expect(screen.getByText(/"success": true/)).toBeInTheDocument();
      expect(screen.getByText(/"data": "Test Response"/)).toBeInTheDocument();
    });
    
    // Click Save Response
    const saveButton = screen.getByRole('button', { name: /save response/i });
    fireEvent.click(saveButton);
    
    // Verify save function was called
    expect(mockSaveResponse).toHaveBeenCalledTimes(1);
    expect(mockSaveResponse).toHaveBeenCalledWith(
      'Test API',
      'POST',
      'https://api.test.com/users',
      '200 OK',
      expect.stringContaining('Test Response')
    );
  });

  it('should handle dashboard tab navigation', async () => {
    render(<APIPlaygroundTab onSaveResponse={mockSaveResponse} />);
    
    // Check if dashboard tab exists and click it
    const dashboardTab = screen.getByRole('tab', { name: 'Dashboard' });
    fireEvent.click(dashboardTab);
    
    // Verify dashboard content is visible
    expect(screen.getByText('API Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview of your API usage and activity')).toBeInTheDocument();
    expect(screen.getByText('Recent API Calls')).toBeInTheDocument();
    
    // Switch back to playground tab
    const playgroundTab = screen.getByRole('tab', { name: 'API Playground' });
    fireEvent.click(playgroundTab);
    
    // Verify playground content is visible again
    expect(screen.getByText('Test API endpoints interactively')).toBeInTheDocument();
  });
});
