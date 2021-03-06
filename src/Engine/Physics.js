import PolyPoly from './PolyPoly'
import Vector from '../Math/Vector'

export default class Physics {
  constructor (canvas, g = 0) {
    this.shapes = []
    this.shapeCount = 0
    this.g = 0
    this.polyPoly = new PolyPoly()
    // this.setGravity(g);
    this.ctx = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height
  }

  static get gravity () {
    return new Vector(0, 10)
  }

  addShapes (shapes) {
    shapes.forEach((shape) => {
      this.shapes.push(shape)
    })
    this.shapeCount += shapes.length
  }

  removeRedundantShapes () {
    // window.show && console.log(this.shapes?.length, this.shapes, (window.show = false))
    this.shapes = this.shapes.filter(shape => {
      const { center, v, gravity } = shape
      if (center.x < -500 && v.x < 0) return false
      if (center.x > 2600 && v.x > 0) return false
      if (center.y < -500 && v.y <= 0 && (!gravity || this.g <= 0)) return false
      if (center.y > 4500 && v.y >= 0 && (!gravity || this.g >= 0)) return false
      return true
    })
    this.shapeCount = this.shapes.length
  }

  setGravity (g) {
    if (g - this.g) this.shapes.forEach((shape) => (shape.a.y += g - this.g))
    this.g = g
  }

  resolveContacts (contacts) {
    if (!contacts || !contacts.length) return

    contacts.sort((c1, c2) => c2.penetration - c1.penetration)
    const contact = contacts[0]
    if (contacts.length > 1 && contacts[0].penetration - contacts[1].penetration < 0.05) {
      const { polygon, other, position: position1 } = contacts[0]
      const { position: position2 } = contacts[1]
      const relativeVelocity1 = polygon.getVelocityAtPoint(position1).sub(other.getVelocityAtPoint(position1))
      const relativeVelocity2 = polygon.getVelocityAtPoint(position2).sub(other.getVelocityAtPoint(position2))
      const len1 = relativeVelocity1.length
      const len2 = relativeVelocity2.length
      contact.position = position1.multiply(len1).add(position2.multiply(len2)).div(len1 + len2)
      contact.relativeVelocity = relativeVelocity1.add(relativeVelocity2).multiply(0.5)
    }

    let { polygon, other, position, normal, tangent } = contact
    const relativeVelocity = polygon.getVelocityAtPoint(position).sub(other.getVelocityAtPoint(position))

    const contactVelocity = relativeVelocity.dot(normal)
    if (relativeVelocity.dot(normal) < 0) {
      // console.log('seperating')
      return true
    }

    const e = 0.2
    const r1 = position.sub(polygon.center)
    const r2 = position.sub(other.center)
    const impulseMagnitude =
      -(1 + e) *
      contactVelocity /
      (polygon.invMass +
        other.invMass +
        polygon.invInertia * r1.cross(normal) ** 2 +
        other.invInertia * r2.cross(normal) ** 2)

    if (!Number.isFinite(impulseMagnitude)) return true

    const impulse = normal.multiply(impulseMagnitude * 1.05)

    tangent = relativeVelocity.sub(normal.multiply(relativeVelocity.dot(normal))).normalize()

    const tangentMagnitude =
      -relativeVelocity.dot(tangent) /
      (polygon.invMass +
        other.invMass +
        polygon.invInertia * r1.cross(tangent) ** 2 +
        other.invInertia * r2.cross(tangent) ** 2)

    let frictionImpulse

    if (Math.abs(relativeVelocity.dot(tangent)) < 0.0001) {
      // console.log('too low')
      frictionImpulse = Vector.ZERO
    } else {
      if (Math.abs(tangentMagnitude) < Math.abs(impulseMagnitude)) {
        frictionImpulse = tangent.multiply(tangentMagnitude)
      } else {
        frictionImpulse = tangent.multiply(impulseMagnitude)
      }
    }

    polygon.applyImpulse(impulse, position)
    other.applyImpulse(impulse.negative(), position)

    polygon.applyImpulse(frictionImpulse, position)
    other.applyImpulse(frictionImpulse.negative(), position)
  }

