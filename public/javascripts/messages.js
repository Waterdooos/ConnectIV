(function messages(exports) {
  exports.TYPE_DROP_DISK = "DROP-A-DISK";
  exports.MSG_DROP_DISK = {
    type: exports.TYPE_DROP_DISK,
    data: null
  };
  exports.TYPE_WINNER = "WINNER"
  exports.MSG_WINNER = {
    type: exports.TYPE_WINNER,
    data: null
  }
  exports.TYPE_UPDATE_BOARD = "UPDATE-BOARD";
  exports.MSG_UPDATE_BOARD = {
    type: exports.TYPE_UPDATE_BOARD,
    data: null
  }
  exports.TYPE_ERROR = "ERROR";
  exports.MSG_ERROR = {
    type: exports.TYPE_ERROR,
    data: null
  }
  exports.TYPE_START_GAME = "START_GAME";
  exports.MSG_START_GAME = {
    type: exports.TYPE_START_GAME
  }
  exports.TYPE_GAME_RESULT = "GAME_RESULT";
  exports.MSG_GAME_RESULT = {
    type: exports.TYPE_GAME_RESULT,
    data: null
  }
  exports.TYPE_SET_PLAYER = "SET_PLAYER";
  exports.MSG_SET_PLAYER = {
    type: exports.TYPE_SET_PLAYER,
    data: null
  }
})(typeof exports === "undefined" ? (this.Messages = {}) : exports);