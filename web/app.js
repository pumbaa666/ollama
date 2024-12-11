const express = require('express');
const { spawn } = require('child_process');

//let ollamaProcess;

const app = express();
app.use(express.json());

const PORT = 3000;
const ollamaCommand = 'ollama';
const ollamaArgs = ['run', 'llama3.2'];

const GET_MESSAGE_ENDPOINT =  '/api/message';

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

    // Capture standard output
    ollamaProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Capture standard error
    ollamaProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    // Handle process completion
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
    console.log('Server is running on http://localhost:3000');
});
