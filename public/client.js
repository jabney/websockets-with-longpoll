"use strict";
((root) => {
  root.IOClient = class IOClient {
    constructor() {
      this._transport = Transport.factory();
      console.log("Transport type:", this._transport.type);
    }

    subscribe(listener) {
      this._transport.subscribe(listener);
    }

    publish(data) {
      this._transport.publish(data);
    }
  };

  class Transport {
    /**
     * @param {"longpoll"|"websocket"|"unknown"} type
     */
    constructor(type) {
      /**
       * @type {"longpoll"|"websocket"|"unknown"}
       */
      this.type = type || "unknown";
      /**
       * @type {WebSocket}
       */
      this.socket = null;
    }

    /**
     * @param {(data: any) => void} listener
     * @returns {void}
     */
    subscribe(listener) {
      throw "not implemented";
    }

    /**
     * @param {any} data
     * @returns {void}
     */
    publish(data) {
      throw "not implemented";
    }
  }

  /**
   * @returns {Transport}
   */
  Transport.factory = () => {
    return window.WebSocket
      ? new TransportWebSocket()
      : new TransportLongPoll();
  };

  class TransportLongPoll extends Transport {
    constructor() {
      super("longpoll");
    }

    subscribe(listener) {
      (function longPoll() {
        $.getJSON("/messages", (data) => {
          listener(data);
          longPoll();
        });
      })();
    }

    publish(data) {
      $.post("/messages", data);
    }
  }

  class TransportWebSocket extends Transport {
    constructor() {
      super("websocket");
      this.socket = new WebSocket(`ws://${location.host}`);
    }

    subscribe(listener) {
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        listener(data);
      };
    }

    publish(data) {
      this.socket.send(JSON.stringify(data));
    }
  }
})(this);
