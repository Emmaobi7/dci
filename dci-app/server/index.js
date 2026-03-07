import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import githubRoutes from './routes/github.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/github', githubRoutes);
app.use('/api/ai', aiRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'AI Studio Backend' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
