// import { pipeline, Pipeline } from '@xenova/transformers';
import { pipeline, type Text2TextGenerationPipeline, type Text2TextGenerationOutput } from '@xenova/transformers';
class AIService {
  private static instance: AIService;
  private generator: Text2TextGenerationPipeline | null = null;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async initializeGenerator() {
    if (!this.generator) {
      this.generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
    }
  }

public async generateText(prompt: string): Promise<string> {
  await this.initializeGenerator();
  if (!this.generator) throw new Error('Generator not initialized');

  const result = await this.generator(prompt, {
    max_new_tokens: 512,
    temperature: 0.7,
    repetition_penalty: 1.2
  });

  // Force result to be treated as array of objects with generated_text
  const output = result as Array<{ generated_text: string }>;

  return output[0].generated_text;
}

  public async generateSummary(videoTranscript: string): Promise<string> {
    const prompt = `Create a comprehensive educational summary of this video transcript. Format the response as a JSON object with the following structure:
{
  "title": "Video Summary",
  "points": [
    {
      "heading": "Key Point Title",
      "description": "Detailed explanation",
      "resources": []
    }
  ]
}

Transcript: ${videoTranscript}`;
    return this.generateText(prompt);
  }

  public async generateQuiz(videoTranscript: string): Promise<string> {
    const prompt = `Create a 10-question multiple-choice quiz based on this transcript. Format the response as a JSON array with the following structure:
[
  {
    "id": 1,
    "text": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

Transcript: ${videoTranscript}`;
    return this.generateText(prompt);
  }

  public async generateRoadmap(videoTranscript: string): Promise<string> {
    const prompt = `Create a learning roadmap based on this content. Format the response as a JSON array with the following structure:
[
  {
    "title": "Section Title",
    "description": "Section description",
    "videos": [
      {
        "title": "Video Title",
        "timestamp": "0:00",
        "duration": "10:00",
        "completed": false
      }
    ]
  }
]

Transcript: ${videoTranscript}`;
    return this.generateText(prompt);
  }
}

export const aiService = AIService.getInstance();