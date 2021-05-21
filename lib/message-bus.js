const { EventEmitter } = require("events");

module.exports = (() => {
  const messageBus = new EventEmitter();

  return {
    /**
     * @param {(data: any) => void} onComplete
     * @returns {void}
     */
    longPoll(onComplete) {
      // Wait for a message.
      messageBus.once("message", (data) => {
        onComplete(data);
      });
    },

    /**
     * @param {any} data
     * @returns {void}
     */
    send(data) {
      messageBus.emit("message", data);
    },

    /**
     * @param {(data: any) => void} listener
     * @returns {() => void}
     */
    addListener(listener) {
      messageBus.addListener("message", listener);
      return () => void messageBus.removeListener("message", listener);
    },
  };
})();
