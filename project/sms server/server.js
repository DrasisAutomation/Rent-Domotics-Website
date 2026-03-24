const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// SMS API Configuration (Hardcoded)
const SMS_CONFIG = {
    apiKey: 'gdCD8AQiQWAPDTS2',
    senderId: 'ZIAMRE',
    templateId: '1707177390087516591',
    apiUrl: 'https://sms.textspeed.in/vb/apikey.php'
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'SMS Proxy Server'
    });
});

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        console.log('Received request:', { phoneNumber, otp });

        // Validate input
        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and OTP are required'
            });
        }

        // Validate phone number format (10 digits)
        if (!/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format. Please enter 10 digits.'
            });
        }

        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP format'
            });
        }

        // Prepare message
        const message = `Your OTP for login is ${otp}. It is valid for 5 minutes. Do not share this code with anyone. Contact support if the OTP was not requested by you - Ziamore.`;

        console.log(`Sending OTP to ${phoneNumber}: ${otp}`);
        console.log('Full API URL:', `${SMS_CONFIG.apiUrl}?apikey=${SMS_CONFIG.apiKey}&senderid=${SMS_CONFIG.senderId}&templateid=${SMS_CONFIG.templateId}&number=${phoneNumber}&message=${encodeURIComponent(message)}`);

        // Send SMS via API
        const response = await axios.get(SMS_CONFIG.apiUrl, {
            params: {
                apikey: SMS_CONFIG.apiKey,
                senderid: SMS_CONFIG.senderId,
                templateid: SMS_CONFIG.templateId,
                number: phoneNumber,
                message: message
            },
            timeout: 15000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('SMS API Response Status:', response.status);
        console.log('SMS API Response Data:', response.data);

        // Check if SMS was sent successfully
        if (response.data && response.data.status === 'Success') {
            res.json({
                success: true,
                message: 'OTP sent successfully',
                data: {
                    messageId: response.data.data?.messageid,
                    phoneNumber: phoneNumber,
                    timestamp: new Date().toISOString()
                }
            });
        } else if (response.data && response.data.status === 'Success') {
            // Alternative success response format
            res.json({
                success: true,
                message: 'OTP sent successfully',
                data: response.data
            });
        } else {
            const errorMsg = response.data?.description || response.data?.message || 'Failed to send SMS';
            throw new Error(errorMsg);
        }

    } catch (error) {
        console.error('Error sending SMS:', error.message);
        
        if (error.response) {
            console.error('API Error Status:', error.response.status);
            console.error('API Error Data:', error.response.data);
        }
        
        // Handle specific error types
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                success: false,
                error: 'Request timeout. Please try again.'
            });
        }
        
        if (error.response) {
            return res.status(502).json({
                success: false,
                error: 'SMS service error. Please try again later.'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send OTP. Please try again.'
        });
    }
});

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        endpoints: {
            health: 'GET /health',
            test: 'GET /api/test',
            sendOtp: 'POST /api/send-otp'
        }
    });
});

// Simple test endpoint to send OTP directly (for testing)
app.get('/api/test-send', async (req, res) => {
    try {
        const phoneNumber = req.query.number || '9944703738';
        const otp = req.query.otp || '123456';
        
        const message = `Your OTP for login is ${otp}. It is valid for 5 minutes. Do not share this code with anyone. Contact support if the OTP was not requested by you - Ziamore.`;
        
        const response = await axios.get(SMS_CONFIG.apiUrl, {
            params: {
                apikey: SMS_CONFIG.apiKey,
                senderid: SMS_CONFIG.senderId,
                templateid: SMS_CONFIG.templateId,
                number: phoneNumber,
                message: message
            },
            timeout: 15000
        });
        
        res.json({
            success: true,
            apiResponse: response.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handling middleware for unhandled errors
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error. Please try again later.'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log('SMS Proxy Server Started');
    console.log('=================================');
    console.log(`Server running on port: ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
    console.log(`SMS API URL: ${SMS_CONFIG.apiUrl}`);
    console.log(`Sender ID: ${SMS_CONFIG.senderId}`);
    console.log('=================================');
    console.log('Available endpoints:');
    console.log(`- GET  http://localhost:${PORT}/health`);
    console.log(`- GET  http://localhost:${PORT}/api/test`);
    console.log(`- GET  http://localhost:${PORT}/api/test-send?number=XXXXXXXXXX&otp=123456`);
    console.log(`- POST http://localhost:${PORT}/api/send-otp`);
    console.log('=================================');
    console.log('To test with curl:');
    console.log(`curl -X POST http://localhost:${PORT}/api/send-otp \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"phoneNumber":"9944703738","otp":"123456"}'`);
    console.log('=================================');
});