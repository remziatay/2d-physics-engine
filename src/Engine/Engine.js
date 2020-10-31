import rafSchd from 'raf-schd'

export default class Engine {
  constructor (physics, clearFunc, on = true) {
    this.fpsSample = []
    if (on) this.start()
    this.physics = physics
    this.clear = clearFunc
  }

  start () {
    if (!this.on) {
      this.on = true
      this.engine()
    }
  }

  stop () {
    this.engine.cancel()
    this.on = false
  }

  engine = rafSchd(() => {
    if (!this.on) return

    const timestep = 0.06 // 60FPS

    this.clear()
    this.physics.removeRedundantShapes()
    this.physics.checkCollisions()
    // if (!this.on) return;

    this.physics.shapes.forEach((shape) => {
      if (this.on) shape.update(timestep)
      shape.draw(this.physics.ctx)
    })
    this.engine()
  })
}
