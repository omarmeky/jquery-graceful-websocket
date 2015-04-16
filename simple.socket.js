module.exports = {
	init: function (url) {
		/**
		 * Creates a fallback object implementing the WebSocket interface
		 */
		function FallbackSocket() {
			var CONNECTING = 0;
			var OPEN = 1;
			var CLOSING = 2;
			var CLOSED = 3;

			var pollInterval;
			var openTimout;

			// create WebSocket object
			var fws = {
				// ready state
				readyState: CONNECTING,
				bufferedAmount: 0,
				send: function (data) {
					console.error('The send method is not yet implemented.');

					// TODO: implement this without jQuery

					// var success = true;
					// $.ajax({
					// 	async: false, // send synchronously
					// 	type: 'POST',
					// 	url: url.replace('ws', 'http') + '?previousRequest=' + getFallbackParams().previousRequest + '&currentRequest=' + getFallbackParams().currentRequest,
					// 	data: data,
					// 	dataType: 'text',
					// 	contentType : "application/x-www-form-urlencoded; charset=utf-8",
					// 	success: pollSuccess,
					// 	error: function (xhr) {
					// 		success = false;
					// 		fws.onerror();
					// 	}
					// });
					// return success;
				},
				close: function () {
					clearTimeout(openTimout);
					clearInterval(pollInterval);
					this.readyState = CLOSED;
					fws.onclose();
				},
				onopen: function () {},
				onmessage: function () {},
				onerror: function () {},
				onclose: function () {},
				previousRequest: null,
				currentRequest: null
			};

			function getFallbackParams() {

				// update timestamp of previous and current poll request
				fws.previousRequest = fws.currentRequest;
				fws.currentRequest = new Date().getTime();

				// extend default params with plugin options
				return {
					previousRequest: fws.previousRequest,
					currentRequest: fws.currentRequest
				};
			}

			/**
			 * @param {Object} data
			 */
			function pollSuccess(data) {
				// trigger onmessage
				fws.onmessage({
					data: JSON.stringify(data)
				});
			}

			function poll() {
				var callback = 'callBack_' + +new Date;
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = url.replace('ws', 'http') + '&callback=' + callback;
				window[callback] = function(data) {
					pollSuccess(data);
					document.getElementsByTagName('head')[0].removeChild(script);
					script = null;
					try
					{
						delete window[callback];
					}
					catch(e)
					{
						window[callback] = undefined;
					}
				};
				script.onerror = fws.onerror;
				document.getElementsByTagName('head')[0].appendChild(script);
			}

			// simulate open event and start polling
			openTimout = setTimeout(function () {
				fws.readyState = OPEN;
				fws.onopen();
				poll();
				pollInterval = setInterval(poll, 3000);

			}, 100);

			// return socket impl
			return fws;
		}

		// create a new websocket or fallback
		var ws = window.WebSocket ? new WebSocket(url) : new FallbackSocket();

		if (window.attachEvent) {
			window.attachEvent('onunload', unloadHandler);
		}
		else if (window.addEventListener) {
			window.addEventListener('beforeunload', unloadHandler, false);
		}
		function unloadHandler() {
			ws.close();
			ws = null;
		}

		return ws;
	}
};
