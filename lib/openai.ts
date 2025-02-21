import OpenAI from 'openai';
import { OPENAI_DEFAULTS } from './constants';

const openai = new OpenAI({
  apiKey: 'sk-proj-DAbaU4I795ShnNh5wOqnT3BlbkFJWZQdobaGxJDjnwAX94aB',
  dangerouslyAllowBrowser: true // Only for demo purposes
});

const defaultParams = {
  max_tokens: OPENAI_DEFAULTS.MAX_TOKENS,
  temperature: OPENAI_DEFAULTS.TEMPERATURE,
  top_p: OPENAI_DEFAULTS.TOP_P,
  frequency_penalty: OPENAI_DEFAULTS.FREQUENCY_PENALTY,
  presence_penalty: OPENAI_DEFAULTS.PRESENCE_PENALTY
};

export const openaiService = {
  async analyzeSentiment(text: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      ...defaultParams,
      messages: [{
        role: "system",
        content: "You are a sentiment analysis expert. Analyze the sentiment of the following text. Return a JSON object with: sentiment (positive/negative/neutral), confidence (0-1), emotions (array of detected emotions), and intensity (1-5 scale)."
      }, {
        role: "user",
        content: text
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  },

  async extractKeywords(text: string, options: { maxKeywords: number }) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      ...defaultParams,
      messages: [{
        role: "system",
        content: `You are a keyword extraction expert. Extract the ${options.maxKeywords} most important keywords from the text. For each keyword, provide its relevance score (0-1) and category (e.g., technical term, concept, name, etc.). Return as a JSON object with keywords array containing objects with: term, relevance, and category.`
      }, {
        role: "user",
        content: text
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '[]');
  },

  async extractEntities(text: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      ...defaultParams,
      messages: [{
        role: "system",
        content: "You are a named entity recognition expert. Extract and classify named entities from the text. For each entity, provide its type, confidence score, and any relevant context. Entity types include: PERSON, ORG, LOC, DATE, TIME, MONEY, PERCENT, PRODUCT, EVENT, WORK_OF_ART, LAW, LANGUAGE. Return as a JSON object with entities array containing objects with: text, type, confidence, and context."
      }, {
        role: "user",
        content: text
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  },

  async analyzeReadability(text: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      ...defaultParams,
      messages: [{
        role: "system",
        content: "You are a readability analysis expert. Perform a comprehensive readability analysis of the text. Include multiple metrics: Flesch-Kincaid Grade Level, Flesch Reading Ease, Gunning Fog Index, SMOG Index, and Dale-Chall Score. Also provide statistics on: average sentence length, complex word percentage, passive voice usage, and vocabulary diversity. For each metric, include a brief explanation of its meaning. Return as a JSON object with metrics and statistics objects, plus an overall readability assessment."
      }, {
        role: "user",
        content: text
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  },

  async extractArgumentation(text: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      ...defaultParams,
      messages: [{
        role: "system",
        content: "You are an argumentation analysis expert. Analyze the argumentative structure of the text. Identify main claims, supporting arguments, evidence types (e.g., statistical, anecdotal, expert testimony), logical relationships, and potential fallacies. For each argument, assess its strength and relevance. Return as a JSON object with: mainClaims (array of claim objects), supportingArguments (array of argument objects with evidence and strength assessment), counterArguments (if any), and logicalStructure (showing relationships between arguments)."
      }, {
        role: "user",
        content: text
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  },

  async generateStudyGuide(text: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Create a comprehensive study guide from the text. Include key concepts, definitions, examples, and practice questions. Return as a JSON object with sections for: concepts, definitions, examples, and questions."
      }, {
        role: "user",
        content: text
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  },

  async generateFlashcards(text: string, options: { count: number; complexity: string }) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `Create ${options.count} flashcards at ${options.complexity} complexity level from the text. Return as a JSON array of objects with 'front' and 'back' properties.`
      }, {
        role: "user",
        content: text
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '[]');
  },

  async generateQuestions(text: string, options: { count: number; type: string }) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `Generate ${options.count} ${options.type} questions from the text. Return as a JSON array of objects with 'question', 'options' (for multiple choice), and 'answer' properties.`
      }, {
        role: "user",
        content: text
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '[]');
  },

  async compareDocuments(texts: string[]) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Compare the provided texts and analyze their similarities and differences. Return a JSON object with: commonThemes, uniquePoints, and recommendations."
      }, {
        role: "user",
        content: JSON.stringify(texts)
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  },

  async generateTimeline(text: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Create a chronological timeline of events from the text. Return as a JSON array of objects with 'date', 'event', and 'description' properties."
      }, {
        role: "user",
        content: text
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '[]');
  },

  async generateDeepDive(text: string, options: {
    host1: string;
    host2: string;
    format: string;
  }) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      ...defaultParams,
      temperature: 0.8, // Slightly more creative for conversations
      max_tokens: 3000, // Longer output for deep dives
      messages: [{
        role: "system",
        content: `You are an expert at creating engaging educational conversations. Create a deep dive discussion between two experts (${options.host1} and ${options.host2}) about the following content. 

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

Keep the tone professional but conversational.`
      }, {
        role: "user",
        content: text
      }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Format the conversation for display
    const formattedContent = result.messages
      .map(msg => `${msg.speaker}: ${msg.content}`)
      .join('\n\n');
    
    return {
      content: formattedContent,
      title: result.title,
      type: 'deep_dive'
    };
  },

  async generateCitations(text: string, style: string = 'apa') {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `Extract and format citations from the text in ${style} style. Return as a JSON array of citation strings.`
      }, {
        role: "user",
        content: text
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '[]');
  }
};