  positionalCorrection (contacts) {
    const { polygon, other, normal, penetration } = contacts[0]
    const kSlop = 0.05 // Penetration allowance
    const percent = 0.2 // Penetration percentage to correct
    const correction = normal.multiply(
      Math.max(penetration - kSlop, 0) / (polygon.invMass + other.invMass) * percent
    )

    if (polygon.invMass !== 0) polygon.move(correction.multiply(-polygon.invMass))
    if (other.invMass !== 0) other.move(correction.multiply(other.invMass))
  }

  checkCollisions () {
    const contacts = []
    for (let i = 0; i < this.shapeCount; i++) {
      const polygon = this.shapes[i]
      for (let j = i + 1; j < this.shapeCount; j++) {
        const other = this.shapes[j]
        const contact = this.polyPoly.collide(polygon, other)
        if (contact) contacts.push(contact)
      }
    }

    contacts.forEach((contact) => {
      for (let i = 0; i < 10; i++) {
        if (this.resolveContacts(contact)) break
      }

      this.positionalCorrection(contact)
    })
  }

  lineIntersection ({ x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 }, { x: x4, y: y4 }) {
    const det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if (!det) return null

    const point = {}
    const tolerance = 0.000001
    point.x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / det
    if (
      point.x + tolerance < Math.min(x1, x2) ||
      point.x - tolerance > Math.max(x1, x2) ||
      (point.x + tolerance < Math.min(x3, x4) || point.x - tolerance > Math.max(x3, x4))
    ) {
      return null
    }

    point.y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / det
    if (
      point.y + tolerance < Math.min(y1, y2) ||
      point.y - tolerance > Math.max(y1, y2) ||
      point.y + tolerance < Math.min(y3, y4) ||
      point.y - tolerance > Math.max(y3, y4)
    ) {
      return null
    }
    return point
  }

  polygonCollision (polygon1, polygon2) {
    // TODO: bir nokta bulunca onu baz alsın dene
    const vertices1 = polygon1.vertices
    const vertices2 = polygon2.vertices
    const list = []
    this.colls[0].change({ center: { x: -50 } })
    for (let i = 0; i < vertices1.length; i++) {
      const p1 = vertices1[i]
      const p2 = vertices1[i + 1] || vertices1[0]
      for (let j = 0; j < vertices2.length; j++) {
        const p3 = vertices2[j]
        const p4 = vertices2[j + 1] || vertices2[0]
        const s = this.lineIntersection(p1, p2, p3, p4)
        if (s) {
          list.push(s)
        }
      }
    }
    if (!list.length) {
      return false
    }
    const avX = list.reduce((acc, val) => acc + val.x, 0) / list.length
    const avY = list.reduce((acc, val) => acc + val.y, 0) / list.length
    polygon1.v.y *= -1
    polygon2.v.y *= -1
    return { x: avX, y: avY }
  }

  isCollision (shape1, shape2) {
    const types = {}
    types[shape1.constructor.name] = [shape1]
    types[shape2.constructor.name] = types[shape2.constructor.name] ? [shape1, shape2] : [shape2]
    if (!types.Circle) return this.polygonCollision(shape1, shape2)
    else return this.rectCircleCollision(...types.Rectangle, ...types.Circle)
  }

  rectCircleCollision (rectangle, circle) {
    const { x, y, w, h } = rectangle
    const { x: cx, y: cy, r } = circle

    let testX = cx
    let testY = cy

    if (cx < x) testX = x
    else if (cx > x + w) testX = x + w
    if (cy < y) testY = y
    else if (cy > y + h) testY = y + h
    return (cx - testX) ** 2 + (cy - testY) ** 2 <= r ** 2
  }
}
