const { AUTH_TYPES } = require('./auth.utils');

const AUTH_CHECK_TYPES = {
    API: 'API',
    SOCKET: 'SOCKET',
};

/**
 * Perform configuration checks, to avoid invalid configurations and show warnings and alerts
 */
const initialConfigurationChecks = () => {
    const { API_AUTH_TYPE, API_AUTH_TOKEN, API_AUTH_URL, SOCKET_AUTH_TYPE, SOCKET_AUTH_TOKEN, SOCKET_AUTH_URL } =
        process.env;
    try {
        authenticationChecks(AUTH_CHECK_TYPES.API, API_AUTH_TYPE, API_AUTH_TOKEN, API_AUTH_URL);
        authenticationChecks(AUTH_CHECK_TYPES.SOCKET, SOCKET_AUTH_TYPE, SOCKET_AUTH_TOKEN, SOCKET_AUTH_URL);
    } catch (error) {
        //TODO URL ANCHOR README CONFIGURATION OPTIONS GITHUB REPO
        console.error(`Invalid configuration. See URL for more information about configuration options.`);
    }
};

const authenticationChecks = (authCheckType, authType, authToken, authUrl) => {
    if (!authType) {
        //TODO URL ANCHOR README AUTH CONFIGURATION OPTIONS GITHUB REPO
        console.warn(
            `${
                authCheckType === AUTH_CHECK_TYPES.API ? 'API_AUTH_TYPE' : 'SOCKET_AUTH_TYPE'
            } environment variable not set, using default NO_AUTH strategy. If this is intentional it's perfectly fine, but you may want to check this setting in production. See URL for more information about authentication options.`
        );
    } else {
        switch (authType) {
            case AUTH_TYPES.NO_AUTH:
                console.log(
                    `Using ${AUTH_TYPES.NO_AUTH} authentication strategy for ${
                        authCheckType === AUTH_CHECK_TYPES.API ? AUTH_CHECK_TYPES.API : AUTH_CHECK_TYPES.SOCKET
                    } authentication.`
                );
                break;
            case AUTH_TYPES.AUTH_TOKEN:
                console.log(
                    `Using ${AUTH_TYPES.AUTH_TOKEN} authentication strategy for ${
                        authCheckType === AUTH_CHECK_TYPES.API ? AUTH_CHECK_TYPES.API : AUTH_CHECK_TYPES.SOCKET
                    } authentication.`
                );
                if (!authToken) {
                    console.warn(`${authToken} environment variable not set, using TEST_TOKEN as authentication token`);
                    process.env.API_AUTH_TOKEN = 'TEST_TOKEN';
                }
                break;
            case AUTH_TYPES.AUTH_TOKEN_FORWARDING:
                console.log(
                    `Using ${AUTH_TYPES.AUTH_TOKEN_FORWARDING} authentication strategy for ${
                        authCheckType === AUTH_CHECK_TYPES.API ? AUTH_CHECK_TYPES.API : AUTH_CHECK_TYPES.SOCKET
                    } authentication.`
                );
                if (!authUrl) {
                    console.error(`${authUrl} environment variable not set`);
                    //TODO URL AUTH_TOKEN_FORWARDING README CONFIGURATION OPTIONS GITHUB REPO
                    throw new Error('Invalid configuration. Check URL for information about authentication options.');
                }
                break;
            default:
                //TODO URL ANCHOR README CONFIGURATION OPTIONS GITHUB REPO
                console.warn(
                    `Unknown authType '${authType}'. Using default NO_AUTH strategy. See URL for more information about authentication options.`
                );
        }
    }
};

module.exports = { initialConfigurationChecks };
