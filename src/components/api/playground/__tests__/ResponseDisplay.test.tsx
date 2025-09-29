
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResponseDisplay from '../ResponseDisplay';

describe('ResponseDisplay component', () => {
  const mockOnSaveResponse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with empty response message', () => {
    render(
      <ResponseDisplay 
        response="" 
        status="" 
        onSaveResponse={mockOnSaveResponse}
        hasValidResponse={false}
      />
    );
    
    expect(screen.getByText('Response')).toBeInTheDocument();
    expect(screen.getByText('Response will appear here')).toBeInTheDocument();
    expect(screen.queryByText('Save Response')).not.toBeInTheDocument();
  });

  it('should render response when provided', () => {
    const responseText = '{"data": "test response"}';
    
    render(
      <ResponseDisplay 
        response={responseText} 
        status="200 OK" 
        onSaveResponse={mockOnSaveResponse}
        hasValidResponse={true}
      />
    );
    
    expect(screen.getByText(responseText)).toBeInTheDocument();
  });

  it('should show success status style for 2xx responses', () => {
    render(
      <ResponseDisplay 
        response="Success" 
        status="200 OK" 
        onSaveResponse={mockOnSaveResponse}
        hasValidResponse={true}
      />
    );
    
    const statusElement = screen.getByText('Status: 200 OK');
    expect(statusElement.className).toContain('bg-green');
  });

  it('should show error status style for non-2xx responses', () => {
    render(
      <ResponseDisplay 
        response="Error" 
        status="404 Not Found" 
        onSaveResponse={mockOnSaveResponse}
        hasValidResponse={true}
      />
    );
    
    const statusElement = screen.getByText('Status: 404 Not Found');
    expect(statusElement.className).toContain('bg-red');
  });

  it('should show save button when hasValidResponse is true', () => {
    render(
      <ResponseDisplay 
        response="Data" 
        status="200 OK" 
        onSaveResponse={mockOnSaveResponse}
        hasValidResponse={true}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /save response/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should call onSaveResponse when save button is clicked', () => {
    render(
      <ResponseDisplay 
        response="Data" 
        status="200 OK" 
        onSaveResponse={mockOnSaveResponse}
        hasValidResponse={true}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /save response/i });
    fireEvent.click(saveButton);
    
    expect(mockOnSaveResponse).toHaveBeenCalledTimes(1);
  });

  it('should hide save button when hasValidResponse is false', () => {
    render(
      <ResponseDisplay 
        response="Data" 
        status="200 OK" 
        onSaveResponse={mockOnSaveResponse}
        hasValidResponse={false}
      />
    );
    
    expect(screen.queryByRole('button', { name: /save response/i })).not.toBeInTheDocument();
  });
});
