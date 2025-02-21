// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.autocontentapi.com';
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// Message Limits
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_MESSAGES = 100;

// API Configuration
export const MAX_RETRIES = 5;
export const RETRY_DELAY = 1000; // 1 second
export const BATCH_SIZE = 5;
export const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Rate Limiting
export const RATE_LIMIT_REQUESTS = 50;
export const RATE_LIMIT_INTERVAL = 3600; // 1 hour in seconds

// OpenAI Configuration
export const OPENAI_RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 60,
  MIN_DELAY_MS: 1000
};

export const OPENAI_CACHE = {
  TTL_MS: 5 * 60 * 1000, // 5 minutes
  MAX_ENTRIES: 100
};

export const OPENAI_DEFAULTS = {
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,
  TOP_P: 0.9,
  FREQUENCY_PENALTY: 0.5,
  PRESENCE_PENALTY: 0.5
};

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  'en', // English
  'es', // Spanish
  'fr', // French
  'de', // German
  'it', // Italian
  'pt', // Portuguese
  'nl', // Dutch
  'pl', // Polish
  'ru', // Russian
  'ja', // Japanese
  'ko', // Korean
  'zh', // Chinese
] as const;

// Content Analysis
export const MAX_KEYWORDS = 20;
export const MIN_KEYWORD_RELEVANCE = 0.5;