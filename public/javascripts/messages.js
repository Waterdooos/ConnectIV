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
})(typeof exports === "undefined" ? (this.Messages = {}) : exports);