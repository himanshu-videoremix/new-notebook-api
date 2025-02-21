import { API_CONSTANTS, ERROR_MESSAGES } from './constants';
import type { ContentStatus, ApiResponse } from './types';

// Retry failed requests
export const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = API_CONSTANTS.MAX_RETRIES
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error instanceof Error) {
      // Only retry network errors or 5xx server errors
      if (
        error.name === 'TypeError' || // Network errors
        (error instanceof Response && error.status >= 500)
      ) {
        await new Promise(resolve => 
          setTimeout(resolve, API_CONSTANTS.RETRY_DELAY)
        );
        return retryRequest(fn, retries - 1);
      }
    }
    throw error;
  }
};

// Validate file upload
export const validateFileUpload = (file: File): void => {
  if (file.size > API_CONSTANTS.MAX_FILE_SIZE) {
    throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
  }

  if (!API_CONSTANTS.VALID_FILE_TYPES.includes(file.type)) {
    throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }
};

// Poll for content status
export const pollContentStatus = async (
  requestId: string,
  checkStatus: (id: string) => Promise<ContentStatus>,
  maxAttempts = 30
): Promise<ContentStatus> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await checkStatus(requestId);
    
    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }

    attempts++;
    await new Promise(resolve => 
      setTimeout(resolve, API_CONSTANTS.POLL_INTERVAL)
    );
  }

  throw new Error('Operation timed out');
};

// Format error response
export const formatErrorResponse = (error: unknown): ApiResponse => ({
  status: 'error',
  error: error instanceof Error ? error.message : ERROR_MESSAGES.PROCESSING_ERROR
});

// Generate mock response for development
export const mockResponse = <T>(data: T): ApiResponse<T> => ({
  status: 'success',
  data
});