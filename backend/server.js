// IPD Backend - server.js (Polling Mode & Demo Logic)
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE ---
// Stores user credentials and current authentication status
// Format: { 'username': { password: 'pw', status: 'PENDING'/'APPROVED'/'DENIED' } }
const users = {
    // Default admin user for testing
    'KAKAROT-01': { password: 'pass123', status: 'IDLE' }
};

// --- ENDPOINT 1: REGISTRATION ---
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    console.log(`\n[REGISTRATION] New User Attempt: ${username}`);

    if (users[username]) {
        return res.status(400).json({ error: "User already exists!" });
    }

    // Save user to memory with IDLE status
    users[username] = { password: password, status: 'IDLE' };
    console.log(`[SUCCESS] User '${username}' created.`);
    res.json({ status: 'success', message: 'Account created! Device linked.' });
});

// --- ENDPOINT 2: LOGIN INITIATION ---
app.post('/api/login/initiate', (req, res) => {
    const { username, password } = req.body;
    console.log(`\n[LOGIN] Attempt for: ${username}`);
    
    // Check if user exists
    if (!users[username]) {
        // DEMO MODE: If user doesn't exist, create them on the fly to prevent demo failure
        console.log(`[DEMO] Auto-creating user: ${username}`);
        users[username] = { password: password, status: 'IDLE' };
    }

    const user = users[username];

    // Check password
    if (user.password !== password) {
        console.log(`[FAIL] Incorrect password.`);
        return res.status(401).json({ error: 'Wrong password' });
    }

    // If success, set status to PENDING (Waiting for Phone)
    user.status = 'PENDING';
    console.log(`[AUTH SERVER] Password OK. Waiting for Phone Approval...`);
    res.json({ status: 'pending', message: 'Credentials Verified. Sent 2FA Push.' });
});

// --- ENDPOINT 3: APP RESPONSE (The Phone calls this) ---
app.post('/api/auth/response', (req, res) => {
    const { username, decision } = req.body;
    console.log(`\n[IOS DEVICE] Incoming Response for ${username}: ${decision}`);
    
    if (users[username]) {
        users[username].status = decision; // Update status to APPROVED or DENIED
    }
    
    if (decision === 'APPROVED') {
        console.log(`[SUCCESS] Biometrics Verified. Login Granted.`);
        res.json({ status: 'success' });
    } else {
        console.log(`[SECURITY] Login Denied by User.`);
        res.json({ status: 'denied' });
    }
});

// --- ENDPOINT 4: STATUS CHECK (The Website calls this) ---
app.get('/api/auth/status/:username', (req, res) => {
    const { username } = req.params;
    const user = users[username];
    
    if (user) {
        res.json({ status: user.status });
    } else {
        res.json({ status: 'UNKNOWN' });
    }
});

app.listen(port, () => {
    console.log(`--- BACKEND SERVER RUNNING ON PORT ${port} ---`);
});