import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { summaryRouter } from './routes/summary.js';
import { quizRouter } from './routes/quiz.js';
import { roadmapRouter } from './routes/roadmap.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/summary', summaryRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/roadmap', roadmapRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});