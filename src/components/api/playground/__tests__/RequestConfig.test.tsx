
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RequestConfig from '../RequestConfig';

describe('RequestConfig component', () => {
  const mockProps = {
    endpoint: 'https://api.example.com',
    onEndpointChange: jest.fn(),
    requestBody: '{"key": "value"}',
    onRequestBodyChange: jest.fn(),
    headers: '{"Content-Type": "application/json"}',
    onHeadersChange: jest.fn(),
    method: 'GET'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render endpoint input with correct value', () => {
    render(<RequestConfig {...mockProps} />);
    
    const endpointInput = screen.getByPlaceholderText('https://api.example.com/v1/resource');
    expect(endpointInput).toHaveValue('https://api.example.com');
  });

  it('should call onEndpointChange when endpoint input changes', () => {
    render(<RequestConfig {...mockProps} />);
    
    const endpointInput = screen.getByPlaceholderText('https://api.example.com/v1/resource');
    fireEvent.change(endpointInput, { target: { value: 'https://new-api.com' } });
    
    expect(mockProps.onEndpointChange).toHaveBeenCalledWith('https://new-api.com');
  });

  it('should render tabs for request body and headers', () => {
    render(<RequestConfig {...mockProps} />);
    
    expect(screen.getByRole('tab', { name: 'Request Body' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Headers' })).toBeInTheDocument();
  });

  it('should show request body textarea with correct value', () => {
    render(<RequestConfig {...mockProps} />);
    
    // Request Body tab should be active by default
    const textarea = screen.getByPlaceholderText(/key.*value/i);
    expect(textarea).toHaveValue('{"key": "value"}');
  });

  it('should call onRequestBodyChange when request body changes', () => {
    render(<RequestConfig {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText(/key.*value/i);
    fireEvent.change(textarea, { target: { value: '{"newKey": "newValue"}' } });
    
    expect(mockProps.onRequestBodyChange).toHaveBeenCalledWith('{"newKey": "newValue"}');
  });

  it('should switch to headers tab and show headers textarea', () => {
    render(<RequestConfig {...mockProps} />);
    
    // Click on Headers tab
    const headersTab = screen.getByRole('tab', { name: 'Headers' });
    fireEvent.click(headersTab);
    
    // Should now show the headers textarea
    const textarea = screen.getByPlaceholderText(/Content-Type.*application\/json/i);
    expect(textarea).toHaveValue('{"Content-Type": "application/json"}');
  });

  it('should call onHeadersChange when headers change', () => {
    render(<RequestConfig {...mockProps} />);
    
    // Click on Headers tab
    const headersTab = screen.getByRole('tab', { name: 'Headers' });
    fireEvent.click(headersTab);
    
    const textarea = screen.getByPlaceholderText(/Content-Type.*application\/json/i);
    fireEvent.change(textarea, { target: { value: '{"Authorization": "Bearer token"}' } });
    
    expect(mockProps.onHeadersChange).toHaveBeenCalledWith('{"Authorization": "Bearer token"}');
  });

  it('should disable request body textarea for GET requests', () => {
    render(<RequestConfig {...mockProps} method="GET" />);
    
    const textarea = screen.getByPlaceholderText(/key.*value/i);
    expect(textarea).toBeDisabled();
    expect(screen.getByText('Request body not applicable for GET requests')).toBeInTheDocument();
  });

  it('should enable request body textarea for non-GET requests', () => {
    render(<RequestConfig {...mockProps} method="POST" />);
    
    const textarea = screen.getByPlaceholderText(/key.*value/i);
    expect(textarea).not.toBeDisabled();
    expect(screen.queryByText('Request body not applicable for GET requests')).not.toBeInTheDocument();
  });
});
