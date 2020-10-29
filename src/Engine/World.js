import Engine from './Engine'
import Physics from './Physics'

export default class World {
  constructor (canvas, gravity = 0) {
    this.ctx = canvas.getContext('2d')
    this.physics = new Physics(canvas, gravity)
    this.engine = new Engine(this.physics, () => this.ctx.clearRect(0, 0, canvas.width, canvas.height))
  }

  addShapes (...shapes) {
    this.physics.addShapes(shapes)
  }
}
