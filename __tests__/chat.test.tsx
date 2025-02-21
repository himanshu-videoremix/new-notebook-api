import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from '@/components/chat-interface';
import { api } from '@/lib/api';

jest.mock('@/lib/api');

describe('ChatInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat interface', () => {
    render(<ChatInterface onShowUpload={() => {}} />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('sends messages and displays responses', async () => {
    (api.generateStudioContent as jest.Mock).mockResolvedValue({
      content: 'Test response'
    });

    render(<ChatInterface onShowUpload={() => {}} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, 'Test message');
    
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('Test response')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (api.generateStudioContent as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<ChatInterface onShowUpload={() => {}} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, 'Test message');
    
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/error generating/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while generating response', async () => {
    (api.generateStudioContent as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<ChatInterface onShowUpload={() => {}} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, 'Test message');
    
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('handles enter key press', async () => {
    render(<ChatInterface onShowUpload={() => {}} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, 'Test message{enter}');
    
    expect(input).toHaveValue('');
  });

  it('prevents empty messages', async () => {
    render(<ChatInterface onShowUpload={() => {}} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });
});