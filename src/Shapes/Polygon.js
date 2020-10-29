import Physics from '../Engine/Physics'
import Vector from '../Math/Vector'
import Utils from '../Math/Utils'

export default class Polygon {
  constructor ({ vertices, vCount, center, size, angle, color, mass, inertia, density, v, a, kinetic, gravity }) {
    if (density !== undefined && mass !== undefined) throw new Error("Shouldn't give both density and mass!")
    else if (!density && !mass) density = 1
    if (vertices) {
      this.vCount = vertices.length
      this.vertices = vertices
    } else if (center && vCount) {
      this.center = new Vector(center.x, center.y)
      this.vCount = vCount
      this.vertices = calcRegularVertices(angle || 0)
    } else throw new Error("Can't create polygon without vertices or center and vertex count!")
    this.mass = mass
    this.inertia = inertia
    this.density = density
    this.initialize()
    this.kinetic = kinetic === undefined ? true : kinetic
    this.gravity = gravity === undefined ? true : gravity
    this.angle = Utils.degToRad(angle || 0)
    // todo
    this.staticFriction = 0.8
    this.dynamicFriction = 0.8
    this.restitution = 0.2
    this.calcNormals()
    v = { x: 0, y: 0, r: 0, ...v }
    a = { x: 0, y: 0, r: 0, ...a }
    this.v = new Vector(v.x, v.y)
    this.dv = new Vector(a.x, a.y)
    this.w = Utils.degToRad(v.r)
    this.dw = Utils.degToRad(a.r)
    this.color = color || '#' + Math.floor(Math.random() * 16777215).toString(16)

    function calcRegularVertices (angle) {
      angle -= 90 + (vCount % 2 ? 0 : 180 / vCount)
      size = size || 1
      const vertices = []
      const radian = Utils.degToRad(angle)
      for (let i = 0; i < vCount; i++) {
        vertices.push(
          new Vector(
            center.x + size * Math.cos(radian + i * 2 * Math.PI / vCount),
            center.y + size * Math.sin(radian + i * 2 * Math.PI / vCount)
          )
        )
      }
      return vertices
    }
  }

  initialize () {
    const { vertices, vCount } = this
    let [area, inertia, center] = [0, 0, Vector.ZERO]
    for (let i = 0; i < vCount; i++) {
      const vertex1 = vertices[i]
      const vertex2 = vertices[(i + 1) % vCount]
      const cross = vertex1.cross(vertex2)

      const triCenter = vertex1.add(vertex2).div(3)
      const triArea = cross / 2
      const triInertia = triArea * (vertex1.sqrLength + vertex1.dot(vertex2) + vertex2.sqrLength)

      center = center.multiply(area).add(triCenter.multiply(triArea)).div(area + triArea)
      area += triArea
      inertia += triInertia
    }
    inertia /= 6
    if (!this.center) this.center = center
    if (!this.density) this.density = this.mass / area
    else if (this.mass === undefined) this.mass = this.density * area
    inertia *= this.density
    inertia -= this.mass * this.center.sqrLength
    if (this.inertia === undefined) this.inertia = inertia || Infinity
    this.invInertia = this.inertia && 1 / this.inertia
    this.invMass = this.mass && 1 / this.mass
  }

  // TODO FIX THIS!!!
  change ({ center, angle, vCount, size, color, mass, v, a, kinetic }) {
    this.center = new Vector(center.x, center.y)
    this.v = { ...this.v, ...v }
    this.a = { ...this.a, ...a }

    for (const attr in arguments[0]) {
      if (Object.prototype.hasOwnProperty.call(arguments[0], attr) && typeof this[attr] != 'object') {
        this[attr] = arguments[0][attr]
      }
    }
    // if (center || angle || vCount) this.vertices = this.createRegularPolygonVertices();
  }

  calcNormals () {
    if (this.normals) return this.normals
    const normals = []
    for (let i = 0; i < this.vCount; i++) {
      const j = (i + 1) % this.vCount
      const edge = this.vertices[j].sub(this.vertices[i])
      normals.push(edge.normalize().cross(1))
    }
    this.normals = normals
  }

  rotate (radian) {
    if (!radian) return
    Vector.rotate(this.vertices, radian, this.center)
    this.angle += radian
    this.normals = null
  }

  draw (ctx) {
    const { vertices } = this
    ctx.beginPath()
    ctx.moveTo(vertices[0].x, vertices[0].y)
    for (let i = 1; i < this.vCount; i++) ctx.lineTo(vertices[i].x, vertices[i].y)
    ctx.lineTo(vertices[0].x, vertices[0].y)
    ctx.stroke()
    ctx.fillStyle = this.color
    ctx.fill()
  }

  move (direction) {
    this.center.add(direction, true)
    this.vertices.forEach((vertex) => {
      vertex.add(direction, true)
    })
  }

  moveTo (point) {
    const direction = point.sub(this.center)
    this.move(direction)
    this.v = Vector.ZERO
  }

  update (dt) {
    if (!this.kinetic) return
    const { v, dv, w, dw } = this
    if (this.gravity) dv.add(Physics.gravity, true)

    if (v.x < 0.001 && v.x > -0.001) v.x = 0
    if (v.y < 0.001 && v.y > -0.001) v.y = 0
    // if (w < 0.001 && w > -0.001) this.w = 0;

    if (w || dw) this.rotate((w + dw / 2 * dt) * dt)
    if (v.x || v.y || dv.x || dv.y) this.move(v.add(dv.multiply(dt / 2)).multiply(dt))

    v.add(dv.multiply(dt), true)
    this.w += dw * dt

    dv.x = 0
    dv.y = 0
    this.dw = 0
  }

  getVelocityAtPoint (point) {
    const r = point.sub(this.center)
    const angularVelocity = r.cross(this.w, true)
    return this.v.add(angularVelocity)
  }

  applyForce (force, point) {
    const r = point.sub(this.center)
    this.dv.add(force.multiply(this.invMass), true)
    this.dw += r.cross(force) * this.invInertia
  }

  applyImpulse (impulse, point) {
    const r = point.sub(this.center)
    this.v.add(impulse.multiply(this.invMass), true)
    this.w += r.cross(impulse) * this.invInertia
  }
}
