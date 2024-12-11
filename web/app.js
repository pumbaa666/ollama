const { spawn } = require('child_process');
const express = require('express');
const app = express();
app.use(express.json());

let ollamaProcess;

// Start Ollama subprocess
function startOllama() {
    console.log("starting Ollama model")
    ollamaProcess = spawn('ollama', ['run', 'llama3.2'], { stdio: ['pipe', 'pipe', 'inherit'] });

    // Log Ollama output
    ollamaProcess.stdout.on('data', (data) => {
        console.log(`[Ollama]: ${data}`);
    });

    // Handle Ollama termination
    ollamaProcess.on('close', (code) => {
        console.log(`Ollama recieved a termination code : ${code}`);
        cleanExit();
    });
}

function cleanExit(exitCode) {
    console.log(`Ollama exited with code ${exitCode}`);
    // TODO futurs cleanup
}

function sendMessageToOllama(message) {
    if (!ollamaProcess) {
        throw new Error('Ollama is not running.');
    }

    console.log("sending message to ollama : " + message)
    ollamaProcess.stdin.write(`${message}\n`);
}

// Endpoint to send messages to Ollama
app.post('/api/message', (req, res) => {
    console.log("request received on /api/message")
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    sendMessageToOllama(message);

    // Simulate asynchronous response (you can modify this to buffer and return actual responses)
    setTimeout(() => {
        res.json({ response: `Ollama processed: "${message}"` });
    }, 1000);
});

// Start the server
app.listen(3000, () => {
    startOllama();
    console.log('Server is running on http://localhost:3000');
});
