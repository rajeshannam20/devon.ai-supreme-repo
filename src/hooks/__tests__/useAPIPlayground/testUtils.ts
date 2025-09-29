
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Setup mock fetch
export const setupMockFetch = () => {
  // Mock fetch
  global.fetch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
  });
};

// Create a successful response mock
export const createSuccessResponseMock = (data: any = { success: true }) => ({
  json: jest.fn().mockReturnValue(Promise.resolve(data)),
  ok: true,
  status: 200,
  statusText: 'OK'
});

// Create an error response mock
export const createErrorResponseMock = (status = 400, statusText = 'Bad Request', data = { error: 'Error' }) => ({
  json: jest.fn().mockReturnValue(Promise.resolve(data)),
  ok: false,
  status,
  statusText
});
