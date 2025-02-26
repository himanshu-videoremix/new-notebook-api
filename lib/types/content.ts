export type ContentType = 
  | 'study_guide'
  | 'briefing_doc' 
  | 'faq'
  | 'timeline'
  | 'outline'
  | 'deep_dive'
  | 'flashcards';

export interface ContentOptions {
  // Content Style
  format: 'structured' | 'conversational' | 'bullet';
  tone: 'professional' | 'casual' | 'technical';
  length: 'short' | 'medium' | 'long';
  style: 'educational' | 'debate' | 'interview' | 'storytelling' | 'analytical';
  perspective: 'neutral' | 'critical' | 'supportive' | 'contrasting';
  depth: 'overview' | 'balanced' | 'detailed' | 'expert';
  
  // Target Audience
  audience: 'general' | 'beginner' | 'expert';
  complexity: 'basic' | 'intermediate' | 'advanced';
  
  // Content Elements
  elements: {
    examples: boolean;
    questions: boolean;
    summary: boolean;
    citations: boolean;
    keyPoints: boolean;
    definitions: boolean;
    references: boolean;
  };
  
  // Voice Options (for audio)
  voice1?: string;
  voice2?: string;
  speakers?: {
    host1: string;
    host2: string;
    roles?: {
      host1Role?: string;
      host2Role?: string;
    };
    style?: 'formal' | 'casual' | 'dynamic';
    voiceSettings?: {
      host1: {
        speed: number;
        pitch: number;
        emphasis: 'light' | 'moderate' | 'strong' | 'dramatic';
        emotionIntensity: 'low' | 'medium' | 'high' | 'intense';
        style: 'neutral' | 'formal' | 'casual' | 'professional' | 'friendly' | 'authoritative';
        emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'serious' | 'empathetic' | 'confident';
        age: 'young' | 'adult' | 'senior';
        accent: 'neutral' | 'american' | 'british' | 'australian' | 'indian';
        speed_range: { min: number; max: number };
        pitch_range: { min: number; max: number };
        emphasis_levels: string[];
        emotion_intensities: string[];
      };
      host2: {
        speed: number;
        pitch: number;
        emphasis: 'light' | 'moderate' | 'strong' | 'dramatic';
        emotionIntensity: 'low' | 'medium' | 'high' | 'intense';
        style: 'neutral' | 'formal' | 'casual' | 'professional' | 'friendly' | 'authoritative';
        emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'serious' | 'empathetic' | 'confident';
        age: 'young' | 'adult' | 'senior';
        accent: 'neutral' | 'american' | 'british' | 'australian' | 'indian';
        speed_range: { min: number; max: number };
        pitch_range: { min: number; max: number };
        emphasis_levels: string[];
        emotion_intensities: string[];
      };
    };
  };
  
  // Advanced Options
  advanced?: {
    maxLength?: number;
    minConfidence?: number;
    requireSources?: boolean;
    preserveFormatting?: boolean;
    highlightKeyTerms?: boolean;
    generateMetadata?: boolean;
  };
}

export interface ContentTypeConfig {
  title: string;
  description: string;
  icon: string;
  defaultOptions: Partial<ContentOptions>;
  availableOptions: (keyof ContentOptions)[];
}

export const CONTENT_TYPE_CONFIGS: Record<ContentType, ContentTypeConfig> = {
  study_guide: {
    title: 'Study Guide',
    description: 'A comprehensive guide for learning and revision',
    icon: 'Book',
    defaultOptions: {
      format: 'structured',
      tone: 'educational',
      length: 'long',
      style: 'educational',
      depth: 'detailed',
      audience: 'beginner',
      includeExamples: true,
      includeQuestions: true,
      includeSummary: true,
      includeCitations: false
    },
    availableOptions: [
      'format', 'tone', 'length', 'depth', 'audience', 'complexity',
      'includeExamples', 'includeQuestions', 'includeSummary', 'includeCitations'
    ]
  },
  briefing_doc: {
    title: 'Briefing Document',
    description: 'A concise overview of key points',
    icon: 'FileText',
    defaultOptions: {
      format: 'structured',
      tone: 'professional',
      length: 'medium',
      style: 'analytical',
      depth: 'balanced',
      audience: 'expert',
      includeSummary: true,
      includeCitations: false
    },
    availableOptions: [
      'format', 'tone', 'length', 'depth', 'audience',
      'includeSummary', 'includeCitations'
    ]
  },
  faq: {
    title: 'FAQ',
    description: 'Common questions and detailed answers',
    icon: 'HelpCircle',
    defaultOptions: {
      format: 'structured',
      tone: 'casual',
      length: 'medium',
      style: 'educational',
      depth: 'balanced',
      audience: 'general',
      includeExamples: true
    },
    availableOptions: [
      'tone', 'length', 'audience', 'complexity',
      'includeExamples', 'includeCitations'
    ]
  },
  timeline: {
    title: 'Timeline',
    description: 'Chronological sequence of events',
    icon: 'Clock',
    defaultOptions: {
      format: 'structured',
      tone: 'neutral',
      length: 'medium',
      style: 'analytical',
      depth: 'balanced',
      includeCitations: true
    },
    availableOptions: [
      'format', 'tone', 'length', 'depth',
      'includeCitations'
    ]
  },
  outline: {
    title: 'Outline',
    description: 'Structured overview of topics',
    icon: 'List',
    defaultOptions: {
      format: 'bullet',
      tone: 'professional',
      length: 'medium',
      depth: 'balanced',
      includeSummary: true
    },
    availableOptions: [
      'format', 'tone', 'length', 'depth',
      'includeSummary', 'includeCitations'
    ]
  },
  deep_dive: {
    title: 'Deep Dive',
    description: 'In-depth conversational analysis',
    icon: 'MessageSquare',
    defaultOptions: {
      format: 'conversational',
      tone: 'professional',
      length: 'long',
      style: 'educational',
      depth: 'detailed',
      audience: 'expert',
      includeExamples: true,
      includeQuestions: true,
      includeSummary: true,
      includeCitations: true
    },
    availableOptions: [
      'format', 'tone', 'length', 'style', 'perspective', 'depth',
      'audience', 'complexity', 'includeExamples', 'includeQuestions',
      'includeSummary', 'includeCitations', 'voice1', 'voice2', 'speakers'
    ]
  },
  flashcards: {
    title: 'Flashcards',
    description: 'Study cards for key concepts',
    icon: 'Square',
    defaultOptions: {
      tone: 'educational',
      complexity: 'intermediate',
      includeExamples: true
    },
    availableOptions: [
      'tone', 'complexity', 'includeExamples'
    ]
  }
};