// Type definitions for studio-related components
export type ContentType = 
  | 'readability' 
  | 'argumentation' 
  | 'sentiment' 
  | 'topics' 
  | 'entities' 
  | 'keywords'
  | 'semantic'
  | 'concepts'
  | 'citations'
  | 'compare'
  | 'study_guide'
  | 'flashcards'
  | 'questions'
  | 'timeline'
  | 'outline'
  | 'deep_dive';

export type SectionType = 
  | 'deepDive' 
  | 'study' 
  | 'analysis' 
  | 'advanced' 
  | 'export' 
  | null;

export interface ContentItem {
  id: string;
  type: ContentType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
}

export interface StudioSidebarProps {
  usage: { 
    requests_used: number; 
    requests_limit: number; 
  };
  onCustomize: () => void;
  onGenerate: (type: ContentType) => void;
  isGenerating: boolean;
  isCustomizing: boolean;
  hasSelectedSources: boolean;
  onRefreshUsage: () => void;
  onRefreshContent: () => void;
  contentList: ContentItem[];
  contentStatus: Record<string, string>;
  onCheckStatus: (id: string) => void;
}