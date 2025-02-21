import { autoContentApi } from '@/lib/api';

describe('autoContentApi', () => {
  beforeEach(() => {
    // Clear mocks between tests
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('uploadSource', () => {
    it('validates file size', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
      
      await expect(autoContentApi.uploadSource(largeFile)).rejects.toThrow('File too large');
    });

    it('validates file type', async () => {
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      
      await expect(autoContentApi.uploadSource(invalidFile)).rejects.toThrow('Invalid file type');
    });

    it('uploads valid file successfully', async () => {
      const mockResponse = {
        request_id: 'test_123',
        status: 'completed'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const result = await autoContentApi.uploadSource(file);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/content/create'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );
    });
  });

  describe('processContent', () => {
    it('processes content with correct options', async () => {
      const mockResponse = {
        request_id: 'test_123'
      };

      const mockStatus = {
        status: 'completed',
        content: 'Processed content',
        metadata: { summary: 'Test summary' }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStatus)
        });

      const result = await autoContentApi.processContent('test content', 'text');

      expect(result).toEqual(expect.objectContaining({
        status: 'completed',
        content: 'Processed content'
      }));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/content/create'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test content')
        })
      );
    });

    it('handles processing errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Processing failed'));

      await expect(autoContentApi.processContent('test', 'text'))
        .rejects.toThrow('Processing failed');
    });
  });

  describe('analyzeSource', () => {
    it('analyzes source with comprehensive options', async () => {
      const mockResponse = {
        summary: 'Test summary',
        topics: ['topic1', 'topic2'],
        keywords: ['key1', 'key2'],
        citations: ['cite1', 'cite2']
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await autoContentApi.analyzeSource('test_123');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/studio/analyze'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('comprehensive')
        })
      );
    });

    it('handles analysis errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Analysis failed'));

      await expect(autoContentApi.analyzeSource('test_123'))
        .rejects.toThrow('Analysis failed');
    });
  });
});