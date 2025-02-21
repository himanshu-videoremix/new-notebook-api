// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const AUTOCONTENT_API_URL = "https://api.autocontentapi.com/v1";

import { ProcessRequest, ProcessResponse, ContentStatus } from './types/api';


// API Endpoints
const ENDPOINTS = {
  create: '/Content/Create',
  status: '/Content/Status',
  usage: '/Content/Usage',
  list: '/Content/List',
  webhook: '/Content/Webhook',
  studio: {
    analyze: '/Studio/Analyze',
    generate: '/Studio/Generate',
    compare: '/Studio/Compare',
    export: '/Studio/Export',
    tools: {
      summarize: '/Studio/Tools/Summarize',
      highlight: '/Studio/Tools/Highlight',
      annotate: '/Studio/Tools/Annotate',
      search: '/Studio/Tools/Search'
    },
    collaboration: {
      share: '/Studio/Collaboration/Share',
      comments: '/Studio/Collaboration/Comments',
      versions: '/Studio/Collaboration/Versions'
    },
    export: {
      pdf: '/Studio/Export/PDF',
      docx: '/Studio/Export/DOCX',
      markdown: '/Studio/Export/Markdown'
    }
  }
} as const;

const POLL_INTERVAL = 5000;
const OFFLINE_MODE = process.env.NODE_ENV === 'development';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Enhanced API config validation
const validateApiConfig = () => {
  if (!API_URL || !API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      return {
        valid: true,
        mock: true,
        message: 'Running in development mode with mock data'
      };
    }
    return {
      valid: false,
      mock: false,
      message: 'Missing API configuration'
    };
  }
  
  // Validate API key format
  // Allow any non-empty string that's not obviously invalid
  if (!API_KEY || typeof API_KEY !== 'string' || API_KEY.trim().length < 8) {
    return {
      valid: false,
      mock: false,
      message: 'Invalid API key format'
    };
  }
  
  return {
    valid: true,
    mock: false,
    message: 'Valid API configuration'
  };
};

// Retry mechanism for failed requests
const retryRequest = async (fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error instanceof Error) {
      // Only retry on network errors or 5xx server errors
      if (
        error.name === 'TypeError' || // Network errors
        (error instanceof Response && error.status >= 500)
      ) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryRequest(fn, retries - 1);
      }
    }
    throw error;
  }
};

interface ApiError extends Error {
  status?: number;
  code?: string;
}

const handleApiError = (error: unknown, context?: string): never => {
  // If it's already an Error instance, just throw it
  if (error instanceof Error) {
    console.error(`API Error (${context || 'unknown context'}):`, {
      message: error.message,
      stack: error.stack,
      context
    });
    throw error;
  }

  // If it's a string, wrap it in an Error
  if (typeof error === 'string') {
    console.error(`API Error (${context || 'unknown context'}):`, error);
    throw new Error(error);
  }

  // Otherwise create a generic error
  console.error(`Unknown API Error (${context || 'unknown context'}):`, error);
  throw new Error('An unexpected error occurred. Please try again later.');
};

const handleResponse = async (response: Response, context?: string) => {
  if (!response.ok) {
    const errorBody = await response.text();
    let parsedError;
    try {
      parsedError = JSON.parse(errorBody);
    } catch {
      parsedError = { message: errorBody };
    }

    const error = new Error(
      parsedError?.message || 
      `HTTP error! status: ${response.status} (${context || 'unknown context'})`
    ) as ApiError;
    error.status = response.status;
    error.code = parsedError?.code;

    throw error;
  }
  return response.json();
};

