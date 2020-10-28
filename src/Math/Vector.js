export default class Vector {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  static get ZERO () {
    return new Vector(0, 0)
  }

  static get ONE () {
    return new Vector(1, 1)
  }

  copy () {
    return new Vector(this.x, this.y)
  }

  equals (other) {
    if (!other) return false
    return this.x === other.x && this.y === other.y
  }

  add (other, inplace = false) {
    if (!other) return inplace ? this : this.copy()
    if (inplace) {
      this.x += other.x
      this.y += other.y
      return this
    }
    return new Vector(this.x + other.x, this.y + other.y)
  }

  sub (other, inplace = false) {
    if (!other) return inplace ? this : this.copy()
    if (inplace) {
      this.x -= other.x
      this.y -= other.y
      return this
    }
    return new Vector(this.x - other.x, this.y - other.y)
  }

  multiply (num, inplace = false) {
    if (!num && num !== 0) return inplace ? this : this.copy()
    if (inplace) {
      this.x *= num
      this.y *= num
      return this
    }
    return new Vector(this.x * num, this.y * num)
  }

  div (num, inplace = false) {
    if (!num && num !== 0) return inplace ? this : this.copy()
    if (inplace) {
      this.x /= num
      this.y /= num
      return this
    }
    return new Vector(this.x / num, this.y / num)
  }

  get length () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  get sqrLength () {
    // Use as much as possible for better performance
    return this.x * this.x + this.y * this.y
  }

  normalize (inplace = false) {
    const sqrLen = this.x * this.x + this.y * this.y
    if (!sqrLen) return inplace ? this : new Vector(0, 0)
    return this.div(Math.sqrt(sqrLen), inplace)
  }

  dot (other) {
    if (!other) return false
    return this.x * other.x + this.y * other.y
  }

  cross (val, inverse = false) {
    if (typeof val === 'number') { return inverse ? new Vector(-val * this.y, val * this.x) : new Vector(val * this.y, -val * this.x) }
    if (!val) return false
    return this.x * val.y - this.y * val.x
  }

  negative (inplace = false) {
    if (inplace) {
      this.x = -this.x
      this.y = -this.y
      return this
    }
    return new Vector(-this.x, -this.y)
  }

  flip (inplace = false) {
    if (inplace) {
      this.x = this.y
      this.y = this.x
      return this
    }
    return new Vector(this.y, this.y)
  }

  rotate (radian, point = { x: 0, y: 0 }, inplace = false) {
    if (!radian) return inplace ? this : this.copy()
    const cos = Math.cos(radian)
    const sin = Math.sin(radian)
    const newX = point.x + cos * (this.x - point.x) - sin * (this.y - point.y)
    const newY = point.y + sin * (this.x - point.x) + cos * (this.y - point.y)
    if (inplace) {
      this.x = newX
      this.y = newY
      return this
    }
    return new Vector(newX, newY)
  }

  static rotate (vectors = [], radian, point = { x: 0, y: 0 }) {
    if (!vectors || !vectors.length || !radian) return
    const cos = Math.cos(radian)
    const sin = Math.sin(radian)
    vectors.forEach((vector) => {
      const newX = point.x + cos * (vector.x - point.x) - sin * (vector.y - point.y)
      const newY = point.y + sin * (vector.x - point.x) + cos * (vector.y - point.y)
      vector.x = newX
      vector.y = newY
    })
  }
}
