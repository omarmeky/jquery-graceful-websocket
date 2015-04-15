var $ = require('jquery');
require('jQuery-ajaxTransport-XDomainRequest');

module.exports = {
	gracefulWebSocket: function (url) {
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
					var success = true;
					$.ajax({
						async: false, // send synchronously
						type: 'POST',
						url: url.replace('ws', 'http') + '?' + $.param( getFallbackParams() ),
						data: data,
						dataType: 'text',
						contentType : "application/x-www-form-urlencoded; charset=utf-8",
						success: pollSuccess,
						error: function (xhr) {
							success = false;
							$(fws).triggerHandler('error');
						}
					});
					return success;
				},
				close: function () {
					clearTimeout(openTimout);
					clearInterval(pollInterval);
					this.readyState = CLOSED;
					$(fws).triggerHandler('close');
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
				var messageEvent = {"data" : data};
				fws.onmessage(messageEvent);
			}

			function poll() {
				$.ajax({
					type: 'GET',
					url: url.replace('ws', 'http'),
					dataType: 'text',
					data: getFallbackParams(),
					success: pollSuccess,
					error: function (xhr) {
						$(fws).triggerHandler('error');
					}
				});
			}

			// simulate open event and start polling
			openTimout = setTimeout(function () {
				fws.readyState = OPEN;
				//fws.currentRequest = new Date().getTime();
				$(fws).triggerHandler('open');
				poll();
				pollInterval = setInterval(poll, 3000);

			}, 100);

			// return socket impl
			return fws;
		}

		// create a new websocket or fallback
		var ws = window.WebSocket ? new WebSocket(url) : new FallbackSocket();
 		$(window).unload(function () { ws.close(); ws = null });
		return ws;
	}
};
