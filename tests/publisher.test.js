const request = require('supertest');
const createError = require('http-errors');
const auth = require('../src/middleware/auth');

describe('REST API Status', () => {
    // Spies
    const checkAuthSpy = jest.spyOn(auth, 'checkPublisherAuth');
    // Important to be required after spies
    const app = require('../src/app');

    it('should execute authentication middleware when calling message endpoint', async () => {
        // TODO extract to a function
        const res = await request(app)
            .post('/message')
            .send({ data: { notification: 'TEST-NOTIFICATION' } })
            .set('Accept', 'application/json');

        expect(checkAuthSpy).toHaveBeenCalled();
    });

    it('should return Unauthorized error if auth middleware returns an unauthorized response', async () => {
        // Skips authentication middleware and mock socket
        checkAuthSpy.mockImplementation((req, res, next) => next(createError(401)));

        const res = await request(app)
            .post('/message')
            .send({ data: { notification: 'TEST-NOTIFICATION' } })
            .set('Accept', 'application/json');
        expect(res.statusCode).toEqual(401);
    });

    it('should return a 400 status code if input data is missing', async () => {
        // Skips authentication middleware
        checkAuthSpy.mockImplementation((req, res, next) => next());

        const res = await request(app).post('/message');
        expect(res.statusCode).toEqual(400);
    });

    it('should emit the message to the socket if auth middleware succeds', async () => {
        // Skips authentication middleware and mock socket
        checkAuthSpy.mockImplementation((req, res, next) => {
            req.app = { io: { emit: () => console.log('Emitting mock notification') } };
            next();
        });

        const res = await request(app)
            .post('/message')
            .send({ data: { notification: 'TEST-NOTIFICATION' } })
            .set('Accept', 'application/json');

        expect(res.statusCode).toEqual(200);
    });

    it('should emit the message to the socket default namespace', async () => {
        // Skips authentication middleware and mock socket
        checkAuthSpy.mockImplementation((req, res, next) => {
            req.app = { io: { emit: () => console.log('Emitting mock notification') } };
            next();
        });

        const res = await request(app)
            .post('/message')
            .send({ data: { notification: 'TEST-NOTIFICATION' } })
            .set('Accept', 'application/json');

        expect(res.statusCode).toEqual(200);
    });

    it('should emit the message to the socket custom namespace', async () => {
        // Skips authentication middleware and mock socket
        checkAuthSpy.mockImplementation((req, res, next) => {
            req.app = {
                io: {
                    of: namespace => {
                        console.log('Mock io namespace', namespace);
                        return { emit: () => console.log('Emitting mock notification') };
                    },
                },
            };
            next();
        });

        const res = await request(app)
            .post('/message')
            .query({ namespace: 'TEST-NAMESPACE' })
            .send({ data: { notification: 'TEST-NOTIFICATION' } })
            .set('Accept', 'application/json');

        expect(res.statusCode).toEqual(200);
    });

    // TODO DIfferent environment configurations
});
