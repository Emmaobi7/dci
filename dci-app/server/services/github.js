import { Octokit } from 'octokit';

export const createGithubRepo = async (token, repoName, description) => {
    const octokit = new Octokit({ auth: token });

    try {
        const response = await octokit.rest.repos.createForAuthenticatedUser({
            name: repoName,
            description: description,
            auto_init: true,
        });
        return response.data;
    } catch (error) {
        console.error(`GitHub Create Repo Error [${error.status}]: ${error.message}`);
        throw error;
    }
};

export const pushToRepo = async (token, owner, repo, content, path = 'index.html', message = 'Initial commit from AI Studio') => {
    const octokit = new Octokit({ auth: token });

    try {
        // Get the latest commit SHA for the main branch
        const { data: refData } = await octokit.rest.git.getRef({
            owner,
            repo,
            ref: 'heads/main',
        });
        const latestCommitSha = refData.object.sha;

        // Get the tree SHA for the latest commit
        const { data: commitData } = await octokit.rest.git.getCommit({
            owner,
            repo,
            commit_sha: latestCommitSha,
        });
        const baseTreeSha = commitData.tree.sha;

        // Create a new blob with the content
        const { data: blobData } = await octokit.rest.git.createBlob({
            owner,
            repo,
            content,
            encoding: 'utf-8',
        });

        // Create a new tree with the updated file
        const { data: treeData } = await octokit.rest.git.createTree({
            owner,
            repo,
            base_tree: baseTreeSha,
            tree: [
                {
                    path,
                    mode: '100644',
                    type: 'blob',
                    sha: blobData.sha,
                },
            ],
        });

        // Create a new commit
        const { data: newCommitData } = await octokit.rest.git.createCommit({
            owner,
            repo,
            message,
            tree: treeData.sha,
            parents: [latestCommitSha],
        });

        // Update the reference to point to the new commit
        await octokit.rest.git.updateRef({
            owner,
            repo,
            ref: 'heads/main',
            sha: newCommitData.sha,
        });

        return newCommitData;
    } catch (error) {
        console.error(`GitHub Push Error [${error.status}]: ${error.message}`);
        throw error;
    }
};

export const enableGithubPages = async (token, owner, repo) => {
    const octokit = new Octokit({ auth: token });

    try {
        const response = await octokit.rest.repos.createPagesSite({
            owner,
            repo,
            source: {
                branch: 'main',
                path: '/'
            }
        });
        // Give GitHub a moment to register the Pages activation
        await new Promise(resolve => setTimeout(resolve, 2000));
        return response.data;
    } catch (error) {
        // 409 = Pages already enabled, 422 = already being set up - both are OK
        if (error.status === 409 || error.status === 422) {
            return { message: 'Pages already enabled or being set up' };
        }
        console.error(`GitHub Enable Pages Error [${error.status}]: ${error.message}`);
        throw error;
    }
};
