const Disk = require("disk");

class Board {
  constructor() {
    this.cells = new Array(7).fill(new Array(6).fill(null, 0, 6), 0, 7);
  }
  
  addDisk(column, color) {
    if (typeof column != "number" || column < 0 || column > 7 || !Number.isInteger(column)) throw "Not a valid integer";
    if (typeof color != "boolean") throw "Not a boolean";
    let row = 0;
    while(!this.cells[column][row]) {row++;}
    const newDisk = this.cells[column][row] = new Disk(color, this.getNeighbours(column, row));
    this.updateNeighbours(newDisk);
  }

  /**
   * Returns an array of neighbours from a position on the board
   * @param {Integer} column 
   * @param {Integer} row 
   * @returns Array with neighbours
   */
  getNeighbours(column, row) {
    const neighbours = [];
    for (let j = -1; j < 2; j++) {
      for (let i = -1; i < 2; i++) {
        if (row + j < 0 || row + j > 5 || column + i < 0 || column + i > 6) {
          neighbours.push(null);
          continue;
        }
        if (i != 0 && j != 0) {
          neighbours.push(this.cells[i][j]);
        }
      }
    }
    return neighbours;
  }
  
  /**
   * Updates the neighbours of this disk to include this disk as one of their neighbours
   * @param {Disk} disk 
   */
  updateNeighbours(disk) {
    for(let i = 0; i <= disk.neighbours.length; i++) {
      disk.neighbours[i].neighbours[6-i] = disk;
    }
  }
}