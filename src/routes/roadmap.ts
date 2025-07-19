import { Router } from 'express';
import { z } from 'zod';
import { aiService } from '../services/ai.js';
import { getVideoTranscript } from '../utils/youtube.js';

export const roadmapRouter = Router();

const requestSchema = z.object({
  videoUrl: z.string().url(),
});

const roadmapResponseSchema = z.array(
  z.object({
    title: z.string(),
    description: z.string(),
    videos: z.array(
      z.object({
        title: z.string(),
        timestamp: z.string(),
        duration: z.string(),
        completed: z.boolean()
      })
    )
  })
);

roadmapRouter.post('/', async (req, res) => {
  try {
    const { videoUrl } = requestSchema.parse(req.body);
    
    // Get video transcript
    const transcript = await getVideoTranscript(videoUrl);
    
    // Generate roadmap using AI
    const roadmapText = await aiService.generateRoadmap(transcript);
    
    // Parse and validate the AI response
    const cleanedText = roadmapText
      .replace(/^```json\s*/, '')
      .replace(/```$/, '')
      .trim();

    const parsedRoadmap = JSON.parse(cleanedText);
    const validatedRoadmap = roadmapResponseSchema.parse(parsedRoadmap);

    res.json(validatedRoadmap);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      res.status(400).json({ error: 'Invalid response format from AI' });
    } else {
      console.error('Roadmap generation error:', error);
      res.status(500).json({ error: 'Failed to generate roadmap' });
    }
  }
});