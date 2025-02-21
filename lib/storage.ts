// Constants
const STORAGE_KEYS = {
  SOURCES: 'smartnotebook_sources',
  SUMMARIES: 'smartnotebook_summaries',
  CONTENT: 'smartnotebook_content',
  METADATA: 'smartnotebook_metadata'
} as const;

// Types
interface StoredSource {
  id: string;
  title: string;
  content: string;
  type: string;
  selected: boolean;
  timestamp: number;
  metadata?: {
    summary?: string;
    rawContent?: string;
  };
}

// Storage Service
export const storageService = {
  // Save sources to localStorage
  saveSources(sources: StoredSource[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
    } catch (error) {
      console.error('Failed to save sources:', error);
    }
  },

  // Load sources from localStorage
  loadSources(): StoredSource[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SOURCES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load sources:', error);
      return [];
    }
  },

  // Update source selection
  updateSourceSelection(sourceId: string, selected: boolean) {
    try {
      const sources = this.loadSources();
      const updatedSources = sources.map(source => 
        source.id === sourceId ? { ...source, selected } : source
      );
      this.saveSources(updatedSources);
      return updatedSources;
    } catch (error) {
      console.error('Failed to update source selection:', error);
      return [];
    }
  },

  // Select all sources
  selectAllSources(selected: boolean) {
    try {
      const sources = this.loadSources();
      const updatedSources = sources.map(source => ({ ...source, selected }));
      this.saveSources(updatedSources);
      return updatedSources;
    } catch (error) {
      console.error('Failed to select all sources:', error);
      return [];
    }
  },

  // Delete source
  deleteSource(sourceId: string) {
    try {
      const sources = this.loadSources();
      const updatedSources = sources.filter(source => source.id !== sourceId);
      this.saveSources(updatedSources);
      return updatedSources;
    } catch (error) {
      console.error('Failed to delete source:', error);
      return [];
    }
  },

  // Save source metadata
  saveSourceMetadata(sourceId: string, metadata: any) {
    try {
      const key = `${STORAGE_KEYS.METADATA}_${sourceId}`;
      localStorage.setItem(key, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to save source metadata:', error);
    }
  },

  // Load source metadata
  loadSourceMetadata(sourceId: string) {
    try {
      const key = `${STORAGE_KEYS.METADATA}_${sourceId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load source metadata:', error);
      return null;
    }
  },

  // Clear all stored data
  clearStorage() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};