const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../view'))); // Serve static files from the "view" directory

const ollamaCommand = 'ollama';

const SERVER = "localhost"
const PORT = 3000;
const GET_MESSAGE_ENDPOINT =  '/api/message';
// API endpoint : http://[SERVER]:[PORT][GET_MESSAGE_ENDPOINT] ; http://localhost:3000/api/message
app.post(GET_MESSAGE_ENDPOINT, (req, res) => {
    const { message } = req.body;
    let modelName = req.headers['x-model-name'];

    if (!modelName) {
        console.log('No model found in the header, using default');
        modelName = 'llama3.2';
        //return res.status(400).json({ error: 'Model name is required in the headers' });
    }

    const ollamaArgs = ['run', modelName];
    const ollamaProcess = spawn(ollamaCommand, ollamaArgs);

    let output = '';
    let errorOutput = '';

    // Send the message to the Ollama process
    ollamaProcess.stdin.write(`${message}\n`);
    ollamaProcess.stdin.end();
    
    // Capture standard output in a buffer
    ollamaProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Capture standard error in a buffer
    ollamaProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    // Send the bufferised response
    ollamaProcess.on('close', (code) => {
        if (code === 0) {
            const response = output.trim();
            console.log("response : " + response);
            return res.json({ response: response });
        } else {
            return res.status(500).json({ error: `Ollama process failed with code ${code}`, details: errorOutput.trim() });
        }
    });
});

const GET_MODELS_ENDPOINT = '/api/listAvailableModels';
app.get('/api/listAvailableModels', async (req, res) => {
    console.log("Requesting available models");
    try {
        const modelsList = await listAvailableModels();
        console.log("sending " + modelsList.size + " modelz");
        return res.json(modelsList);
    } catch (error) {
        console.error('Error retrieving models:', error);
        return res.status(500).json({ error: 'Failed to retrieve models' });
    }
});

/**
 * Retrieves the list of locally installed models using the "ollama list" command.
 * 
 * @returns {Promise<Array<{name: string, id: string, size: string, modified: string}>>} 
 * Resolves with an array of model details or rejects on failure.
 * 
 * Each model object contains:
 * - `name`: Model name (e.g., "raccourci:latest").
 * - `id`: Unique identifier.
 * - `size`: Model size (e.g., "2.0 GB").
 * - `modified`: Last modified time (e.g., "44 hours ago").
 */
function listAvailableModels() {
    return new Promise((resolve, reject) => {
        const child = spawn('ollama', ['list']);
        let output = '';

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (err) => {
            console.error('Error from ollama list:', err.toString());
            reject(err.toString());
        });

        child.on('close', (code) => {
            if (code === 0) {
                const models = output
                    .split('\n')
                    .filter(line => line.trim() && !line.startsWith('NAME'))
                    .map(line => {
                        const [tag, id, size, unit] = line.split(/\s+/);
                        const [name, version] = tag.split(/:/);
                        const fullSize = size+""+unit;

                        return { tag, id, size, unit, name, version, fullSize };
                    });
                resolve(models);
            } else {
                reject(new Error(`ollama list exited with code ${code}`));
            }
        });
    });
}

function cleanExit(exitCode) {
    console.log(`Ollama exited with code ${exitCode}`);
    // TODO futurs cleanup
}

// Start the server
app.listen(PORT, () => {
    console.log("Server is running on http://"+SERVER+":"+PORT);
});
