// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.autocontentapi.com/v1',
  endpoints: {
    content: {
      create: '/content/create',
      modifyPodcast: '/content/ModifyPodcast',
      cloneVoice: '/content/CloneVoice',
      getVoices: '/content/GetVoices'
    },
    status: '/content/Status',
    usage: '/content/Usage',
    list: '/content/List'
  },
  contentTypes: {
    text: 'text',
    faq: 'faq',
    studyGuide: 'study_guide',
    timeline: 'timeline',
    briefing: 'briefing',
    deepDive: 'deep_dive'
  },
  defaultOptions: {
    format: 'structured',
    tone: 'professional',
    length: 'medium',
    style: 'educational',
    depth: 'balanced',
    audience: 'general',
    complexity: 'intermediate'
  }
} as const;

// API Error Types
export interface ApiError extends Error {
  status?: number;
  code?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}

// API Validation
export const validateApiConfig = () => {
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  
  if (!API_KEY) {
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

  if (typeof API_KEY !== 'string' || API_KEY.trim().length < 8) {
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

// API Error Handling
export const handleApiError = (error: unknown, context?: string): never => {
  if (error instanceof Error) {
    console.error(`API Error (${context || 'unknown context'}):`, {
      message: error.message,
      stack: error.stack,
      context
    });
    throw error;
  }

  if (typeof error === 'string') {
    console.error(`API Error (${context || 'unknown context'}):`, error);
    throw new Error(error);
  }

  console.error(`Unknown API Error (${context || 'unknown context'}):`, error);
  throw new Error('An unexpected error occurred');
};

// API Response Handling
export const handleApiResponse = async <T>(response: Response, context?: string): Promise<T> => {
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

// Mock Response Generator
export const generateMockResponse = <T>(data: T): ApiResponse<T> => ({
  data,
  status: 'success'
});

export interface ProcessRequest {
  text: string;
  outputType: string;
  resources?: Array<{ content: string; type: string }>;
  customization?: {
    format?: string;
    tone?: string;
    length?: string;
    voice1?: string;
    voice2?: string;
    speakers?: {
      host1: string;
      host2: string;
    };
    audio?: {
      backgroundMusic?: {
        enabled: boolean;
        volume: number;
        genre?: string;
        track?: string;
      };
      soundEffects?: {
        enabled: boolean;
        volume: number;
        transitions?: boolean;
        ambience?: boolean;
      };
      postProcessing?: {
        normalization?: boolean;
        noiseReduction?: boolean;
        compression?: boolean;
        equalization?: boolean;
        reverb?: boolean;
      };
      chapters?: {
        enabled: boolean;
        markers: Array<{
          title: string;
          timestamp: number;
        }>;
      };
      mixing?: {
        voiceVolume: number;
        musicVolume: number;
        effectsVolume: number;
      };
    };
  };
  includeCitations: boolean;
  voice1?: number;
  voice2?: number;
}

export interface ModifyPodcastRequest {
  audioUrl: string;
  voice1: number;
  voice2: number;
  instructions?: string;
  callbackData?: string;
}

export interface CloneVoiceRequest {
  name: string;
  audioFile: File;
  gender?: 'male' | 'female';
  language?: string;
  accent?: string;
  style?: string;
}

export interface CloneVoiceResponse {
  voiceId: string;
  name: string;
  previewUrl?: string;
  status: 'completed' | 'failed';
  errorMessage?: string;
}

export interface ModifyPodcastResponse {
  requestId: string;
  errorMessage?: string;
}

export interface ProcessResponse {
  request_id: string;
  status?: string;
  content?: string;
  error?: string;
  audio_url?: string;
}