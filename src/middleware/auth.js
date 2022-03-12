const createError = require('http-errors');
const { checkAuth } = require('../utils/auth.utils');

/**
 * Validates authentication for REST API requests
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.checkPublisherAuth = (req, res, next) => {
    try {
        const { API_AUTH_TYPE, API_AUTH_TOKEN, API_AUTH_URL } = process.env;
        const token = req.headers['authorization'];

        return checkAuth(token, API_AUTH_TYPE, API_AUTH_TOKEN, API_AUTH_URL, next);
    } catch (error) {
        console.error('Error checking API authentication', error);
        return next(createError(401));
    }
};

exports.checkSubscriberAuth = (socket, next) => {
    try {
        const { SOCKET_AUTH_TYPE, SOCKET_AUTH_TOKEN, SOCKET_AUTH_URL } = process.env;
        const token = socket.handshake.auth?.token;

        return checkAuth(token, SOCKET_AUTH_TYPE, SOCKET_AUTH_TOKEN, SOCKET_AUTH_URL, next);
    } catch (error) {
        console.error('Error checking socket authentication', error);
        return next(createError(401));
    }
};
