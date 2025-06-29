import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        status: 'OK',
        message: 'Backend is running',
        timestamp: new Date().toISOString()
      })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders BookHub heading', async () => {
    render(<App />);
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /bookhub/i });
      expect(heading).toBeInTheDocument();
    });
  });

  it('renders welcome message', async () => {
    render(<App />);
    await waitFor(() => {
      const welcomeText = screen.getByText(/welcome to bookhub/i);
      expect(welcomeText).toBeInTheDocument();
    });
  });
});