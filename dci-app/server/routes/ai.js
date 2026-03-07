import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/generate', async (req, res) => {
    try {
        const { prompt, config } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, error: 'Prompt is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, error: 'Gemini API Key is not configured on the server' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: config || {
                temperature: 0.8,
                maxOutputTokens: 8192,
            }
        });

        const response = await result.response;
        const text = response.text();

        res.json({ success: true, text });
    } catch (error) {
        console.error('Gemini Backend Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to generate content' });
    }
});

export default router;
