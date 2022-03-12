const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { checkPublisherAuth } = require('../middleware/auth.js');

/* POST notification */
router.post('/', checkPublisherAuth, function (req, res, next) {
    if (!req.body.data) {
        console.warn('Empty data notification, will not be sent');
        return next(createError(400));
    }

    const { namespace } = req.query || {};
    if (namespace) {
        req.app.io.of(`/${req.query.namespace}`).emit('notification', req.body.data);
    } else {
        req.app.io.emit('notification', req.body.data);
    }

    res.end();
});

module.exports = router;
