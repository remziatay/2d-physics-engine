export default class Utils {
  static radToDeg (radians) {
    return radians * (180 / Math.PI)
  }

  static degToRad (degrees) {
    return degrees * (Math.PI / 180)
  }

  static drawVector (cx, vector, position) {
    // TODO remove this, debug purpose
    cx.globalCompositeOperation = 'source-over'
    cx.beginPath()
    cx.lineWidth = 2
    cx.strokeStyle = '#' + Math.floor(Math.random() * 16777215).toString(16)
    cx.moveTo(position.x, position.y)
    cx.lineTo(position.x + vector.x, position.y + vector.y)
    cx.stroke()
    cx.globalCompositeOperation = 'destination-over'
  }
}
