const socketIO = require('socket.io');
const { io: ClientIO } = require('socket.io-client');
const notificationService = require('../src/websockets/notificationService.js');

describe('Pub/Sub Messaging Service', () => {
    let clientSocket;

    const app = require('../src/app');
    const io = socketIO(app.server);
    const serverSocketSpy = jest.spyOn(io, 'on');

    afterAll(() => {
        clientSocket.close();
    });

    it('should handle client connections', async () => {
        // Initialize Pub/Sub Messaging Service with io mock
        notificationService(io);
        clientSocket = new ClientIO();

        expect(serverSocketSpy).toHaveBeenCalledWith('connection', expect.anything());
        expect(serverSocketSpy).toHaveBeenCalledTimes(1);
    });

    // TODO Connection to namespaces and authentication
});
