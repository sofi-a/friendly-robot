const express = require('express');

const { consent } = require('../../controllers/google');

const router = express.Router();

router.get('/consent', consent);

module.exports = router;
