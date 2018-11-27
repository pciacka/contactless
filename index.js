const serverless = require('serverless-http');
const express = require('express');
const app = express();
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

    return res.send('OK');
});

module.exports.handler = serverless(app);
