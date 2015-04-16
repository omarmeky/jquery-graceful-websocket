Originally a fork of jquery-graceful-websocket.

Added features:

* Removed jQuery dependency
* Support for IE8
* Fallback polling uses JSONP for CORS support

```js
var simpleSocket = require('simple-socket');
var ws = simpleSocket.init(ws://localhost/blah);

//handlers are the same as jquery-graceful-websocket

```
