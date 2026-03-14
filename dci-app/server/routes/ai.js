import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Gemini AI with new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

router.post('/generate', async (req, res) => {
    try {
        const { prompt, file } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, error: 'Prompt is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, error: 'Gemini API Key is not configured on the server' });
        }

        // Prepare context array
        const requestContent = [{ text: prompt }];

        if (file && file.base64Data && file.mimeType) {
            requestContent.push({
                inlineData: {
                    data: file.base64Data,
                    mimeType: file.mimeType
                }
            });
            console.log(`AI Route: Received file attachment (${file.mimeType})`);
        }

        // Using new model and syntax as requested
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: requestContent,
        });

        // access text directly as a property
        const text = response.text;

        res.json({ success: true, text });
    } catch (error) {
        console.error('Gemini Backend Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to generate content' });
    }
});

// New generic chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, error: 'Messages array is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, error: 'Gemini API Key is not configured on the server' });
        }

        // Gemini REST requires specific alternating role structures. 
        // For simplicity and resilience in our transient chat widget, we'll format the history into a structured prompt.
        const conversationHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
        
        const systemInstruction = "You are a helpful, enthusiastic, and knowledgeable AI assistant built directly into the DCI Africa learning platform. You must help users with their educational queries, explain concepts clearly, and guide them on how to use the platform. Use markdown formatting to make your responses easy to read.";

        const prompt = `${systemInstruction}\n\nHere is the conversation so far:\n${conversationHistory}\n\nAssistant:`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        const text = response.text;

        res.json({ success: true, text });
    } catch (error) {
        console.error('Gemini Chat Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to process chat' });
    }
});

export default router;
