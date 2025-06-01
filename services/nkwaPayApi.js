const express = require('express');
const { Pay } = require('@nkwa-pay/sdk');

const app = express();
app.use(express.json());

// Initialize Nkwa Pay client
const pay = new Pay({
    apiKeyAuth: "6re58Nb-hqT6jDuo3Oapb",
    serverURL: "https://api.pay.mynkwa.com",
    debugLogger: console,
});

app.get('/', (req, res) => {
    res.send('Hello World! Express example for nkwa pay-js SDK.');
});

// Collect payment endpoint
app.post('/collect-payment', async (req, res) => {
    try {
        const { amount, phoneNumber } = req.body;
        
        if (!amount || !phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Amount and phoneNumber are required'
            });
        }
        
        const response = await pay.payments.collect({
            amount,
            phoneNumber
        });

        res.json({
            success: true,
            data: response.payment
        });
    } catch (err) {
        if (err.statusCode) {
            res.status(err.statusCode).json({
                success: false,
                error: err.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// Disburse payment endpoint
app.post('/disburse-payment', async (req, res) => {
    try {
        const { amount, phoneNumber } = req.body;
        
        if (!amount || !phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Amount and phoneNumber are required'
            });
        }
        
        const response = await pay.payments.disburse({
            amount,
            phoneNumber
        });

        res.json({
            success: true,
            data: response.payment
        });
    } catch (err) {
        if (err.statusCode) {
            res.status(err.statusCode).json({
                success: false,
                error: err.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

// Get payment status
app.get('/payment/:id', async (req, res) => {
    try {
        const response = await pay.payments.get(req.params.id);
        
        res.json({
            success: true,
            data: response.payment
        });
    } catch (err) {
        if (err.statusCode) {
            res.status(err.statusCode).json({
                success: false,
                error: err.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});