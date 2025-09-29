
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MethodSelector from '../MethodSelector';

describe('MethodSelector component', () => {
  const mockOnMethodChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with the correct method selected', () => {
    render(<MethodSelector method="GET" onMethodChange={mockOnMethodChange} />);
    
    expect(screen.getByText('HTTP Method')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('GET');
  });

  it('should call onMethodChange when a method is selected', () => {
    render(<MethodSelector method="GET" onMethodChange={mockOnMethodChange} />);
    
    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    // Select POST method
    const postOption = screen.getByText('POST');
    fireEvent.click(postOption);
    
    expect(mockOnMethodChange).toHaveBeenCalledWith('POST');
  });

  it('should display all HTTP methods', () => {
    render(<MethodSelector method="GET" onMethodChange={mockOnMethodChange} />);
    
    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('PUT')).toBeInTheDocument();
    expect(screen.getByText('DELETE')).toBeInTheDocument();
    expect(screen.getByText('PATCH')).toBeInTheDocument();
  });
});
