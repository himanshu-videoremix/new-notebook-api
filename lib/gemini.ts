import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');

interface DebugLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  context: string;
  message: string;
  data?: any;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
}

// Browser-compatible debug logging
const logDebug = (entry: DebugLogEntry): void => {
  const logData = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console[entry.level.toLowerCase()](logData);
  }
};

// Data validation functions
const validateContent = (content: string) => {
  if (!content) {
    throw new Error('Content is required');
  }

  if (content.length < 20) {
    throw new Error('Content must be at least 20 characters long');
  }

  if (content.length > 30000) {
    throw new Error('Content exceeds maximum length of 30,000 characters');
  }

  return true;
};

const validateFileContent = (content: string) => {
  // Check for common file corruption patterns
  if (content.includes('\0')) {
    throw new Error('Content contains null bytes - possible file corruption');
  }

  // Check encoding
  try {
    const decoded = decodeURIComponent(escape(content));
    return decoded;
  } catch {
    throw new Error('Invalid content encoding detected');
  }
};

export const geminiService = {
  async generateSuggestions() {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate 3 relevant questions that a user might want to ask about document analysis and content understanding. Return ONLY a JSON object with a 'suggestions' array containing strings. Do not include any markdown formatting or code blocks.`;

    const result = await model.generateContent(prompt);
    if (!result.response) {
      throw new Error('Failed to get response from Gemini API');
    }
    
    const response = await result.response;
    let text = response.text();
    
    let cleanedText = text;
    try {
      // Enhanced response cleaning
      cleanedText = text.replace(/```json\s*|\s*```/g, ''); // Remove code blocks
      cleanedText = cleanedText.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces
      cleanedText = cleanedText.trim();

      // If response starts with a newline or whitespace, trim it
      if (cleanedText.startsWith('\n')) {
        cleanedText = cleanedText.substring(cleanedText.indexOf('{')); 
      }

      // If response has trailing content after JSON, remove it
      const lastBrace = cleanedText.lastIndexOf('}');
      if (lastBrace !== -1) {
        cleanedText = cleanedText.substring(0, lastBrace + 1);
      }

      // Validate JSON structure before parsing
      if (!cleanedText.startsWith('{') || !cleanedText.endsWith('}')) {
        throw new Error('Invalid JSON structure in response');
      }

      const parsed = JSON.parse(cleanedText);
      
      // Validate response format
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        throw new Error('Invalid response format from Gemini API');
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse Gemini response:', {
        error,
        rawText: text,
        responseType: typeof text
      });

      // Fallback to default suggestions
      return {
        suggestions: [
          "What are the main topics in this document?",
          "Can you summarize the key points?",
          "What are the most important findings?"
        ]
      };
    }
  },

  async analyzeContent(content: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const cleanAndValidateJSON = (text: string) => {
      try {
        // Remove any markdown formatting
        text = text.replace(/```json\s*|\s*```/g, '');
        text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
        text = text.trim();

        // Find the first { and last }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        
        if (start === -1 || end === -1) {
          throw new Error('No valid JSON object found in response');
        }

        // Extract and parse JSON
        const jsonStr = text.substring(start, end + 1);
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error('JSON parsing error:', error);
        throw new Error('Failed to parse response');
      }
    };

    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content: Must provide a non-empty string');
    }

    // Preprocess content
    let processedContent = content;
    if (processedContent.length > 30000) {
      processedContent = processedContent.slice(0, 30000) + '...';
    }

    try {
      const result = await model.generateContent({
        contents: [{
          parts: [{
            text: `Analyze the following content and return ONLY a JSON object with this exact structure:
            {
              "summary": "2-3 paragraph summary",
              "suggestedQuestions": ["question 1", "question 2", "question 3"],
              "topics": ["topic 1", "topic 2", "topic 3"]
            }

            Do not include any other text, markdown formatting, or code blocks.
            Return ONLY the JSON object.

            Content to analyze:
            ${content}`
          }]
        }]
      });
      const response = await result.response;
      const text = response.text() || '';

      const parsed = cleanAndValidateJSON(text);

      if (!parsed.summary || !Array.isArray(parsed.suggestedQuestions) || !Array.isArray(parsed.topics)) {
        throw new Error('Invalid API response format');
      }

      // Log success
      console.log('Analysis completed successfully');

      return {
        summary: parsed.summary,
        suggestedQuestions: parsed.suggestedQuestions.slice(0, 3),
        topics: parsed.topics
      };
    } catch (error) {
      console.error('Analysis failed:', error instanceof Error ? error.message : error);

      // Fallback response
      return {
        summary: "I apologize, but I was unable to generate a proper analysis. Please try again with different content or contact support if the issue persists.",
        suggestedQuestions: [
          "What are the main topics covered in this content?",
          "Could you summarize the key points?",
          "What are the most important takeaways?"
        ],
        topics: ["Content Analysis Required"]
      };
    }
  },

  async chat(message: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const cleanAndParseJSON = (text: string) => {
      // Remove markdown formatting
      text = text.replace(/```json\s*|\s*```/g, '');
      text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
      text = text.trim();

      // Extract JSON object
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No valid JSON object found in response');
      }

      text = text.substring(jsonStart, jsonEnd + 1);
      return JSON.parse(text);
    };

    try {
      const result = await model.generateContent({
        contents: [{
          parts: [{
            text: `You are a helpful AI assistant specializing in document analysis and content understanding. Respond to the following message in a natural, conversational way. Also suggest 3 relevant follow-up questions. Return ONLY a JSON object with this exact structure, with no markdown formatting or additional text:
              - content: your response text
              - suggestions: array of follow-up questions

              User message: ${message}`
          }]
        }]
      });

      const response = await result.response;
      const text = response.text() || '';
      
      try {
        const parsed = cleanAndParseJSON(text);
        
        if (!parsed.content || !Array.isArray(parsed.suggestions)) {
          throw new Error('Invalid response format');
        }
        
        return parsed;
      } catch (error) {
        console.error('Failed to parse Gemini response:', {
          error,
          rawText: text,
          responseType: typeof text
        });

        // Fallback response
        return {
          content: "I apologize, but I'm having trouble processing that request. Could you try rephrasing it?",
          suggestions: [
            "Could you clarify what you'd like to know?",
            "What specific aspect interests you most?",
            "Would you like me to focus on a particular topic?"
          ]
        };
      }
    } catch (error) {
      console.error('Chat failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  },

  async analyzeSentiment(text: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze the sentiment of the following text. Return a JSON object with:
      - sentiment (positive/negative/neutral)
      - confidence (0-1)
      - emotions (array of detected emotions)
      - intensity (1-5 scale)

      Text to analyze: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text() || '';
    return JSON.parse(responseText);
  },

  async extractKeywords(text: string, options: { maxKeywords: number }) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Extract the ${options.maxKeywords} most important keywords from the text. For each keyword, provide its relevance score (0-1) and category. Return as a JSON object with keywords array containing objects with: term, relevance, and category.
    Also include:
    - frequency: how often the term appears
    - context: example usage from text
    - related_terms: array of related keywords

    Text to analyze: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text() || '';
    return JSON.parse(responseText);
  },

  async extractEntities(text: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Extract and classify named entities from the text. For each entity, provide:
    - type (PERSON, ORG, LOC, DATE, TIME, MONEY, PERCENT, PRODUCT, EVENT, WORK_OF_ART, LAW, LANGUAGE)
    - confidence score
    - context
    - relationships with other entities
    - additional metadata (e.g., full name, role, location details)

    Return as a JSON object with entities array containing detailed entity objects.

    Text to analyze: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text() || '';
    return JSON.parse(responseText);
  },

  async analyzeReadability(text: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Perform a comprehensive readability analysis including:
    1. Standard Metrics:
      - Flesch-Kincaid Grade Level
      - Flesch Reading Ease
      - Gunning Fog Index
      - SMOG Index
      - Dale-Chall Score
    2. Advanced Statistics:
      - Sentence complexity distribution
      - Vocabulary sophistication analysis
      - Passive voice percentage
      - Transition words usage
      - Paragraph cohesion score
    3. Recommendations for improvement

    Return as a detailed JSON object with metrics, statistics, and recommendations.

    Text to analyze: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text() || '';
    return JSON.parse(responseText);
  },

  async extractArgumentation(text: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze the argumentative structure including:
    1. Main Arguments:
      - Central claims
      - Supporting evidence
      - Logical structure
    2. Evidence Analysis:
      - Types (statistical, anecdotal, expert)
      - Strength assessment
      - Source credibility
    3. Logical Flow:
      - Argument progression
      - Transition quality
      - Fallacy detection
    4. Counter-arguments:
      - Potential objections
      - Rebuttals
    5. Recommendations:
      - Strengthening arguments
      - Adding evidence
      - Improving structure

    Return as a detailed JSON object with full analysis.

    Text to analyze: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text() || '';
    return JSON.parse(responseText);
  },

  async generateStudyGuide(text: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Create a comprehensive study guide including:
    1. Key Concepts:
      - Core ideas
      - Definitions
      - Relationships
    2. Learning Objectives:
      - Knowledge goals
      - Skill outcomes
    3. Detailed Content:
      - Section summaries
      - Important quotes
      - Examples
    4. Practice Materials:
      - Questions
      - Exercises
      - Case studies
    5. Review Tools:
      - Summary charts
      - Mind maps
      - Quick reference guides

    Return as a structured JSON object with all components.

    Text to use: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text() || '';
    return JSON.parse(responseText);
  },

  async generateQuestions(text: string, options: { count: number; type: string }) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate ${options.count} ${options.type} questions from the text. Return as a JSON array of objects with 'question', 'options' (for multiple choice), and 'answer' properties.

    Text to use: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text() || '';
    return JSON.parse(responseText);
  },

  async compareDocuments(texts: string[]) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Compare the provided texts and analyze their similarities and differences. Return a JSON object with: commonThemes, uniquePoints, and recommendations.

    Texts to compare: ${JSON.stringify(texts)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text() || '';
    return JSON.parse(responseText);
  },

  async generateTimeline(text: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Create a chronological timeline of events from the text. Return as a JSON array of objects with 'date', 'event', and 'description' properties.

    Text to analyze: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text() || '';
    return JSON.parse(responseText);
  },

  async generateDeepDive(text: string, options: {
    host1: string;
    host2: string;
    format: string;
  }) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Create a deep dive discussion between two experts (${options.host1} and ${options.host2}) about the following content.

    The conversation should:
    - Start with a brief introduction of the topic
    - Cover key concepts and insights in detail
    - Include relevant examples and explanations
    - Maintain a natural, engaging flow
    - End with key takeaways and conclusions

    Format the output as a JSON object with:
    - title: string (conversation title)
    - messages: array of objects with:
      - speaker: string (${options.host1} or ${options.host2})
      - content: string (the message text)

    Keep the tone professional but conversational.

    Content to discuss: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text() || '';
    const parsedResponse = JSON.parse(responseText);

    // Format the conversation for display
    const formattedContent = parsedResponse.messages
      .map((msg: any) => `${msg.speaker}: ${msg.content}`)
      .join('\n\n');
    
    return {
      content: formattedContent,
      title: parsedResponse.title,
      type: 'deep_dive'
    };
  },

  async generateCitations(text: string, style: string = 'apa') {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Extract and format citations from the text in ${style} style. Return as a JSON array of citation strings.

    Text to analyze: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text() || '';
    return JSON.parse(responseText);
  }
};