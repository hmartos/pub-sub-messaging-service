const express = require('express');
const router = express.Router();

/* GET status */
router.get('/', function (req, res, next) {
    res.json({ status: 'Running!', timestamp: new Date() });
});

module.exports = router;
