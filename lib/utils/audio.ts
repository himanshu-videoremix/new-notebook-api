let currentPreview: HTMLAudioElement | null = null;

export const audioPreviewUtils = {
  playPreview: async (url: string, apiKey?: string) => {
    try {
      // Stop any currently playing preview
      if (currentPreview) {
        currentPreview.pause();
        currentPreview.remove();
        currentPreview = null;
      }

      // Create and play new preview
      const audio = new Audio();

      // Add API key if provided
      if (apiKey) {
        audio.crossOrigin = "anonymous";
        const urlObj = new URL(url);
        urlObj.searchParams.append("key", apiKey);
        url = urlObj.toString();
      }

      // Set the source after configuring crossOrigin
      audio.src = url;

      // Add loading state handlers
      audio.addEventListener("loadstart", () => {
        console.log("Loading audio preview...");
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio preview error:", e);
        throw new Error("Could not play voice preview");
      });

      audio.addEventListener("ended", () => {
        audio.remove();
        currentPreview = null;
      });

      // Prevent user actions from interrupting playback
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            currentPreview = audio;
          })
          .catch((error) => {
            console.error("Failed to play audio preview:", error);
            throw new Error("Could not play voice preview");
          });
      }

      return playPromise;
    } catch (error) {
      console.error("Error in playPreview:", error);
      throw error;
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
  },
};
