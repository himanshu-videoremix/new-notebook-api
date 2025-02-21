import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadInterface } from '@/components/upload-interface';
import { api } from '@/lib/api';

jest.mock('@/lib/api');

describe('UploadInterface', () => {
  const mockOnClose = jest.fn();
  const mockOnSourcesUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload interface', () => {
    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );
    expect(screen.getByText('Add sources')).toBeInTheDocument();
  });

  it('handles file uploads', async () => {
    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload/i);
    
    await userEvent.upload(input, file);
    
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  it('validates file size', async () => {
    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload/i);
    
    await userEvent.upload(input, largeFile);
    
    expect(screen.getByText(/file too large/i)).toBeInTheDocument();
  });

  it('validates file type', async () => {
    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    const input = screen.getByLabelText(/upload/i);
    
    await userEvent.upload(input, invalidFile);
    
    expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
  });

  it('handles external sources', async () => {
    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    // Click link button
    fireEvent.click(screen.getByText('Link'));
    
    // Enter URL
    const urlInput = screen.getByPlaceholderText('Enter URL...');
    await userEvent.type(urlInput, 'https://example.com');
    
    // Add link
    fireEvent.click(screen.getByText('Add'));
    
    expect(mockOnSourcesUpdate).toHaveBeenCalled();
  });

  it('validates URLs', async () => {
    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    fireEvent.click(screen.getByText('Link'));
    
    const urlInput = screen.getByPlaceholderText('Enter URL...');
    await userEvent.type(urlInput, 'invalid-url');
    
    fireEvent.click(screen.getByText('Add'));
    
    expect(screen.getByText(/invalid url/i)).toBeInTheDocument();
  });

  it('closes modal', () => {
    render(
      <UploadInterface 
        onClose={mockOnClose}
        onSourcesUpdate={mockOnSourcesUpdate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});