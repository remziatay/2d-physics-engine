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
      requestAnimationFrame(this.engine)
    }
  }

  stop () {
    if (this.on) this.on = false
  }

  engine = () => {
    if (!this.on) return
    requestAnimationFrame(this.engine)

    const timestep = 0.06 // 60FPS

    this.clear()
    this.physics.checkCollisions()
    // if (!this.on) return;

    this.physics.shapes.forEach((shape) => {
      if (this.on) shape.update(timestep)
      shape.draw(this.physics.ctx)
    })
  };
}
