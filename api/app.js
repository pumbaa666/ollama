const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../view'))); // Serve static files from the "view" directory

const ollamaCommand = 'ollama';
const ollamaArgs = ['run', 'llama3.2'];

const SERVER = "localhost"
const PORT = 3000;
const GET_MESSAGE_ENDPOINT =  '/api/message';
// API endpoint : http://[SERVER]:[PORT][GET_MESSAGE_ENDPOINT] ; http://localhost:3000/api/message
app.post(GET_MESSAGE_ENDPOINT, (req, res) => {
    console.log("\n---------------");
    console.log("request received on " + GET_MESSAGE_ENDPOINT)
    const { message } = req.body;
    console.log("message : " + message);

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

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
            res.json({ response: response });
        } else {
            res.status(500).json({ error: `Ollama process failed with code ${code}`, details: errorOutput.trim() });
        }
    });
});

function listAvailableModels() {
    const ollamaList = spawn('ollama', ['list']);

    let output = '';
    ollamaList.stdout.on('data', (data) => {
        output += data.toString();
    });

    ollamaList.stderr.on('data', (data) => {
        console.error(`stderr: ${data.toString()}`);
    });

    ollamaList.on('close', (code) => {
        if (code !== 0) {
            console.error(`ollama list process exited with code ${code}`);
            // return res.status(500).json({ error: 'Failed to retrieve model list.' });
        }

        // Parse the output into a JSON-friendly format
        const models = output
            .split('\n')
            .slice(1) // Skip the header
            .filter(line => line.trim()) // Remove empty lines
            .map(line => {
                const [tag, id, size, unit] = line.split(/\s+/);
                const [name, version] = tag.split(/:/);
                const fullSize = size+""+unit;
                
                return { name, version, tag, id, size, unit, fullSize };
            });

        // res.json(models);
        console.log(models)
    });
}

function cleanExit(exitCode) {
    console.log(`Ollama exited with code ${exitCode}`);
    // TODO futurs cleanup
}

// Start the server
app.listen(PORT, () => {
    listAvailableModels();
    console.log("Server is running on http://"+SERVER+":"+PORT);
});
