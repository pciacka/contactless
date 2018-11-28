// Load .env file
require('dotenv').config();

const serverless = require('serverless-http');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const awsSES = new AWS.SES();

const { check, validationResult } = require('express-validator/check');

app.use(express.json());
app.post('/message', [
    check('name').isLength({ min: 3 }),
    check('email').isEmail(),
    check('subject').optional().isString(),
    check('message').isLength({ min: 10 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const subject = req.body.subject ? req.body.subject : 'Wiadomość ze strony ciacka.net';
    const message = `${req.body.message}\n\n--\n${req.body.name}\n\nWiadomość wysłana ze strony ciacka.net`;

    const sesParams = {
        Destination: { ToAddresses: ['receiver@example.com'] },
        Message: {
            Body: {
                Text: { Data: message, Charset: 'UTF-8' }
            },
            Subject: { Data: subject, Charset: 'UTF-8' }
        },
        Source: 'sender@example.com',
        ReplyToAddresses: [req.body.email]
    };

    awsSES.sendEmail(sesParams).promise().then(() => {
        return res.status(204);
    }).catch((err) => {
        console.log(err, err.stack);
        return res.status(500).json({status: 'FAILURE', message: 'Internal server error occured.'});
    });
});

module.exports.handler = serverless(app);
