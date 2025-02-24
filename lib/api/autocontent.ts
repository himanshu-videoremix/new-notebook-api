import { ProcessRequest } from "../api";
import {
  ContentStatus,
  handleApiError,
  handleApiResponse,
  ModifyPodcastRequest,
  ModifyPodcastResponse,
  ProcessResponse,
  validateApiConfig,
} from "./types";

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = "dfe22057-4937-464d-8d75-9c04f081acd4";

// API Endpoints
const ENDPOINTS = {
  create: "/Content/Create",
  status: "/Content/Status",
  getVoices: "/Content/GetVoices",
  cloneVoice: "/Content/CloneVoice",
  usage: "/Content/Usage",
  list: "/Content/List",
  webhook: "/Content/Webhook",
  studio: {
    analyze: "/Studio/Analyze",
    generate: "/Studio/Generate",
    compare: "/Studio/Compare",
    export: "/Studio/Export",
    tools: {
      summarize: "/Studio/Tools/Summarize",
      highlight: "/Studio/Tools/Highlight",
      annotate: "/Studio/Tools/Annotate",
      search: "/Studio/Tools/Search",
    },
  },
} as const;

interface Voice {
  id: string;
  name: string;
  language: string;
  gender?: string;
  isCloned?: boolean;
  sourceAudio?: string;
}

interface GenerationOptions {
  format?: string;
  tone?: string;
  length?: string;
  voice1?: string;
  voice2?: string;
  speakers?: {
    host1: string;
    host2: string;
  };
  includeCitations?: boolean;
}

interface VoiceCloneOptions {
  name: string;
  audioFile: File;
  gender?: "male" | "female";
  language?: string;
}

// Mock response generator for offline mode
function mockResponse(request: any): any {
  const requestId = `mock_${Date.now()}`;

  // Store mock request for status polling
  if (typeof window !== "undefined") {
    localStorage.setItem(
      requestId,
      JSON.stringify({
        status: "completed",
        content: `Mock ${request.outputType} response for offline mode`,
      })
    );
  }

  return {
    request_id: requestId,
  };
}

