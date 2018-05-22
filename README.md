# Vidyo Tokens Generation

### Documentation [source](https://developer.vidyo.io/documentation/4-1-22-9/getting-started)

To connect to Vidyo.io, the VidyoClient SDK needs to pass a token. A token is a short-lived authentication credential that grants access to the Vidyo.io service on behalf of the developer to a specific user. When an endpoint requests access to the service, your application backend should generate a token and pass it on to the client application.

### How to Generate a Token

For each application, you must create a DeveloperKey and ApplicationID in the API Key section of the Vidyo.io site and securely store it in your application backend. Then, each time you need to grant access to the Vidyo.io service, you must generate a Token from the DeveloperKey and ApplicationID as described below and pass it to their endpoint application or the VidyoConnector application.

DeveloperKey and ApplicationID are "static" in your application. You will also need to provide a user name and an expiration time whenever you need to generate a token for a user.

* __key__
* __appID__
* __userName__
* __expiresInSeconds__




### Getting Started

Requests can be made with `curl` by following regular REST calls.

```
curl -H "Content-Type: application/json" -X POST https://trro08dgr7.execute-api.us-east-1.amazonaws.com/dev/token_generate -d '{"key": "xxxx", "appID": "xxxx.vidyo.io", "userName": "xxx", "expiresInSecs": "999999999"}'
```

### Authentication
There is no authentication necessary for the API.