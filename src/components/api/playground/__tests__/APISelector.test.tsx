
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import APISelector from '../APISelector';
import { useAPI } from '@/contexts/APIContext';

// Mock the API context
jest.mock('@/contexts/APIContext', () => ({
  useAPI: jest.fn(),
}));

describe('APISelector component', () => {
  const mockOnSelectAPI = jest.fn();
  const mockAPIConfigs = [
    { name: 'API 1', endpoint: 'https://api1.com', apiKey: 'key1', description: 'First API', isConnected: true },
    { name: 'API 2', endpoint: 'https://api2.com', apiKey: 'key2', description: 'Second API', isConnected: false },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAPI as jest.Mock).mockReturnValue({ apiConfigs: mockAPIConfigs });
  });

  it('should render with the correct API selected', () => {
    render(<APISelector selectedAPI="API 1" onSelectAPI={mockOnSelectAPI} />);
    
    expect(screen.getByText('API Connection')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('API 1');
  });

  it('should call onSelectAPI with correct parameters when an API is selected', () => {
    render(<APISelector selectedAPI="" onSelectAPI={mockOnSelectAPI} />);
    
    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    // Select the first API
    const apiOption = screen.getByText('API 1');
    fireEvent.click(apiOption);
    
    expect(mockOnSelectAPI).toHaveBeenCalledWith('API 1', 'https://api1.com', 'key1');
  });

  it('should show message when no APIs are configured', () => {
    (useAPI as jest.Mock).mockReturnValue({ apiConfigs: [] });
    
    render(<APISelector selectedAPI="" onSelectAPI={mockOnSelectAPI} />);
    
    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    expect(screen.getByText('No API connections configured')).toBeInTheDocument();
  });

  it('should list all available APIs', () => {
    render(<APISelector selectedAPI="" onSelectAPI={mockOnSelectAPI} />);
    
    // Open the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    expect(screen.getByText('API 1')).toBeInTheDocument();
    expect(screen.getByText('API 2')).toBeInTheDocument();
  });
});
