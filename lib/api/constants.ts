// API Configuration Constants
export const API_CONSTANTS = {
  // Rate Limiting
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  REQUEST_TIMEOUT: 30000,
  POLL_INTERVAL: 1000,

  // Content Limits
  MAX_CONTENT_LENGTH: 50000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Voice Settings
  VOICE_SETTINGS: {
    DEFAULT_SPEED: 1.0,
    DEFAULT_PITCH: 1.0,
    SPEED_RANGE: { min: 0.8, max: 1.2 },
    PITCH_RANGE: { min: 0.8, max: 1.2 },
    EMPHASIS_LEVELS: ['light', 'moderate', 'strong'],
    EMOTION_INTENSITIES: ['low', 'medium', 'high']
  },

  // Content Types
  VALID_FILE_TYPES: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'audio/mpeg',
    'audio/wav'
  ],

  // Default Voices
  DEFAULT_VOICES: [
    {
      id: 'en_us_001',
      name: 'Matthew',
      language: 'en-US',
      gender: 'm',
      accent: 'american'
    },
    {
      id: 'en_us_002',
      name: 'Joanna',
      language: 'en-US',
      gender: 'f',
      accent: 'american'
    }
  ]
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Invalid API key configuration',
  FILE_TOO_LARGE: 'File size exceeds maximum limit of 10MB',
  INVALID_FILE_TYPE: 'Invalid file type. Supported types: PDF, TXT, MD, MP3, WAV',
  NETWORK_ERROR: 'Network error occurred. Please check your connection',
  TIMEOUT_ERROR: 'Request timed out. Please try again',
  PROCESSING_ERROR: 'Content processing failed',
  VOICE_CLONE_ERROR: 'Voice cloning failed',
  INVALID_CONTENT: 'Invalid content provided'
} as const;

// HTTP Headers
export const HTTP_HEADERS = {
  DEFAULT: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'SmartNotebook/1.0'
  },
  MULTIPART: {
    'Accept': 'application/json',
    'User-Agent': 'SmartNotebook/1.0'
  }
} as const;