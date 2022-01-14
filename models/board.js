const Disk = require("disk");

class Board {
  constructor() {
    this.cells = new Array(7).fill(null, 0, 7);
    this.cells.forEach((val, index, arr) => arr[index] = new Array(6).fill(null, 0, 6));
  }
  
  addDisk(column, color) {
    if (typeof column != "number" || column < 0 || column > 7 || !Number.isInteger(column)) throw "Not a valid integer";
    if (color !== "white" && color !== "blue") throw "Not a right disk color";
    let row = 0;
    while(this.cells[column][row] && row <= 5) {row++;}
    if (row > 5) throw "Column is full";
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
      if (count >= 4) return disk.color;
    }
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i][5] === null) return null;
    }
    return "draw";
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
        if (row + j < 0 || row + j > 5 || column + i < 0 || column + i > 6) {
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