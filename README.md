# In-App Messaging Chat Application

This is the sample code for the In-App messaging use case on [Nexmo Developer](https://developer.nexmo.com).

## Initial Setup

### Install the CLI Beta

```
$ npm install -g nexmo-cli@beta
$ nexmo setup api_key api_secret
```

### Create Nexmo Application

Run this command in the project directory:
```
$ nexmo app:create "My Messaging App" https://example.com/answer https://example.com/event --type rtc --keyfile private.key
Application created: APPLICATION_ID
Credentials written to ./.nexmo-app
Private Key saved to: private.key
```

## Create the Conversation and Users

### Create Conversation
```
$ nexmo conversation:create display_name="Messaging Demo"
Conversation created: CONVERSATION_ID
```

### Create Two Users 
```
$ nexmo user:create name="adam"
User created: ADAM_USER_ID

$ nexmo user:create name="barbara"
User created: BARBARA_USER_ID
```

### Add Users to the Conversation’s Members
```
$ nexmo member:add CONVERSATION_ID action=join channel='{"type":"app"}' user_id=ADAM_USER_ID
Member added: ADAM_MEMBER_ID

$ nexmo member:add CONVERSATION_ID action=join channel='{"type":"app"}' user_id=BARBARA_MEMBER_ID
Member added: BARBARA_MEMBER_ID
```

List the members:

```
$ nexmo member:list CONVERSATION_ID -v
name    | user_id               | user_name | state 
-----------------------------------------------------------------------
adam    | ADAM_USER_ID          | adam      | JOINED
barbara | BARBARA_USER_ID       | barbara   | JOINED
```

### Generate User JWTs
Need to use APPLICATION_ID and the actual name of the user
```
$ ADAM_JWT="$(nexmo jwt:generate ./private.key sub=adam exp=$(($(date +%s)+86400)) acl='{"paths":{"/v1/users/**":{},"/v1/conversations/**":{},"/v1/sessions/**":{},"/v1/devices/**":{},"/v1/image/**":{},"/v3/media/**":{},"/v1/applications/**":{},"/v1/push/**":{},"/v1/knocking/**":{}}}' application_id=APPLICATION_ID)"

$ echo $ADAM_JWT
eyJhbGciOiJSUzI1NiIsInR5cCI...

$ BARBARA_JWT="$(nexmo jwt:generate ./private.key sub=barbara exp=$(($(date +%s)+86400)) acl='{"paths":{"/v1/users/**":{},"/v1/conversations/**":{},"/v1/sessions/**":{},"/v1/devices/**":{},"/v1/image/**":{},"/v3/media/**":{},"/v1/applications/**":{},"/v1/push/**":{},"/v1/knocking/**":{}}}' application_id=APPLICATION_ID)"

$ echo $BARBARA_JWT
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...```

## Build the Application

### Create Node app

Although this is a vanilla JavaScript application, you need to initialize it as a Node.js app so that you can refer to the installed dependencies in `node_modules`. Run the following command in the root directory of the application:

```
npm init
```

### Install dependencies

This installs `nexmo-client`, `moment` (for date/time manipulation) and `http-server` (see below).

```
npm install
```

## Configuration

Paste ADAM_JWT, BARBARA_JWT and CONVERSATION_ID into the appropriate `const` variables at the top of the `index.html` page.

### Testing

Run a web server (for example, the `http-server` node module). Open the `index.html` page in two separate tabs, which you can position side-by-side:

The following commands show you how to install and run `http-server`. In this instance, the page will be available at `http://localhost:3000`.

```
npm install http-server -g

http-server -p 3000
```

