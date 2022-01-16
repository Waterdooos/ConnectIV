(function util(exports) {
  function broadcast(game, msg) {
    game.whitePlayer.send(msg);
    game.bluePlayer.send(msg);
  }
  
  exports.broadcast = broadcast;
  
  function constructMsg(msg, data) {
    msg.data = data;
    return JSON.stringify(msg, (key, value) => {
      if (key === "neighbours") return undefined;
      return value;
  });
  }
  
  exports.constructMsg = constructMsg;
})(typeof exports === "undefined" ? (this.util = {}) : exports);