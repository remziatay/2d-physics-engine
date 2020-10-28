import Shape from './Shape'

export default class Circle extends Shape {
  constructor ({ x, y, r, color, vx = 0, vy = 0, ax = 0, ay = 0, kinetic = true }) {
    super({ x, y, color, vx, vy, ax, ay, kinetic })
    this.r = r
    this.mass = Math.PI * r ** 2 / 1000
  }

  updateRadius (r) {
    this.r = r
    this.mass = Math.PI * r ** 2 / 1000
  }

  draw (ctx) {
    const { x, y, r, color } = this
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fillStyle = color
    ctx.fill()
  }
}
