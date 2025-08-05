require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const cors = require('cors');
 // Enable CORS for all requests


const app = express();
const PORT = 3000;
app.use(cors());
// Middleware
app.use(bodyParser.json());

app.post('/send-alert', (req, res) => {
    const { message, phones } = req.body;

    // Validate inputs
    if (!message || !phones || !Array.isArray(phones)) {
        return res.status(400).send({ error: "Message and phones are required, and 'phones' must be an array." });
    }

    if (phones.length === 0) {
        return res.status(400).send({ error: "At least one phone number is required." });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    // Send messages to all provided phone numbers
    const sendPromises = phones.map((phone) =>
        client.messages.create({
            body: message, // Full message, including location
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        })
    );

    Promise.all(sendPromises)
        .then(() => res.send({ status: 'Messages sent successfully!' }))
        .catch((err) => {
            console.error('Error sending messages:', err);
            res.status(500).send({ error: 'Failed to send messages. Please check logs for details.' });
        });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});