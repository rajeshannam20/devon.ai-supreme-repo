
import React from 'react';
import { render, screen } from '@testing-library/react';
import APIDashboard from '../APIDashboard';

// Mock recharts components as they don't play well with Jest
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="bar-chart">{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Pie: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie">{children}</div>
    ),
    Bar: () => <div data-testid="bar" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Cell: () => <div data-testid="cell" />,
  };
});

describe('APIDashboard component', () => {
  it('renders the component correctly', () => {
    render(<APIDashboard />);
    
    // Check if the title and description are rendered
    expect(screen.getByText('API Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview of your API usage and activity')).toBeInTheDocument();
    
    // Check if tabs are rendered
    expect(screen.getByRole('tab', { name: 'Recent Activity' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'API Statistics' })).toBeInTheDocument();
  });

  it('displays recent activity by default', () => {
    render(<APIDashboard />);
    
    // Check if recent activity elements are rendered
    expect(screen.getByText('Recent API Calls')).toBeInTheDocument();
    expect(screen.getByText('User API')).toBeInTheDocument();
    expect(screen.getByText('Product API')).toBeInTheDocument();
    expect(screen.getByText('Order API')).toBeInTheDocument();
    expect(screen.getByText('Auth API')).toBeInTheDocument();
  });

  it('displays API methods with appropriate classes', () => {
    render(<APIDashboard />);
    
    // Check HTTP method elements and their classes
    const getMethods = screen.getAllByText('GET');
    expect(getMethods.length).toBeGreaterThan(0);
    expect(getMethods[0].className).toContain('method-get');
    
    const postMethods = screen.getAllByText('POST');
    expect(postMethods.length).toBeGreaterThan(0);
    expect(postMethods[0].className).toContain('method-post');
  });

  it('displays status codes with appropriate classes', () => {
    render(<APIDashboard />);
    
    // Check status elements and their classes
    const successStatus = screen.getByText('200 OK');
    expect(successStatus.className).toContain('status-success');
    
    const errorStatus = screen.getByText('401 Unauthorized');
    expect(errorStatus.className).toContain('status-error');
  });
});
