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
    console.log("request received on " + GET_MESSAGE_ENDPOINT)
    const { message } = req.body;

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
            res.json({ response: output.trim() });
        } else {
            res.status(500).json({ error: `Ollama process failed with code ${code}`, details: errorOutput.trim() });
        }
    });
});

function cleanExit(exitCode) {
    console.log(`Ollama exited with code ${exitCode}`);
    // TODO futurs cleanup
}

// Start the server
app.listen(PORT, () => {
    console.log("Server is running on http://"+SERVER+":"+PORT);
});
