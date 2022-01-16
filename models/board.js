const Disk = require("./disk");
const Constants = require("../public/javascripts/constants");

class Board {
  constructor() {
    this.cells = new Array(Constants.columns).fill(null, 0, Constants.columns);
    this.cells.forEach((val, index, arr) => arr[index] = new Array(Constants.rows).fill(null, 0, Constants.rows));
  }
  
  addDisk(column, color) {
    if (typeof column != "number" || column < 0 || column > 7 || !Number.isInteger(column)) throw "Not a valid integer";
    if (color !== Constants.colorA && color !== Constants.colorB) throw "Not a right disk color";
    let row = 0;
    while(this.cells[column][row] && row < Constants.rows) {row++;}
    if (row >= Constants.rows) throw "Column is full";
    const newDisk = this.cells[column][row] = new Disk(color, this.getNeighbours(column, row));
    this.updateNeighbours(newDisk);
    return newDisk;
  }

  /**
   * Return what win condition has been met. In the case of none, null is returned
   * @param {Disk} disk 
   * @returns null, "draw", "white" or "blue"
   */
  checkWinCondition(disk) {
    for (let i = 0; i <= 3; i++) {
      let count = 1;
      let currentDisk = disk.neighbours[i];
      while (currentDisk?.color === disk.color) {
        count++;
        currentDisk = currentDisk.neighbours[i];
      }
      currentDisk = disk.neighbours[7-i];
      while (currentDisk?.color === disk.color) {
        count++;
        currentDisk = currentDisk.neighbours[7-i];
      }
      if (count >= Constants.rowLength) return disk.color;
    }
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i][Constants.rows - 1] === null) return null;
    }
    return Constants.draw;
  }

  /**
   * Returns an array of neighbours from a position on the board
   * @param {Integer} column 
   * @param {Integer} row 
   * @returns Array with neighbours
   */
  getNeighbours(column, row) {
    const neighbours = [];
    for (let j = 1; j >= -1; j--) {
      for (let i = -1; i <= 1; i++) {
        if (row + j < 0 || row + j > Constants.rows - 1 || column + i < 0 || column + i > Constants.columns - 1) {
          neighbours.push(null);
          continue;
        }
        if (i != 0 || j != 0) {
          neighbours.push(this.cells[column+i][row+j]);
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
      if (!disk.neighbours[i]) continue;
      disk.neighbours[i].neighbours[7-i] = disk;
    }
  }
}

module.exports = Board;