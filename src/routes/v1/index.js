const express = require('express');

const router = express.Router();

/**
 *
 * GET api/v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 *
 * GET api/v1/google
 */
router.use('/google', require('./google'));

module.exports = router;