export const autoContentApi = {
  async createDeepDiveContent(
    resources: string[],
    text: string,
    options: {
      outputType?: "text" | "audio";
      includeCitations?: boolean;
      customization?: any;
    } = {}
  ) {
    try {
      const url = `/api/content`;
      const headers = {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const payload = {
        resources: resources.map((r) => ({
          content: r,
          type: "website",
        })),
        text,
        includeCitations: options.includeCitations ?? false,
        outputType: "deep_dive",
        outputFormat: options.outputType || "text",
        customization: options.customization,
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }).catch((error) => {
        console.error("Network error:", error);
        throw new Error(`Network error: ${error.message}`);
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API error response:", errorData);
        throw new Error(`AutoContent API error: ${errorData}`);
      }

      const data = await response.json();

      // Handle request_id for polling if needed
      if (data.request_id) {
        const result = await this.pollStatus(data.request_id);
        if (result.status === "completed") {
          return {
            content: result.content,
            request_id: data.request_id,
            audio_url: result.audio_url,
            metadata: result.metadata,
          };
        }
        throw new Error("Content generation failed or timed out");
      }
      console.log("Content generation", data);
      return data;
    } catch (error) {
      console.error("Deep dive generation error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        resourceCount: resources.length,
      });
      throw error;
    }
  },

  async modifyPodcast(request: ModifyPodcastRequest): Promise<ModifyPodcastResponse> {
    try {
      console.log("Sending modifyPodcast request:", request);
  
      const response = await fetch(`api/modifypodcast`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
      });
  
      console.log("Received response:", response);
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response data:", errorData);
        throw new Error(`Failed to modify podcast: ${errorData}`);
      }
  
      const data = await response.json();
      console.log("Parsed response data:", data);
  
      // If the response contains a request_id, start polling
      if (data.request_id) {
        console.log("Starting polling for request_id:", data.request_id);
        return await this.pollStatus(data.request_id);
      }
  
      return data;
    } catch (error) {
      console.error("Podcast modification error:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
      });
      throw error;
    }
  },
  

  async cloneVoice(audioFile: File, name: string): Promise<Voice> {
    try {
      if (!API_KEY) {
        console.log("API key is missing");
        throw new Error("API key is missing");
      }

      console.log(
        "Received file:",
        audioFile.name,
        "Size:",
        audioFile.size,
        "Type:",
        audioFile.type
      );

      // Validate file size (max 10MB)
      if (audioFile.size > 10 * 1024 * 1024) {
        console.log("Audio file too large:", audioFile.size);
        throw new Error("Audio file must be under 10MB");
      }

      // Validate file type
      if (!audioFile.type.startsWith("audio/")) {
        console.log("Invalid file type:", audioFile.type);
        throw new Error("Invalid file type. Must be an audio file.");
      }

      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("name", name);

      console.log("Sending POST request to /api/clonevoice with name:", name);

      const response = await fetch(`/api/clonevoice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
        body: formData,
      });
      console.log("REsponse", response);
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log("Error data from server:", errorData);
        throw new Error(`Voice cloning failed: ${errorData}`);
      }

      const result = await response.json();
      console.log("Received result:", result);

      // Poll for completion if needed
      if (result.request_id) {
        console.log("Polling status for request_id:", result.request_id);
        const cloneStatus = await this.pollStatus(result.request_id);
        console.log("Clone status:", cloneStatus);
        if (cloneStatus.status === "failed") {
          throw new Error(cloneStatus.error || "Voice cloning failed");
        }
      }

      // Return formatted voice object
      const voiceObject = {
        id: result.voice_id || result.voiceId,
        name: result.name,
        language: "en-US",
        isCloned: true,
        sourceAudio: result.source_audio || result.sourceAudio,
        preview_url: result.preview_url || result.previewUrl,
        gender: result.gender || "unknown",
        accent: result.accent || "neutral",
        settings: {
          speed_range: { min: 0.8, max: 1.2 },
          pitch_range: { min: 0.8, max: 1.2 },
          emphasis_levels: ["light", "moderate", "strong"],
          emotion_intensities: ["low", "medium", "high"],
        },
      };

      console.log("Voice cloning successful:", voiceObject);
      return voiceObject;
    } catch (error) {
      console.error("Voice cloning error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  async getAvailableVoices(): Promise<Voice[]> {
    try {
      console.log("getAvailableVoices() - Start");

      if (!API_KEY) {
        console.warn("API key missing - using default voices");
        return this.getDefaultVoices();
      }

      // Retry configuration
      const maxRetries = 3;
      const retryDelay = 1000;
      let attempt = 0;

      try {
        // Retry loop
        while (attempt < maxRetries) {
          console.log(`Attempt ${attempt + 1} to fetch voices`);

          // Add exponential backoff delay after first attempt
          if (attempt > 0) {
            const delay = retryDelay * Math.pow(2, attempt - 1);
            console.log(`Retry delay: ${delay}ms`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          try {
            // Check network connectivity
            if (typeof window !== "undefined" && !window.navigator.onLine) {
              console.warn("No internet connection, using default voices");
              return this.getDefaultVoices();
            }

            console.log("Fetching voices from API...");

            const response = await fetch("/api/voices", {
              signal: AbortSignal.timeout(10000),
            });

            console.log(`Response Status: ${response.status}`);

            if (!response.ok) {
              const errorText = await response.text();
              console.warn(
                `Voice API error: ${response.status} - ${errorText}`
              );
              return this.getDefaultVoices();
            }

            const voices = await response.json();
            console.log("API Response Data:", voices);

            // Ensure voice data format is correct
            const voiceData = Array.isArray(voices) ? voices : voices?.data;

            if (!Array.isArray(voiceData)) {
              throw new Error("Invalid voice data format");
            }

            // console.log(`Total voices received: ${voiceData.length}`);

            // // Log the raw response data
            // console.log("Raw Voices Data:", JSON.stringify(voiceData, null, 2));

            // Process voices
            const englishVoices = voiceData
              .map((voice) => {
                const formattedVoice = {
                  id: voice.id.toString(),
                  name: voice.name,
                  language: "en-US", // English only
                  gender:
                    voice.gender.toLowerCase() === "f" ? "Female" : "Male",
                  isCloned: false, // Default value
                  accent: "neutral", // Default value
                  preview_url: voice.sampleUrl || null, // Check if sampleUrl exists
                  style: "neutral", // Default value
                  age: "adult", // Default value
                  emotion: "neutral", // Default value
                  speed_range: { min: 0.8, max: 1.2 }, // Default value
                  pitch_range: { min: 0.8, max: 1.2 }, // Default value
                  emphasis_levels: ["light", "moderate", "strong"], // Default value
                  emotion_intensities: ["low", "medium", "high"], // Default value
                };

                // Log individual voice to check if preview_url is present
                // console.log(
                //   `Processed Voice - Name: ${formattedVoice.name}, Preview URL: ${formattedVoice.preview_url}`
                // );

                return formattedVoice;
              })
              .filter((voice) => {
                if (!voice.name || !voice.id) {
                  console.warn(
                    `Skipping invalid voice: ${JSON.stringify(voice)}`
                  );
                  return false;
                }
                return true;
              });

            // Log final filtered list
            // console.log(
            //   "Final Filtered Voices:",
            //   JSON.stringify(englishVoices, null, 2)
            // );

            // Check if any voices are missing preview URLs
            const voicesWithoutPreview = englishVoices.filter(
              (voice) => !voice.preview_url
            );
            if (voicesWithoutPreview.length > 0) {
              console.warn(
                "Some voices are missing preview URLs:",
                JSON.stringify(voicesWithoutPreview, null, 2)
              );
            }

            // Return the processed voices
            if (englishVoices.length === 0) {
              throw new Error("No valid voices found");
            }

            console.log("Returning valid English voices");
            return englishVoices;
          } catch (error) {
            console.error("Error fetching voices:", error);

            const isNetworkError =
              error instanceof Error &&
              (error.name === "TypeError" ||
                error.name === "AbortError" ||
                error.message.includes("Failed to fetch") ||
                error.message.includes("Network request failed") ||
                error.message.includes("No internet connection"));

            // Only retry on network errors
            if (!isNetworkError) {
              throw error; // Don't retry non-network errors
            }

            attempt++;

            if (attempt >= maxRetries || !window.navigator.onLine) {
              throw new Error(`Voice API failed after ${maxRetries} attempts`);
            }

            // Wait before retrying
            console.log("Retrying API call...");
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * Math.pow(2, attempt))
            );
          }
        }

        throw new Error("Failed to fetch voices");
      } catch (error) {
        // If all retries failed, fall back to default voices
        console.warn("Falling back to default voices due to error:", error);
        return this.getDefaultVoices();
      }
    } catch (error) {
      console.error("Voice initialization error:", error);
      return this.getDefaultVoices();
    } finally {
      console.log("getAvailableVoices() - End");
    }
  },

  getDefaultVoices(): Voice[] {
    const defaultVoices = [
      // American English
      {
        id: "en_us_001",
        name: "Matthew",
        language: "en-US",
        gender: "m",
        accent: "american",
      },
      {
        id: "en_us_002",
        name: "Joanna",
        language: "en-US",
        gender: "f",
        accent: "american",
      },
      {
        id: "en_us_003",
        name: "Ivy",
        language: "en-US",
        gender: "f",
        accent: "american",
      },
      {
        id: "en_us_004",
        name: "Justin",
        language: "en-US",
        gender: "m",
        accent: "american",
      },
      // British English
      {
        id: "en_uk_001",
        name: "Emma",
        language: "en-GB",
        gender: "f",
        accent: "british",
      },
      {
        id: "en_uk_002",
        name: "Brian",
        language: "en-GB",
        gender: "m",
        accent: "british",
      },
      // Australian English
      {
        id: "en_au_001",
        name: "Nicole",
        language: "en-AU",
        gender: "f",
        accent: "australian",
      },
      {
        id: "en_au_002",
        name: "Russell",
        language: "en-AU",
        gender: "m",
        accent: "australian",
      },
    ].map((voice) => ({
      ...voice,
      preview_url: null, // Default voices don't have preview URLs
    }));
    return defaultVoices;
  },

  

  async pollStatus(requestId: string, maxAttempts = 30, interval = 2000) {
    let attempts = 0;

    if (!API_KEY) {
      throw new Error("API key is missing. Please check your .env.local file.");
    }

    while (attempts < maxAttempts) {
      const response = await fetch(`${API_URL}/Content/Status/${requestId}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.status === "completed" || result.status === "failed") {
        return result;
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error("Operation timed out");
  },

  async uploadSource(file: File): Promise<ProcessResponse> {
    try {
      if (!validateApiConfig()) {
        throw new Error("API configuration is invalid");
      }

      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error("File too large (max 10MB)");
      }

      const validTypes = ["application/pdf", "text/plain", "text/markdown"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Invalid file type. Supported: PDF, TXT, MD");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/content/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "User-Agent": "SmartNotebook/1.0",
        },
        body: formData,
      });

      return handleResponse(response, "uploadSource");
    } catch (error) {
      console.error("Source upload error:", error);
      return handleApiError(error, "uploadSource");
    }
  },

  async processContent(
    content: string,
    type: string
  ): Promise<ProcessResponse> {
    try {
      if (!validateApiConfig()) {
        if (OFFLINE_MODE) {
          return mockResponse({ type: "process", content });
        }
        throw new Error("Invalid API configuration");
      }

      const request = {
        text: content,
        outputType: type,
        includeCitations: true,
        customization: {
          format: "structured",
          tone: "professional",
          length: "medium",
        },
      };

      const response = await fetch(`${API_URL}${ENDPOINTS.create}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "SmartNotebook/1.0",
        },
        body: JSON.stringify(request),
      });

      const result = await handleResponse(response, "processContent");

      if (result.request_id) {
        // Poll for completion
        let status;
        do {
          status = await this.pollStatus(result.request_id);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } while (status.status === "processing");

        if (status.status === "failed") {
          throw new Error(status.error || "Content processing failed");
        }

        return {
          ...status,
          request_id: result.request_id,
        };
      }

      return result;
    } catch (error) {
      console.error("Content processing error:", error);
      return handleApiError(error, "processContent");
    }
  },

  async analyzeSource(sourceId: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.studio.analyze}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceId,
          type: "comprehensive",
          options: {
            includeSummary: true,
            includeTopics: true,
            includeKeywords: true,
            includeCitations: true,
          },
        }),
      });

      return handleResponse(response, "analyzeSource");
    } catch (error) {
      console.error("Source analysis error:", error);
      return handleApiError(error, "analyzeSource");
    }
  },

  async createContent(request: ProcessRequest): Promise<ProcessResponse> {
    try {
      if (!validateApiConfig()) {
        if (OFFLINE_MODE) {
          return mockResponse(request);
        }
        throw new Error("API configuration is invalid");
      }

      const response = await fetch(`/api/content`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "SmartNotebook/1.0",
        },
        body: JSON.stringify(request),
      });

      return handleApiResponse(response, "createContent");
    } catch (error) {
      return handleApiError(error, "createContent");
    }
  },

  async getContentStatus(id: string): Promise<ContentStatus> {
    try {
      if (!validateApiConfig()) {
        throw new Error("Invalid API configuration");
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.status}/${id}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      return handleApiResponse(response, "getContentStatus");
    } catch (error) {
      return handleApiError(error, "getContentStatus");
    }
  },
};
