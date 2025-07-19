import { Router } from 'express';
import { z } from 'zod';
import { aiService } from '../services/ai.js';
import { getVideoTranscript } from '../utils/youtube.js';

export const summaryRouter = Router();

const requestSchema = z.object({
  videoUrl: z.string().url(),
});

const summaryResponseSchema = z.object({
  title: z.string(),
  points: z.array(
    z.object({
      heading: z.string(),
      description: z.string(),
      resources: z.array(
        z.object({
          title: z.string(),
          url: z.string().url(),
          type: z.enum(['article', 'video', 'course'])
        })
      )
    })
  )
});

summaryRouter.post('/', async (req, res) => {
  try {
    const { videoUrl } = requestSchema.parse(req.body);
    
    // Get video transcript
    const transcript = await getVideoTranscript(videoUrl);
    
    // Generate summary using AI
    const summaryText = await aiService.generateSummary(transcript);
    
    // Parse and validate the AI response
    const cleanedText = summaryText
      .replace(/^```json\s*/, '')
      .replace(/```$/, '')
      .trim();

    const parsedSummary = JSON.parse(cleanedText);
    const validatedSummary = summaryResponseSchema.parse(parsedSummary);

    res.json(validatedSummary);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      res.status(400).json({ error: 'Invalid response format from AI' });
    } else {
      console.error('Summary generation error:', error);
      res.status(500).json({ error: 'Failed to generate summary' });
    }
  }
});