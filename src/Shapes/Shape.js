export default class Shape {
  constructor ({ x, y, color, vx = 0, vy = 0, ax = 0, ay = 0, kinetic = true }) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.ax = ax
    this.ay = ay
    this.kinetic = kinetic
    if (color) this.color = color
    else this.color = '#' + Math.floor(Math.random() * 16777215).toString(16)
  }

  move (dt) {
    if (!this.kinetic) return
    const { vx, vy, ax, ay } = this
    this.x += dt * (vx + dt * ax / 2)
    this.vx += dt * ax
    this.y += dt * (vy + dt * ay / 2)
    this.vy += dt * ay
  }
}

class Point {
  constructor (x, y) {
    this.x = x
    this.y = y
  }
}
