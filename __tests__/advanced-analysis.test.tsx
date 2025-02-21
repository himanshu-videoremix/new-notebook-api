import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdvancedAnalysisPanel } from '@/components/advanced-analysis-panel';
import { api } from '@/lib/api';

jest.mock('@/lib/api');

describe('AdvancedAnalysisPanel', () => {
  const mockOnAnalysisComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders analysis options', () => {
    render(
      <AdvancedAnalysisPanel
        selectedContent="test content"
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    expect(screen.getByText('Sentiment')).toBeInTheDocument();
    expect(screen.getByText('Arguments')).toBeInTheDocument();
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });

  it('performs sentiment analysis', async () => {
    (api.analyzeContentSentiment as jest.Mock).mockResolvedValue({
      sentiment: 'positive',
      confidence: 0.8
    });

    render(
      <AdvancedAnalysisPanel
        selectedContent="test content"
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    fireEvent.click(screen.getByText('Sentiment'));

    await waitFor(() => {
      expect(api.analyzeContentSentiment).toHaveBeenCalledWith(
        'test content',
        expect.any(Object)
      );
      expect(mockOnAnalysisComplete).toHaveBeenCalled();
    });
  });

  it('performs argumentation analysis', async () => {
    (api.extractArgumentation as jest.Mock).mockResolvedValue({
      arguments: ['arg1', 'arg2'],
      evidence: ['evidence1', 'evidence2']
    });

    render(
      <AdvancedAnalysisPanel
        selectedContent="test content"
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    fireEvent.click(screen.getByText('Arguments'));

    await waitFor(() => {
      expect(api.extractArgumentation).toHaveBeenCalledWith(
        'test content',
        expect.any(Object)
      );
      expect(mockOnAnalysisComplete).toHaveBeenCalled();
    });
  });

  it('handles analysis errors', async () => {
    (api.analyzeContentSentiment as jest.Mock).mockRejectedValue(new Error('Analysis failed'));

    render(
      <AdvancedAnalysisPanel
        selectedContent="test content"
        onAnalysisComplete={mockOnAnalysisComplete}
      />
    );

    fireEvent.click(screen.getByText('Sentiment'));

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });
});