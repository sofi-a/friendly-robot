const express = require('express');

const { consent, oauth2callback } = require('../../controllers/google');

const router = express.Router();

router.get('/consent', consent);

router.get('/oauth2callback', oauth2callback);

module.exports = router;
