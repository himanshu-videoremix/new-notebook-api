import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadInterface } from '@/components/upload-interface';
import { autoContentApi } from '@/lib/api';
import { storageService } from '@/lib/storage';

jest.mock('@/lib/api');
jest.mock('@/lib/storage');

describe('UploadInterface', () => {
  const mockOnClose = jest.fn();
  const mockOnSourcesUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates file uploads', async () => {
    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    // Test file size validation
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload/i);
    
    await userEvent.upload(input, largeFile);
    
    expect(screen.getByText(/file too large/i)).toBeInTheDocument();

    // Test file type validation
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    await userEvent.upload(input, invalidFile);
    
    expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
  });

  it('processes valid file upload', async () => {
    const mockProcessResponse = {
      request_id: 'test_123',
      status: 'completed',
      content: 'Processed content',
      metadata: {
        summary: 'Test summary',
        topics: ['topic1'],
        citations: ['cite1']
      }
    };

    (autoContentApi.uploadSource as jest.Mock).mockResolvedValue(mockProcessResponse);
    (autoContentApi.analyzeSource as jest.Mock).mockResolvedValue({
      summary: 'Analysis summary',
      topics: ['topic1'],
      citations: ['cite1']
    });

    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload/i);
    
    await userEvent.upload(input, file);
    
    await waitFor(() => {
      expect(autoContentApi.uploadSource).toHaveBeenCalledWith(file);
      expect(autoContentApi.analyzeSource).toHaveBeenCalled();
      expect(storageService.saveSources).toHaveBeenCalled();
      expect(mockOnSourcesUpdate).toHaveBeenCalled();
    });
  });

  it('handles URL input', async () => {
    const mockProcessResponse = {
      request_id: 'test_123',
      status: 'completed',
      content: 'URL content',
      metadata: {
        title: 'Test URL',
        summary: 'URL summary'
      }
    };

    (autoContentApi.createContent as jest.Mock).mockResolvedValue(mockProcessResponse);
    (autoContentApi.analyzeSource as jest.Mock).mockResolvedValue({
      summary: 'Analysis summary',
      topics: ['topic1']
    });

    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    // Switch to URL tab
    fireEvent.click(screen.getByText('Link'));
    
    const urlInput = screen.getByPlaceholderText(/enter url/i);
    await userEvent.type(urlInput, 'https://example.com');
    
    fireEvent.click(screen.getByText('Add'));
    
    await waitFor(() => {
      expect(autoContentApi.createContent).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'https://example.com',
          outputType: 'url_content'
        })
      );
      expect(storageService.saveSources).toHaveBeenCalled();
    });
  });

  it('handles text input', async () => {
    const mockProcessResponse = {
      request_id: 'test_123',
      status: 'completed',
      content: 'Processed text',
      metadata: {
        summary: 'Text summary'
      }
    };

    (autoContentApi.createContent as jest.Mock).mockResolvedValue(mockProcessResponse);
    (autoContentApi.analyzeSource as jest.Mock).mockResolvedValue({
      summary: 'Analysis summary',
      topics: ['topic1']
    });

    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    // Switch to text tab
    fireEvent.click(screen.getByText('Text'));
    
    const textInput = screen.getByPlaceholderText(/paste.*text/i);
    await userEvent.type(textInput, 'Test content');
    
    fireEvent.click(screen.getByText('Add'));
    
    await waitFor(() => {
      expect(autoContentApi.createContent).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Test content',
          outputType: 'text_content'
        })
      );
      expect(storageService.saveSources).toHaveBeenCalled();
    });
  });

  it('shows progress during processing', async () => {
    (autoContentApi.uploadSource as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload/i);
    
    await userEvent.upload(input, file);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });

  it('handles processing errors', async () => {
    (autoContentApi.uploadSource as jest.Mock).mockRejectedValue(new Error('Upload failed'));

    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload/i);
    
    await userEvent.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });
});