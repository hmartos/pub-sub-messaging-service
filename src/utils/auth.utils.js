const axios = require('axios');
const createError = require('http-errors');

/**
 * Authentication types
 */
const AUTH_TYPES = {
    NO_AUTH: 'NO_AUTH',
    AUTH_TOKEN: 'AUTH_TOKEN',
    AUTH_TOKEN_FORWARDING: 'AUTH_TOKEN_FORWARDING',
};

/**
 * Check publisher or subscriber authentication
 * @param {*} token
 * @param {*} authType
 * @param {*} authToken
 * @param {*} authUrl
 * @param {*} res
 * @param {*} next
 * @returns
 */
const checkAuth = async (token, authType, authToken, authUrl, next) => {
    try {
        if (!authType) {
            return next();
        }

        if (authType === AUTH_TYPES.NO_AUTH) {
            return next();
        } else if (authType === AUTH_TYPES.AUTH_TOKEN) {
            if (authToken !== token) {
                console.warn(`Unauthorized request!. Error validating auth token.`);
                return next(createError(401));
            }
            return next();
        } else if (authType === AUTH_TYPES.AUTH_TOKEN_FORWARDING) {
            validateToken(token, authUrl)
                .then(function (response) {
                    return next();
                })
                .catch(function (error) {
                    console.warn(`Unauthorized request!. ${error}.`);
                    return next(createError(401));
                });
        } else {
            return next();
        }
    } catch (error) {
        console.error('Error checking authentication', error);
        return next(createError(401));
    }
};

/**
 * Validate token by executing a GET request to `authUrl` with a header
 * @param {*} token
 * @param {*} authUrl
 * @returns
 */
const validateToken = async (token, authUrl) => {
    // TODO Feature - Add parameters method, token header name, body, params, and other typical HTTP request parameters
    if (!token) {
        throw new Error('No token provided for auth forwarding!');
    }
    return axios.request({
        url: `${authUrl}`,
        headers: { Authorization: token },
    });
};

module.exports = { AUTH_TYPES, checkAuth };
