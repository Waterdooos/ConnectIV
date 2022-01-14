class Disk {
  constructor(color, neighbours = []) {
    this.color = color; // white = true, blue = false
    this.neighbours = neighbours;
  }
}

module.exports = Disk;