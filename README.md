# Pub/Sub Messaging Service

This self-hosted service is a Pub/Sub messaging implementation for real time notifications with [NodeJS](https://nodejs.org/) and [Docker](https://www.docker.com/).

The publisher(s) can send messages to the subscriber(s) through an HTTP request to a RESTful API powered by [Express](https://expressjs.com/) and [Socket.IO](https://socket.io/).

## Getting started

### Local environment

You can setup a local environment for this project by cloning the repository, installing the dependencies with `npm install`, and executing the command `npm run start` to start the Pub/Sub Messaging Service.

The service will be listening at `http://localhost:3000`.

### Running with Docker

You can run the [Docker image](https://hub.docker.com/repository/docker/hmartos/pub-sub-messaging-service) in an ephimeral container executing `docker run --rm -p "3000:3000" hmartos/pub-sub-messaging-service`

## Connecting a client (Subscriber)

Clients can subscribe to the messages sent by publishers using the [Socket.IO client](https://socket.io/docs/v4/client-installation/) or with a standard [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).

### Using the Socket.IO client (Recomended)

You can suscribe a client to receive notifications using `socket.io-client` library. Example:

```javascript
// Import `io`from Socket.IO client -> https://socket.io/docs/v4/client-api/

socket = io('http://localhost:3000');

// Subscribe to 'connect' event
socket.on('connect', function () {
    console.log('Client connected!');
});

// Subscribe to 'notification' event
socket.on('notification', function (msg) {
    console.log(`Notification received: ${msg}`);
});

// Subscribe to 'connect_error' error event
socket.on('connect_error', err => {
    console.log(`Connection error: ${err.message}`);
});
```

You can see a [working example](http://localhost:3000/basic.html) in `basic.html` file in `examples` folder.

## Using a standard WebSocket

You can suscribe a client to receive notifications using a standard WebSocket. Example:

```javascript
const socket = new WebSocket('ws://localhost:3000/socket.io/?EIO=4&transport=websocket');

socket.addEventListener('open', function (event) {
    // Hello Server Message ->
    socket.send('40');
    console.log('Client connected');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
});
```

You can see a [working example](http://localhost:3000/websocket.html) in `websocket.html` file in `examples` folder.

## Sending notifications to connected clients (Publisher)

To send a notification to all connected clients you should make a POST request to `http://localhost:3000/message`, sending the data you want to send in the notification in a JSON with a `data` key.

Data can be a string, number, boolean, object or array in a JSON. If request body is not a valid JSON with `data` key, server will respond with a `400 Bad Request` status code. Valid body examples:

```json
{ "data": 1 }
{ "data": "Hello World!" }
{ "data": [1, 2, 3] }
{
  "data": {
    "user": "me",
    "likes": 123,
    "watched": true,
    "pending": [
      { "id": 1 },
      { "id": 2 }
    ]
  }
}
```

Example request:

```bash
curl -X POST \
  http://localhost:3000/message \
  -H 'Content-Type: application/json' \
  -d '{ "data": "Message - 2019-08-07T09:29:30.007Z" }'
```

## Configuration

This module have multiple configuration options for authentication and namespaces. To set a configuration option you should set different environment variables in each case.

In a local setup, you can create a `.env` file with the value for each environment variable, like the example you can find in the [`.env.example`](./.env.example) file.

```sh
API_AUTH_TYPE="NO_AUTH"
API_AUTH_TOKEN="MY_CUSTOM_API_TOKEN"
API_AUTH_URL="http://localhost:8080/api/auth"
SOCKET_AUTH_TYPE="NO_AUTH"
SOCKET_AUTH_TOKEN="MY_CUSTOM_SOCKET_TOKEN"
SOCKET_AUTH_URL="http://localhost:8080/socket/auth"
```

In Docker, you can add the [environment variables as arguments](https://docs.docker.com/engine/reference/run/#env-environment-variables) to the `docker run` command or in a [`environment`](https://docs.docker.com/compose/environment-variables/) block in a `docker-compose.yml` file

## Authentication

There are different authentication methods, which can be configured independently for the publisher and for the subscriber.

The configuration of the different authentication options is done through environment variables.

To configure authentication for the publisher, you should set the `API_AUTH_*` environment variable.

To configure subscriber authentication, you should set the `SOCKET_AUTH_*` environment variable.

The following section describes the different options available for each authentication method, along with an example configuration for each of them.

### No authentication

No authentication is applied. This is the default setting for both the subscriber and the publisher.

```sh
# Publisher authentication method - No authentication
API_AUTH_TYPE="NO_AUTH"
# Subscriber authentication method - No authentication
SOCKET_AUTH_TYPE="NO_AUTH"
```

There is a complete example in [basic.html](src/public/examples/basic.html)

### Using a shared secret token (API Key)

For Publisher authentication, it compares the value sent in the `Authentication` header of the HTTP request to `/message` endpoint with the value of the `API_AUTH_TOKEN` environment variable.
If they are the same, then the notification is processed. If not, the request will be rejected with a `401 Not Authorized` status.

For Subscriber authentication, it compares the value sent in the [`auth` socket option](https://socket.io/docs/v4/middlewares/#sending-credentials) with the value of the `SOCKET_AUTH_TOKEN` environment variable.
If they are the same, then the notification is processed. If not, the request will be rejected with a `401 Not Authorized` status.

```sh
# Publisher authentication method - Secret token
API_AUTH_TYPE="AUTH_TOKEN"
API_AUTH_TOKEN="MY_CUSTOM_API_TOKEN"
# Subscriber authentication method - Secret token
SOCKET_AUTH_TYPE="AUTH_TOKEN"
SOCKET_AUTH_TOKEN="MY_CUSTOM_SOCKET_TOKEN"
```

There is a complete example in [socket-auth-token.html](src/public/examples/socket-auth-token.html)

### Externally validating the token - "Token forwarding"

Forward the authentication token received in the `Authentication` header by making a GET request to the URL defined in the `API_AUTH_URL` environment variable.

If the response to the forwarded authentication request has a [Succesful HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#successful_responses), then the notification/connection is proccesed. If not, the request will be rejected with a `401 Not Authorized` status.

```sh
# Publisher authentication method - Token forwarding
API_AUTH_TYPE="AUTH_TOKEN_FORWARDING"
API_AUTH_URL="MY_AUTHENTICATION_API_URL"
# Subscriber authentication method - Token forwarding
SOCKET_AUTH_TYPE="AUTH_TOKEN_FORWARDING"
SOCKET_AUTH_URL="MY_AUTHENTICATION_API_URL"
```

There is a complete example in [socket-auth-token-forwarding.html](src/public/examples/socket-auth-token-forwarding.html)

## Namespaces / Topics

You can use different namespaces to allow separate communication channels or rooms. For more information about namespaces you can read the [official documentation](https://socket.io/docs/rooms-and-namespaces/).

### Sending notifications to connected clients to a namespace

If you want to send a notification only to a specific namespace, you must add a `namespace` query parameter to the POST request to `/message` endpoint with the namespace value.

Example request:

```bash
curl -X POST \
  'http://localhost:3000/message?namespace=test-namespace' \
  -H 'Content-Type: application/json' \
  -d '{ "data": "Message - 2019-08-07T09:29:30.007Z" }'
```

### Connecting a client to see notifications on a namespace

If you want a client to only receive notifications on a specific namespace, just pass the name of the namespace in the connection path:

```javascript
// This client will ONLY receive notifications on 'test-namespace' namespace
socket = io(`${BASE_URL}/test-namespace`, options);

socket.on('connect', function(){
  console.log("Client connected")!
});

socket.on('notification', function(msg){
  console.log(`Notification received!`, msg)
});
```

## Building with Docker

To Build a Docker image from source code execute the command `docker build -t pub-sub-messaging-service .`

## Uploading to DockerHub

Login with your [DockerHub](https://hub.docker.com/) credentials executing the command `docker login`.

Tag the Docker image executing the command `docker tag pub-sub-messaging-service $username/pub-sub-messaging-service:$tagname`.

Upload the Docker image to DockerHub repository executing the command `docker push $username/pub-sub-messaging-service:$tagname`.
