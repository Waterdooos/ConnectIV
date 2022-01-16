(function util(exports) {
  /**
   * Sends the same message to all players in the game
   * @param {Game} game 
   * @param {message} msg 
   */
  function broadcast(game, msg) {
    game.whitePlayer.send(msg);
    game.bluePlayer.send(msg);
  }
  
  exports.broadcast = broadcast;
  
  /**
   * Returns a message injected with data. If the message contains a disk and thus neighbours which may contain a loop, 
   * this will be removed from the JSON message.  
   * @param {message} msg 
   * @param {any} data 
   * @returns JSONified message with data
   */
  function constructMsg(msg, data) {
    msg.data = data;
    return JSON.stringify(msg, (key, value) => {
      if (key === "neighbours") return undefined;
      return value;
    });
  }
  
  exports.constructMsg = constructMsg;

  /**
   * Returns whether two objects are equal. (null equals null)
   * @param {Object} obj1 
   * @param {Object} obj2 
   * @returns boolean
   */
  function objectEquals(obj1, obj2) {
    if (obj1 && !obj2 || !obj1 && obj2) return false; // Deal with null cases
    for( let key in obj1 ){
      if( !( key in obj2 ) ) return false;
      if( obj1[key] !== obj2[key] ) return false;
    }
    return true;
  }

  exports.objectEquals = objectEquals;

})(typeof exports === "undefined" ? (this.util = {}) : exports);