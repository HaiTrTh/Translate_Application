// Import necessary modules
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files for the frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); // Enable CORS

// Initialize AWS Polly Client
const pollyClient = new PollyClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to fetch audio from AWS Polly
async function fetchAudio(text) {
    const params = {
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: 'Zhiyu',
    };
    const command = new SynthesizeSpeechCommand(params);
    try {
        const data = await pollyClient.send(command);
        console.log('Polly Response:', data);
        
        if (data.AudioStream) {
            // Define the path for the audio file
            const audioFilePath = path.join(__dirname, 'output.mp3');
            const writeStream = fs.createWriteStream(audioFilePath);

            // Pipe the audio stream to save as a file
            data.AudioStream.pipe(writeStream);

            // Return a Promise that resolves once the file is written
            return new Promise((resolve, reject) => {
                writeStream.on('finish', () => {
                    console.log(`Audio file saved successfully as ${audioFilePath}`);
                    resolve(audioFilePath);
                });
                writeStream.on('error', (error) => {
                    console.error('Error saving audio file:', error);
                    reject(error);
                });
            });
        } else {
            throw new Error('No audio stream received.');
        }
    } catch (err) {
        console.error('Error in Polly API request:', err);
        throw new Error('Không thể tạo giọng nói từ văn bản.');
    }
}

// Endpoint to fetch audio
app.get('/fetchAudio', async (req, res) => {
    const text = req.query.text;
    console.log("Received text:", text);

    if (!text) {
        console.log("Text not provided!");
        return res.status(400).send('Vui lòng cung cấp văn bản.');
    }

    try {
        const audioFilePath = await fetchAudio(text);
        res.set('Content-Type', 'audio/mp3');
        
        // Send the audio file to the client
        res.sendFile(audioFilePath, (err) => {
            if (err) {
                console.error("Error sending audio file:", err);
                res.status(500).send("Không thể tạo âm thanh.");
            } else {
                console.log("Audio file sent successfully!");
            }
        });
    } catch (error) {
        console.error("Error fetching audio:", error);
        res.status(500).send('Không thể tạo âm thanh.');
    }
});

// API to fetch an image using Bing Image Search
app.get('/fetchImage', async (req, res) => {
    const query = req.query.text;
    const apiKeyBing = process.env.BING_API_KEY;
    const apiEndpoint = "https://api.bing.microsoft.com/v7.0/images/search";

    try {
        const response = await axios.get(apiEndpoint, {
            headers: {
                'Ocp-Apim-Subscription-Key': apiKeyBing,
            },
            params: {
                q: query,
                count: 1,
            },
        });
        const imageUrl = response.data.value[0].contentUrl;
        res.json({ imageUrl });
    } catch (error) {
        console.error("Error fetching image:", error);
        res.status(500).send("Error fetching image");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