export const api = {
  validateApiConfig,
  
  async createDeepDiveContent(resources: string[], text: string, options: {
    outputType?: 'text' | 'audio';
    includeCitations?: boolean;
    customization?: any;
  } = {}) {
    try {
      const url = `${AUTOCONTENT_API_URL}/Content/Create`;
      const headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        resources: resources.map(r => ({
          content: r,
          type: r.split('.').pop() || 'text'
        })),
        text,
        includeCitations: options.includeCitations ?? false,
        outputType: options.outputType || 'text',
        customization: options.customization
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`AutoContent API error: ${errorData}`);
      }

      const data = await response.json();
      
      // Handle request_id for polling if needed
      if (data.request_id) {
        const result = await this.pollStatus(data.request_id);
        if (result.status === 'completed') {
          return {
            content: result.content,
            request_id: data.request_id,
            audio_url: result.audio_url
          };
        }
        throw new Error('Content generation failed or timed out');
      }

      return data;
    } catch (error) {
      console.error('AutoContent API error:', error);
      throw error;
    }
  },

  async analyzeContentSentiment(content: string, options: any) {
    try {
      throw new Error('API configuration is invalid');
    } catch (error) {
      return handleApiError(error, 'analyzeContentSentiment');
    }
  },

  async extractKeywords(content: string, options: { maxKeywords: number }) {
    try {
      throw new Error('API configuration is invalid');
    } catch (error) {
      return handleApiError(error, 'extractKeywords');
    }
  },

  async extractEntities(content: string, options?: { types?: string[]; minConfidence?: number }) {
    try {
      throw new Error('API configuration is invalid');
    } catch (error) {
      return handleApiError(error, 'extractEntities');
    }
  },

  async analyzeReadability(content: string) {
    try {
      throw new Error('API configuration is invalid');
    } catch (error) {
      return handleApiError(error, 'analyzeReadability');
    }
  },

  async extractArgumentation(content: string, options: any) {
    try {
      throw new Error('API configuration is invalid');
    } catch (error) {
      return handleApiError(error, 'extractArgumentation');
    }
  },

  async createContent(request: ProcessRequest): Promise<ProcessResponse> {
    try {
      if (!validateApiConfig()) {
        if (OFFLINE_MODE) {
          return mockResponse(request);
        }
        throw new Error('API configuration is invalid');
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.create}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SmartNotebook/1.0'
        },
        body: JSON.stringify(request)
      });

      return handleResponse(response, 'createContent');
    } catch (error) {
      return handleApiError(error, 'createContent');
    }
  },

  async summarizeSource(sourceId: string, options: {
    length?: 'short' | 'medium' | 'long';
    format?: 'paragraph' | 'bullet';
    focus?: 'overview' | 'key_points';
    includeKeyPoints?: boolean;
  }): Promise<ProcessResponse> {
    try {
      if (!validateApiConfig()) {
        if (OFFLINE_MODE) {
          return {
            content: `Mock summary for source: ${sourceId}`,
            status: 'completed'
          };
        }
        throw new Error('API configuration is invalid');
      }

      const response = await fetch(`${API_URL}/Content/Summarize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SmartNotebook/1.0'
        },
        body: JSON.stringify({
          sourceId,
          customization: options
        })
      });

      return handleResponse(response, 'summarizeSource');
    } catch (error) {
      return handleApiError(error, 'summarizeSource');
    }
  },

  async generateFlashcards(sourceId: string, options: { count: number; complexity: string }) {
    return this.createContent({
      resources: [{ content: sourceId, type: 'source' }],
      outputType: 'flashcards',
      includeCitations: true,
      customization: options
    });
  },

  async generateQuestions(sourceId: string, options: { count: number; difficulty: string; type: string }) {
    return this.createContent({
      resources: [{ content: sourceId, type: 'source' }],
      outputType: 'questions',
      includeCitations: true,
      customization: options
    });
  },

  async generateOutline(sources: string[], options: { depth: number; format: string; includeExamples: boolean }) {
    return this.createContent({
      resources: sources.map(s => ({ content: s, type: 'source' })),
      outputType: 'outline',
      includeCitations: true,
      customization: options
    });
  },

  async analyzeReadability(sourceId: string) {
    return this.createContent({
      resources: [{ content: sourceId, type: 'source' }],
      outputType: 'readability',
      includeCitations: false
    });
  },

  async extractTopics(sourceId: string, options: { maxTopics: number; minConfidence: number }) {
    return this.createContent({
      resources: [{ content: sourceId, type: 'source' }],
      outputType: 'topics',
      includeCitations: false,
      customization: options
    });
  },

  async extractEntities(sourceId: string, options: { types: string[]; minConfidence: number }) {
    return this.createContent({
      resources: [{ content: sourceId, type: 'source' }],
      outputType: 'entities',
      includeCitations: false,
      customization: options
    });
  },

  async extractKeywords(sourceId: string, options: { maxKeywords: number; minRelevance: number }) {
    return this.createContent({
      resources: [{ content: sourceId, type: 'source' }],
      outputType: 'keywords',
      includeCitations: false,
      customization: options
    });
  },

  async compareDocuments(sourceIds: string[], options: { aspects: string[]; format: string }) {
    return this.createContent({
      resources: sourceIds.map(s => ({ content: s, type: 'source' })),
      outputType: 'compare',
      includeCitations: true,
      customization: options
    });
  },

  async findSimilarSources(sourceId: string, options: { maxResults: number; minSimilarity: number }) {
    return this.createContent({
      resources: [{ content: sourceId, type: 'source' }],
      outputType: 'similar',
      includeCitations: true,
      customization: options
    });
  },

  async uploadSource(file: File): Promise<ProcessResponse> {
    try {
      if (!validateApiConfig()) {
        if (OFFLINE_MODE) {
          return {
            content: `Mock upload response for: ${file.name}`,
            status: 'completed'
          };
        }
        throw new Error('API configuration is invalid');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/Content/Upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'User-Agent': 'SmartNotebook/1.0'
        },
        body: formData
      });

      return handleResponse(response, 'uploadSource');
    } catch (error) {
      return handleApiError(error, 'uploadSource');
    }
  },

  async getContentStatus(id: string): Promise<ContentStatus> {
    try {
      if (!validateApiConfig()) {
        throw new Error('Invalid API configuration');
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.status}/${id}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return handleResponse(response, 'getContentStatus');
    } catch (error) {
      return handleApiError(error, 'getContentStatus');
    }
  },

  async getUsage(): Promise<{ used: number; limit: number }> {
    try {
      if (!validateApiConfig()) {
        throw new Error('Invalid API configuration');
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.usage}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return handleResponse(response, 'getUsage');
    } catch (error) {
      return handleApiError(error, 'getUsage');
    }
  },

  async getContentList(): Promise<any[]> {
    try {
      if (!validateApiConfig()) {
        throw new Error('Invalid API configuration');
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.list}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return handleResponse(response, 'getContentList');
    } catch (error) {
      return handleApiError(error, 'getContentList');
    }
  },

  async setWebhook(url: string): Promise<void> {
    try {
      if (!validateApiConfig()) {
        throw new Error('Invalid API configuration');
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.webhook}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      return handleResponse(response, 'setWebhook');
    } catch (error) {
      return handleApiError(error, 'setWebhook');
    }
  },

  async getWebhook(): Promise<{ url?: string }> {
    try {
      if (!validateApiConfig()) {
        throw new Error('Invalid API configuration');
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.webhook}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return handleResponse(response, 'getWebhook');
    } catch (error) {
      return handleApiError(error, 'getWebhook');
    }
  },

  async analyzeStudio(content: string, type: string, options?: any) {
    try {
      if (!validateApiConfig()) {
        return mockResponse({ type: 'analysis', content });
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.studio.analyze}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, type, options })
      });

      return handleResponse(response, 'analyzeStudio');
    } catch (error) {
      return handleApiError(error, 'analyzeStudio');
    }
  },

  async generateStudioContent(type: string, options: any) {
    try {
      if (!validateApiConfig()) {
        return mockResponse({ type: 'generation', options });
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.studio.generate}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, ...options })
      });

      return handleResponse(response, 'generateStudioContent');
    } catch (error) {
      return handleApiError(error, 'generateStudioContent');
    }
  },

  async compareStudioContent(contents: string[], options?: any) {
    try {
      if (!validateApiConfig()) {
        return mockResponse({ type: 'comparison', contents });
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.studio.compare}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents, options })
      });

      return handleResponse(response, 'compareStudioContent');
    } catch (error) {
      return handleApiError(error, 'compareStudioContent');
    }
  },

  async exportStudioContent(content: string, format: string) {
    try {
      if (!validateApiConfig()) {
        return mockResponse({ type: 'export', content, format });
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.studio.export}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, format })
      });

      return handleResponse(response, 'exportStudioContent');
    } catch (error) {
      return handleApiError(error, 'exportStudioContent');
    }
  },

  async highlightContent(content: string, terms: string[]) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.studio.tools.highlight}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, terms })
      });
      return handleResponse(response, 'highlightContent');
    } catch (error) {
      return handleApiError(error, 'highlightContent');
    }
  },

  async annotateContent(content: string, annotations: Array<{
    text: string;
    note: string;
    type: 'comment' | 'definition' | 'reference'
  }>) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.studio.tools.annotate}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, annotations })
      });
      return handleResponse(response, 'annotateContent');
    } catch (error) {
      return handleApiError(error, 'annotateContent');
    }
  },

  async searchContent(query: string, options: {
    sources: string[];
    type: 'semantic' | 'keyword';
    maxResults?: number;
  }) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.studio.tools.search}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, ...options })
      });
      return handleResponse(response, 'searchContent');
    } catch (error) {
      return handleApiError(error, 'searchContent');
    }
  },

  async getVersionHistory(contentId: string) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.studio.collaboration.versions}/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return handleResponse(response, 'getVersionHistory');
    } catch (error) {
      return handleApiError(error, 'getVersionHistory');
    }
  },

  async addComment(contentId: string, comment: {
    text: string;
    position?: { start: number; end: number };
  }) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.studio.collaboration.comments}/${contentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
      });
      return handleResponse(response, 'addComment');
    } catch (error) {
      return handleApiError(error, 'addComment');
    }
  },

  async getStudioData() {
    try {
      if (!validateApiConfig()) {
        if (process.env.NODE_ENV !== 'development') {
          throw new Error('Invalid API configuration');
        }

  async modifyPodcast(audioUrl: string, voice1: number, voice2: number, instructions?: string) {
    try {
      const request: ModifyPodcastRequest = {
        audioUrl,
        voice1,
        voice2,
        instructions
      };

      const response = await autoContentApi.modifyPodcast(request);
      
      if (response.errorMessage) {
        throw new Error(response.errorMessage);
      }

      // Poll for status if needed
      if (response.requestId) {
        const result = await autoContentApi.pollStatus(response.requestId);
        if (result.status === 'completed') {
          return {
            audioUrl: result.audio_url,
            requestId: response.requestId
          };
        }
        throw new Error('Podcast modification failed or timed out');
      }

      return response;
    } catch (error) {
      console.error('Failed to modify podcast:', error);
      throw error;
    }
  },
        console.warn('Using mock data in development mode');
        return {
          data: {
            contents: [],
            usage: { requests_used: 0, requests_limit: 50 },
            history: []
          }
        };
      }

      // Check network connectivity
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('No internet connection - Using offline mode');
        return {
          data: {
            contents: [],
            usage: { requests_used: 0, requests_limit: 50 },
            history: []
          }
        };
      }

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn('Request timed out - Using offline mode');
      }, 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/studio/data`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SmartNotebook/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status || 'unknown',
          statusText: response.statusText || 'No status text',
          body: errorText || 'No error text'
        });
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Enhanced response validation
      if (!data || typeof data !== 'object' || !('contents' in data)) {
        console.warn('Invalid response structure - Using default values');
        return {
          data: {
            contents: [],
            usage: { requests_used: 0, requests_limit: 50 },
            history: []
          }
        };
      }

      return {
        data: {
          contents: data?.contents || [],
          usage: data?.usage || { requests_used: 0, requests_limit: 50 },
          history: data?.history || []
        }
      };
    } catch (error) {
      // Enhanced error logging with specific error types
      const errorDetails = {
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        apiUrl: API_URL,
        timestamp: new Date().toISOString(),
        offline: !navigator.onLine
      };

      console.error('Studio data fetch error:', {
        ...errorDetails,
        stack: error instanceof Error ? error.stack : undefined
      });

      // Return offline data for specific error types
      if (
        error instanceof TypeError || // Network errors
        error.name === 'AbortError' || // Timeout
        !navigator.onLine // Offline
      ) {
        console.warn('Network error - Using offline mode');
        return {
          data: {
            contents: [],
            usage: { requests_used: 0, requests_limit: 50 },
            history: []
          }
        };
      }

      throw error;
    }
  }
};

// Mock response generator for offline mode
function mockResponse(request: ProcessRequest): ProcessResponse {
  const requestId = `mock_${Date.now()}`;
  
  // Store mock request for status polling
  localStorage.setItem(requestId, JSON.stringify({
    status: 'completed',
    content: `Mock ${request.outputType} response for offline mode`
  }));

  return {
    request_id: requestId
  };
}