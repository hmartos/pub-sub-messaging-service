# Pub/Sub Messaging Service

This project is a self-hosted Pub/Sub implementation with [NodeJS](https://nodejs.org/) and [Docker](https://www.docker.com/) for real time notifications.

The publisher(s) can send messages to the subscriber(s) through an HTTP request to a Restful API powered by [Express] and [Socket.IO](https://socket.io/).

## Getting started

### Local environment

You can easily setup a local environment for this project by cloning the repository, installing the dependencies with `npm install`, and executing the command `npm run start` to start the Pub/Sub messaging service.

The service will be listening at `http://localhost:3000`.

### Running with Docker

You can run the `pub-sub-messaging-service` Docker image with `docker run --rm -p "3000:3000" pub-sub-messaging-service`

## Connecting a client (Subscriber)

Clients can subscribe to the messages sent by publishers using the [Socket.IO client](https://socket.io/docs/v4/client-installation/) or with a standard [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).

## Using the Socket.IO client

You can suscribe a client to receive notifications using `socket.io-client` library. Example:

```javascript
// Import `io`from Socket.IO client -> https://socket.io/docs/v4/client-api/

socket = io('http://localhost:3000');

socket.on('connect', function(){
  console.log("Client connected")!
});

socket.on('notification', function(data){
  console.log(`Notification received!`, data)
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

// TODO Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
});
```

You can see a [working example](http://localhost:3000/websocket.html) in `websocket.html` file in `examples` folder.

## Sending notifications to connected clients

To send a notification to all connected clients you should make a POST request to `http://localhost:3000/message`, sending the data you want to send in the notification in a JSON with a `data` key.

TODO Remove `data` key -> just take the body
Data can be a string, number, boolean, object or array in a JSON. If request body is not a valid JSON with `data` key, server will respond with a `400 Bad Request` status code. Valid body examples:

TODO Redo examples

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
  -H 'Accept: */*' \
  -H 'Accept-Encoding: gzip, deflate' \
  -H 'Authorization: Bearer eyJraWQiOiJrMSIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJ1c2Vyc01hbmFnZW1lbnRSZXN0QXBpIiwiYXVkIjoiTkZRIiwiZXhwIjoxNTY1MTk4OTYwLCJqdGkiOiJfZWZNRkdmTjVReXVsQ085dEpFWGVRIiwic3ViIjoiMiJ9.BAsncTBXStCJUTzzYJT6hi9pc54LQooLdwzyRukV6vkLaMR0acc8aQlzbuJajN96BytHzLKS8T93MWVcXdwN1HdSl7fbaTlzCpH6Q57e5RrXptScbnJJPh_jv6MiI_kYKqYgQMEUT9mqNrhS4daSp8nWs2BIVbiO-cR-paEfcIAgJp1FFxNCy-6yLUQ0_gHNqRWihLMw7t3TNdTS0upY4bNmC6uaY8yrQNoDJmOtQX7XG-BwSbFzbN_tw09pjNnqlA3MR14ZZyNONEg44Elyv6ysEOPLVLLcmn1_IzxYv2th-zR3slwpPuiWtBG0-wQRBsW3BO5oS4Ld1T4LEq2R2A' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Content-Length: 48' \
  -H 'Content-Type: application/json' \
  -H 'Host: localhost:3000' \
  -H 'Postman-Token: 45acd051-4e3a-42df-98e7-200e4fe2cff1,94d426eb-c235-4546-8d79-11802664a0e1' \
  -H 'User-Agent: PostmanRuntime/7.15.2' \
  -H 'cache-control: no-cache' \
  -d '{ "data": "Message - 2019-08-07T09:29:30.007Z" }'
```

## Authentication

There are different authentication methods, which can be configured independently for the publisher and for the subscriber.

The configuration of the different authentication options is done through environment variables.

To configure authentication for the publisher, you should set the `API_AUTH_TYPE` environment variable.

To configure subscriber authentication, you should set the `SOCKET_AUTH_TYPE` environment variable.

The following section describes the different options available for each authentication method, along with an example configuration for each of them.

### No authentication

No authentication is applied. This is the default setting for both the subscriber and the publisher.

```sh
# Publisher authentication method - No authentication
API_AUTH_TYPE="NO_AUTH"
# Subscriber authentication method - No authentication
SOCKET_AUTH_TYPE="NO_AUTH"
```

TODO Examples for publisher and subscriber

### Using a secret token

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

TODO Examples for publisher and subscriber

### Externally validating the token - "Token forwarding"

Forward the authentication token received in the `Authentication` header by making a GET request to the URL defined in the `API_AUTH_URL` environment variable.

If the response to the forwarded authentication request has a [Succesful HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#successful_responses), then the notification/connection is proccesed. If not, the request will be rejected with a `401 Not Authorized` status.

```sh
# Publisher authentication method - Secret token
API_AUTH_TYPE="AUTH_TOKEN_FORWARDING"
API_AUTH_URL="MY_CUSTOM_API_AUTH_URL"
# Subscriber authentication method - Secret token
SOCKET_AUTH_TYPE="AUTH_TOKEN_FORWARDING"
SOCKET_AUTH_URL="MY_CUSTOM_SOCKET_AUTH_URL"
```

TODO Examples for publisher and subscriber

## Namespaces / Topics

You can use different namespaces to allow separate communication channels or rooms. For more information about namespaces you can read the [official documentation](https://socket.io/docs/rooms-and-namespaces/).

### Sending notifications to connected clients to a namespace

If you want to send a notification only to a specific namespace, you must add a `namespace` queryParam to the POST request to `/message` endpoint with the namespace value.

Example request:

```bash
curl -X POST \
  'http://localhost:30000/message?namespace=test-namespace' \
  -H 'Accept: */*' \
  -H 'Accept-Encoding: gzip, deflate' \
  -H 'Authorization: Bearer eyJraWQiOiJrMSIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJ1c2Vyc01hbmFnZW1lbnRSZXN0QXBpIiwiYXVkIjoiTkZRIiwiZXhwIjoxNTY1MTk4OTYwLCJqdGkiOiJfZWZNRkdmTjVReXVsQ085dEpFWGVRIiwic3ViIjoiMiJ9.BAsncTBXStCJUTzzYJT6hi9pc54LQooLdwzyRukV6vkLaMR0acc8aQlzbuJajN96BytHzLKS8T93MWVcXdwN1HdSl7fbaTlzCpH6Q57e5RrXptScbnJJPh_jv6MiI_kYKqYgQMEUT9mqNrhS4daSp8nWs2BIVbiO-cR-paEfcIAgJp1FFxNCy-6yLUQ0_gHNqRWihLMw7t3TNdTS0upY4bNmC6uaY8yrQNoDJmOtQX7XG-BwSbFzbN_tw09pjNnqlA3MR14ZZyNONEg44Elyv6ysEOPLVLLcmn1_IzxYv2th-zR3slwpPuiWtBG0-wQRBsW3BO5oS4Ld1T4LEq2R2A' \
  -H 'Cache-Control: no-cache' \
  -H 'Connection: keep-alive' \
  -H 'Content-Length: 48' \
  -H 'Content-Type: application/json' \
  -H 'Host: localhost:3000' \
  -H 'Postman-Token: 45acd051-4e3a-42df-98e7-200e4fe2cff1,94d426eb-c235-4546-8d79-11802664a0e1' \
  -H 'User-Agent: PostmanRuntime/7.15.2' \
  -H 'cache-control: no-cache' \
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

socket.on('notification', function(data){
  console.log(`Notification received!`, data)
});
```

## Build with Docker

To Build a Docker image from source code execute the command `docker build -t pub-sub-messaging-service .`
