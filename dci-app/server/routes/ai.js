import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Gemini AI with new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, error: 'Prompt is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, error: 'Gemini API Key is not configured on the server' });
        }

        // Using new model and syntax as requested
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        // access text directly as a property
        const text = response.text;

        res.json({ success: true, text });
    } catch (error) {
        console.error('Gemini Backend Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to generate content' });
    }
});

export default router;
