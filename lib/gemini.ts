// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI("AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc");
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';

export const geminiService = {
  async analyzeSentiment(text: string) {
    console.log("Call geminiService analyzeSentiment");

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
    console.log("genAI:", genAI);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze the sentiment of the following text. Return a JSON object with:
      - sentiment (positive/negative/neutral)
      - confidence (0-1)
      - emotions (array of detected emotions)
      - intensity (1-5 scale)
      
      Text to analyze: ${text}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = await response.text();

      console.log("Raw API Response:", textResponse);

      // Remove Markdown formatting if present
      let jsonString = textResponse
        .trim()
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "");

      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      throw new Error("Failed to process sentiment analysis");
    }
  },

  async extractKeywords(text: string, options: { maxKeywords: number }) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Extract the ${options.maxKeywords} most important keywords from the text. For each keyword, provide its relevance score (0-1) and category. Return as a JSON object with a 'keywords' array containing objects with: 'term', 'relevance', and 'category'.
        Also include:
        - 'frequency': how often the term appears
        - 'context': example usage from text
        - 'related_terms': array of related keywords

        Text to analyze: ${text}`;

      console.log("Generated Prompt:", prompt);

      const result = await model.generateContent(prompt);
      console.log("Raw API Response:", result);

      if (!result || !result.response) {
        throw new Error("No response received from the model");
      }

      const response = await result.response;
      const rawText = response.text().trim();
      console.log("Response Text:", rawText);

      const cleanJson = rawText.replace(/^```json\n|\n```$/g, "");
      const parsedData = JSON.parse(cleanJson);
      console.log("Parsed JSON Data:", parsedData);

      return parsedData;
    } catch (error) {
      console.error("Error extracting keywords:", error);
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  async extractEntities(text: string) {
    try {
      console.log("Extracting entities for text:", text);

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Extract and classify named entities from the text. For each entity, provide:
      - type (PERSON, ORG, LOC, DATE, TIME, MONEY, PERCENT, PRODUCT, EVENT, WORK_OF_ART, LAW, LANGUAGE)
      - confidence score
      - context
      - relationships with other entities
      - additional metadata (e.g., full name, role, location details)
  
      Return as a JSON object with an 'entities' array containing detailed entity objects.
  
      Text to analyze: ${text}`;

      console.log("Sending prompt to model...");

      const result = await model.generateContent(prompt);
      console.log("Received response:", result);

      const response = await result.response;
      let responseText = response.text();

      console.log("Raw extracted text response:", responseText);

      responseText = responseText.trim();
      responseText = responseText
        .replace(/^```(?:json)?\n/, "")
        .replace(/\n```$/, "");

      console.log("Cleaned JSON response:", responseText);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Raw text that caused the issue:", responseText);
        return { error: "Invalid JSON format", details: parseError };
      }

      console.log("Parsed JSON response:", parsedResponse);

      return parsedResponse;
    } catch (error) {
      console.error("Error extracting entities:", error);
      return { error: "Failed to extract entities", details: error };
    }
  },

  async analyzeReadability(text: string) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

   NOTE: Please provide your response in the format of a key-value pair like object. Do not use nested objects, arrays, or other complex structures. Each answer should consist of a key followed by its corresponding value as a string not in object or array format.
  
    Return only as a detailed JSON object.
  
    Text to analyze: ${text}`;

    try {
      const result = await model.generateContent(prompt);
      console.log("API Result:", result);

      if (!result || !result.response) {
        throw new Error("Invalid response from the model");
      }

      const response = await result.response;
      console.log("API Response analyzeReadability:", response);

      if (!response.text) {
        throw new Error("No text returned in the response");
      }

      const responseText = response.text().trim();
      const cleanedResponse = responseText.replace(/```json|```/g, "");
      console.log("Cleaned Response:", cleanedResponse);

      const parsedResponse = JSON.parse(cleanedResponse);
      console.log("Parsed Response:", parsedResponse);

      return parsedResponse;
    } catch (error) {
      console.error("Error in analyzeReadability:", error);
      if (error instanceof SyntaxError) {
        console.error("JSON Parsing error:", error.message);
      } else {
        console.error("Unexpected error:", error.message);
      }
      return {
        error: true,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },

  async extractArgumentation(text: string) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    try {
      const result = await model.generateContent(prompt);
      console.log("Received response:", result);

      const response = await result.response;
      let responseText = response.text();

      console.log("Raw extracted text response:", responseText);

      responseText = responseText.trim();
      if (responseText.startsWith("```json")) {
        responseText = responseText
          .replace(/^```json/, "")
          .replace(/```$/, "")
          .trim();
      } else if (responseText.startsWith("```")) {
        responseText = responseText
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim();
      }

      const jsonFixed = responseText.startsWith("JSON")
        ? responseText.substring(4).trim()
        : responseText;

      console.log("Cleaned JSON response:", jsonFixed);

      const parsedResponse = JSON.parse(jsonFixed);
      console.log("Parsed JSON response:", parsedResponse);

      return parsedResponse;
    } catch (error) {
      console.error("Error in extractArgumentation:", error);
      if (error instanceof SyntaxError) {
        console.error("JSON Parsing error:", error.message);
      } else {
        console.error("Unexpected error:", error.message);
      }
      return {
        error: true,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },

  async generateStudyGuide(text: string) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    return JSON.parse(response.text());
  },

  async generateFlashcards(
    text: string,
    options: { count: number; complexity: string }
  ) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create ${options.count} flashcards at ${options.complexity} complexity level from the text. Return as a JSON array of objects with 'front' and 'back' properties.

    Text to use: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  },

 async generateQuestions(
    text: string,
    options: { count: number; type: string }
  ) {
    try {
      console.log("Calling generateQuestions with text length:", text.length);
      const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc';
      if (!apiKey) {
        throw new Error("GOOGLE_API_KEY is not set");
      }
      console.log("API Key:", apiKey);

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using flash for higher quota
      const prompt = `Generate ${options.count} ${options.type} questions from the text. Return as a JSON array of objects with 'question', 'options' (for multiple choice), and 'answer' properties.

      Text to use: ${text.slice(0, 30000)}`; // Limit text to avoid token issues

      console.log("Prompt sent to Gemini:", prompt);

      const result = await model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error("Invalid response from Gemini model");
      }

      const response = await result.response;
      let responseText = await response.text();
      console.log("Raw response from Gemini:", responseText);

      // Clean Markdown formatting
      responseText = responseText
        .trim()
        .replace(/^```json\n/, '') // Remove starting ```json
        .replace(/^```/, '') // Remove starting ```
        .replace(/\n```$/, '') // Remove ending ```
        .trim();

      console.log("Cleaned response:", responseText);

      // Validate JSON
      if (!responseText.startsWith('[') && !responseText.startsWith('{')) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      const parsedResponse = JSON.parse(responseText);
      console.log("Parsed JSON response:", parsedResponse);

      // Validate expected structure
      if (!Array.isArray(parsedResponse)) {
        throw new Error("Expected an array of questions, received: " + JSON.stringify(parsedResponse));
      }

      return parsedResponse;
    } catch (error) {
      console.error("Error in generateQuestions:", error);
      return {
        error: true,
        message: error instanceof Error ? error.message : "Failed to generate questions",
      };
    }
  },

  async compareDocuments(texts: string[]) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Compare the provided texts and analyze their similarities and differences. Return a JSON object with: commonThemes, uniquePoints, and recommendations.

    Texts to compare: ${JSON.stringify(texts)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  },

  async generateTimeline(text: string) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create a chronological timeline of events from the text. Return as a JSON array of objects with 'date', 'event', and 'description' properties.

    Text to analyze: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  },

  async generateDeepDive(
    text: string,
    options: {
      host1: string;
      host2: string;
      format: string;
    }
  ) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    const parsedResponse = JSON.parse(response.text());

    const formattedContent = parsedResponse.messages
      .map((msg: any) => `${msg.speaker}: ${msg.content}`)
      .join("\n\n");

    return {
      content: formattedContent,
      title: parsedResponse.title,
      type: "deep_dive",
    };
  },

  async generateCitations(text: string, style: string = "apa") {
    try {
      console.log("Generating citations with style:", style);

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Extract and format citations from the text in ${style} style. Return as a JSON array of citation strings.\n\nText to analyze: ${text}`;

      console.log("Prompt sent to Gemini:", prompt);

      const result = await model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error("Invalid response from Gemini model");
      }

      const response = await result.response;
      const responseText = response.text();

      console.log("Raw response from Gemini:", responseText);

      return JSON.parse(responseText);
    } catch (error) {
      console.error("Error in generateCitations:", error);
      return { error: "Failed to generate citations. Please try again later." };
    }
  },

  async generateSemanticAnalysis(text: string) {
    try {
      console.log("Calling Semantic Analysis");

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze the semantic structure of the given text. Identify key meanings, relationships between words, and contextual interpretations. Summarize how different terms and phrases interact to form meaning.\n\nText to analyze: ${text}`;

      console.log("Prompt sent to Gemini:", prompt);

      const result = await model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error("Invalid response from Gemini model");
      }

      const response = await result.response;
      const responseText = await response.text();

      console.log("Raw response from Gemini:", responseText);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        const cleanedResponse = responseText
          .replace(/^\*\*/g, "")
          .replace(/\*\*/g, "")
          .replace(/^\*/g, "")
          .replace(/\*/g, "")
          .trim();

        console.log("Cleaned semantic response:", cleanedResponse);

        return { text: cleanedResponse };
      }
    } catch (error) {
      console.error("Error in generateSemanticAnalysis:", error);
      return { error: "Failed to analyze semantics. Please try again later." };
    }
  },

  async generateConceptsExtraction(text: string) {
    try {
      console.log("Calling Concepts Extraction");

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Extract and summarize the core concepts from the given text. Identify the fundamental ideas and provide a brief explanation of their relevance.\n\nText to analyze: ${text}`;

      console.log("Prompt sent to Gemini:", prompt);

      const result = await model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error("Invalid response from Gemini model");
      }

      const response = await result.response;
      const responseText = await response.text();

      console.log("Raw response from Gemini:", responseText);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        const cleanedResponse = responseText
          .replace(/^\*\*/g, "")
          .replace(/\*\*/g, "")
          .replace(/^\*/g, "")
          .replace(/\*/g, "")
          .trim();

        console.log("Cleaned semantic response:", cleanedResponse);

        return { text: cleanedResponse };
      }
    } catch (error) {
      console.error("Error in generateConceptsExtraction:", error);
      return { error: "Failed to extract concepts. Please try again later." };
    }
  },

  async generateTextComparison(text: string) {
    try {
      console.log("Calling Text Comparison");

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Compare two pieces of text and highlight the differences, similarities, and contextual changes. Identify changes in meaning, tone, and factual accuracy. Text to analyze: ${text}`;

      console.log("Prompt sent to Gemini:", prompt);

      const result = await model.generateContent(prompt);
      console.log("Raw result from Gemini:", result);

      if (!result || !result.response) {
        throw new Error("Invalid response from Gemini model");
      }

      const response = await result.response;
      const responseText = await response.text();

      console.log("Raw response from Gemini:", responseText);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        const cleanedResponse = responseText
          .replace(/^\*\*/g, "")
          .replace(/\*\*/g, "")
          .replace(/^\*/g, "")
          .replace(/\*/g, "")
          .trim();

        console.log("Cleaned comparison response:", cleanedResponse);

        return { text: cleanedResponse };
      }
    } catch (error) {
      console.error("Error in generateTextComparison:", error);
      return { error: "Failed to compare texts. Please try again later." };
    }
  },

  async generateSummary(userInput: string) {
    try {
      console.log("Calling Source Content Generation");

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyBZ5NQ3dF5sdMBSjfkD6Oejw9VRhPTSUdc');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Generate a relevant source description based on the following input. Provide concise yet informative content that fits within a categorized source list.
  
      User Input: ${userInput}`;
      

      console.log("Prompt sent to Gemini:", prompt);

      const result = await model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error("Invalid response from Gemini model");
      }

      const response = await result.response;
      const responseText = await response.text();

      console.log("Raw response from Gemini:", responseText);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        const cleanedResponse = responseText
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .trim();

        console.log("Cleaned source response:", cleanedResponse);

        return { text: cleanedResponse };
      }
    } catch (error) {
      console.error("Error in generateSummary:", error);
      return {
        error: "Failed to generate source content. Please try again later.",
      };
    }
  },
};