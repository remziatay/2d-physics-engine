import Shape from './Shape'

export default class Rectangle extends Shape {
  constructor ({ x, y, w, h, color, vx = 0, vy = 0, ax = 0, ay = 0, kinetic = true }) {
    super({ x, y, color, vx, vy, ax, ay, kinetic })
    this.w = w
    this.h = h
    this.mass = w * h / 1000
  }

  getPoints () {
    const { x, y, w, h } = this
    return [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }]
  }

  draw (ctx) {
    const { x, y, w, h, color } = this
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    // ctx.stroke();
    ctx.fillStyle = color
    ctx.fill()
    // ctx.fillStyle = this.color;
    // ctx.fillRect(x, y, w, h); // create rectangle
  }
}
