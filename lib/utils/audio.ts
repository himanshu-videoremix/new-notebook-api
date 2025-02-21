let currentPreview: HTMLAudioElement | null = null;

export const audioPreviewUtils = {
  playPreview: async (url: string, apiKey?: string) => {
    // Stop any currently playing preview
    if (currentPreview) {
      currentPreview.pause();
      currentPreview.remove();
      currentPreview = null;
    }

    // Create and play new preview
    const audio = new Audio(url);

    // Add API key if provided
    if (apiKey) {
      audio.crossOrigin = 'anonymous';
      const originalSrc = audio.src;
      const urlObj = new URL(originalSrc);
      urlObj.searchParams.append('key', apiKey);
      audio.src = urlObj.toString();
    }
    
    // Add loading state handlers
    audio.addEventListener('loadstart', () => {
      console.log('Loading audio preview...');
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio preview error:', e);
      throw new Error('Could not play voice preview');
    });

    audio.addEventListener('ended', () => {
      audio.remove();
      currentPreview = null;
    });

    // Add cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (currentPreview) {
        currentPreview.pause();
        currentPreview.remove();
      }
    });
    
    try {
      await audio.play();
      currentPreview = audio;
    } catch (error) {
      console.error('Failed to play audio preview:', error);
      throw new Error('Could not play voice preview');
    }
  },

  stopPreview: () => {
    if (currentPreview) {
      currentPreview.pause();
      currentPreview.remove();
      currentPreview = null;
    }
  },

  isPlaying: () => {
    return currentPreview !== null && !currentPreview.paused;
  }
};