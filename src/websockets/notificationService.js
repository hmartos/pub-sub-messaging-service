const { checkSubscriberAuth } = require('../middleware/auth');

const notificationService = io => {
    console.log('Pub/Sub Messaging Service Started!');
    // TODO Look https://stackoverflow.com/questions/25081622/list-of-namespaces-in-socket-io
    let namespaces = ['/']; // Initialized with the default namespace
    let usersInNamespace = { '/': 0 }; // Initialized with the default namespace

    // Authentication middleware in default namespace
    io.use(checkSubscriberAuth);

    // Monitor connections to default namespace
    io.on('connection', function (socket) {
        monitorConnectedUsers(socket, namespaces, usersInNamespace);
    });

    // Custom namespaces - https://socket.io/docs/v4/namespaces/#dynamic-namespaces
    const namespace = io.of((name, auth, next) => {
        namespaces.push(name);
        next(null, true); // or false, when the creation is denied
    });

    // Authentication middleware in default namespace
    namespace.use(checkSubscriberAuth);

    // Monitor connections to custom namespaces
    namespace.on('connection', function (socket) {
        monitorConnectedUsers(socket, namespaces, usersInNamespace);
    });
};

/**
 * Monitor connections and disconnections of clients in different namespaces
 * @param {*} socket
 * @param {*} namespaces
 * @param {*} usersInNamespace
 */
const monitorConnectedUsers = (socket, namespaces, usersInNamespace) => {
    const name = socket.nsp.name;
    if (!usersInNamespace[name]) {
        usersInNamespace[name] = 0;
    }
    usersInNamespace[name]++;
    console.log(
        `User connected to ${name} namespace. Users connected on ${name} namespace: ${
            usersInNamespace[name]
        }. Total users connected: ${getTotalUsersConnected(namespaces, usersInNamespace)}`
    );

    socket.on('disconnect', function () {
        usersInNamespace[name]--;
        console.log(
            `User disconnected to ${name} namespace. Users connected on ${name} namespace: ${
                usersInNamespace[name]
            }. Total users connected: ${getTotalUsersConnected(namespaces, usersInNamespace)}`
        );
    });
};

/**
 * Get total number of connected clients
 * @param {*} namespaces
 * @param {*} connectedClients
 * @returns
 */
const getTotalUsersConnected = (namespaces, connectedClients) => {
    return namespaces.reduce((acum, namespace) => acum + connectedClients[namespace], 0);
};

module.exports = notificationService;
