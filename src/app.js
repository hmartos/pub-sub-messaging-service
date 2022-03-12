const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const statusRouter = require('./routes/status');
const messageRouter = require('./routes/message');

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(
    express.json({
        limit: '10mb',
        type: 'application/json',
    })
);
app.use(cookieParser());
// TODO Add configuration variable
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Router configuration
app.use('/status', statusRouter);
app.use('/message', messageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.warn('Not found!');
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    console.error('Server error:', err);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // response with error status
    res.status(err.status || 500).send();
});

module.exports = app;
