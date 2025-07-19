import { Router } from 'express';
import { z } from 'zod';
import { aiService } from '../services/ai.js';
import { getVideoTranscript } from '../utils/youtube.js';

export const quizRouter = Router();

const requestSchema = z.object({
  videoUrl: z.string().url(),
});

const quizResponseSchema = z.array(
  z.object({
    id: z.number(),
    text: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.number().min(0).max(3)
  })
).length(10);

quizRouter.post('/', async (req, res) => {
  try {
    const { videoUrl } = requestSchema.parse(req.body);
    
    // Get video transcript
    const transcript = await getVideoTranscript(videoUrl);
    
    // Generate quiz using AI
    const quizText = await aiService.generateQuiz(transcript);
    
    // Parse and validate the AI response
    const cleanedText = quizText
      .replace(/^```json\s*/, '')
      .replace(/```$/, '')
      .trim();

    const parsedQuiz = JSON.parse(cleanedText);
    const validatedQuiz = quizResponseSchema.parse(parsedQuiz);

    res.json(validatedQuiz);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      res.status(400).json({ error: 'Invalid response format from AI' });
    } else {
      console.error('Quiz generation error:', error);
      res.status(500).json({ error: 'Failed to generate quiz' });
    }
  }
});