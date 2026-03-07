import express from 'express';
import { createGithubRepo, pushToRepo, enableGithubPages } from '../services/github.js';

const router = express.Router();

// Create a new repository, push code, and enable GitHub Pages
router.post('/create-and-ship', async (req, res) => {
    const { token, repoName, description, content } = req.body;

    if (!token || !repoName || !content) {
        return res.status(400).json({ error: 'Token, repoName, and content are required' });
    }

    try {
        // 1. Create the repo
        const repo = await createGithubRepo(token, repoName, description);
        const owner = repo.owner.login;

        // 2. Push the generated code
        await pushToRepo(token, owner, repo.name, content);

        // 3. Enable GitHub Pages (may take a moment to activate)
        let pagesWarning = null;
        try {
            await enableGithubPages(token, owner, repo.name);
        } catch (pagesError) {
            console.warn('GitHub Pages enable warning:', pagesError.message);
            pagesWarning = pagesError.message;
        }

        const pagesUrl = `https://${owner}.github.io/${repo.name}/`;

        res.json({
            success: true,
            repoUrl: repo.html_url,
            pagesUrl,
            owner,
            name: repo.name,
            pagesWarning // null if all good, message if Pages had an issue
        });
    } catch (error) {
        // GitHub returns 422 when the repo name already exists on the account
        const status = error.status === 422 ? 422 : 500;
        const message =
            error.status === 422
                ? `A repository named "${repoName}" already exists on your GitHub account. Please choose a different name.`
                : error.message;

        res.status(status).json({
            success: false,
            error: message,
            details: error.response?.data
        });
    }
});

export default router;
