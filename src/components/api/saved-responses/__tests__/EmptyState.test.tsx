
import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState component', () => {
  it('renders the empty state message correctly', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('No saved responses yet')).toBeInTheDocument();
    expect(
      screen.getByText('Use the API Playground to test endpoints and save responses for future reference')
    ).toBeInTheDocument();
  });

  it('renders within a CardContent component', () => {
    const { container } = render(<EmptyState />);
    const cardContent = container.querySelector('[class*="card-content"]');
    
    expect(cardContent).toBeInTheDocument();
  });

  it('has proper styling for empty state', () => {
    const { container } = render(<EmptyState />);
    const emptyStateDiv = container.querySelector('div');
    
    expect(emptyStateDiv).toHaveClass('flex');
    expect(emptyStateDiv).toHaveClass('flex-col');
    expect(emptyStateDiv).toHaveClass('items-center');
    expect(emptyStateDiv).toHaveClass('justify-center');
    expect(emptyStateDiv).toHaveClass('text-center');
  });
});
