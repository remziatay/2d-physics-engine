import React, { useEffect, useRef } from 'react'
import World from '../Engine/World'
import Vector from '../Math/Vector'
import Polygon from '../Shapes/Polygon'

const Canvas = ({ setWorld }) => {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    function resizeCanvas () {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }
    window.addEventListener('resize', resizeCanvas, false)
    resizeCanvas()

    const world = new World(canvas, 10)
    setWorld(world)

    const tri1 = new Polygon({
      center: new Vector(100, 100),
      mass: Infinity,
      v: { r: 80 },
      vCount: 3,
      size: 80,
      kinetic: true,
      gravity: false
    })
    const tri2 = new Polygon({
      center: new Vector(canvas.width - 100, 100),
      mass: Infinity,
      v: { r: 80 },
      vCount: 3,
      size: 80,
      kinetic: true,
      gravity: false
    })
    const groundScale = 2 / 3
    const ground = new Polygon({
      center: { x: canvas.width / 2, y: canvas.height + canvas.width / 2 * groundScale - 50 },
      mass: Infinity,
      inertia: Infinity,
      vCount: 4,
      size: Math.hypot(canvas.width, canvas.width) / 2 * groundScale,
      kinetic: false
    })
    const gon5 = new Polygon({
      center: { x: 200, y: 250 },
      angle: 180,
      v: { x: 15, y: 200 },
      vCount: 13,
      size: 80,
      kinetic: true
      // gravity: false,
    })

    world.addShapes(tri1, tri2, ground /* gon5 */)

    const prevent = e => e.preventDefault()
    canvas.addEventListener('contextmenu', prevent)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('contextmenu', prevent)
      world.engine.stop()
    }
  }, [setWorld])

  return <canvas ref={canvasRef} className='block border border-gray-500 rounded-sm w-full h-full min-w-0 bg-gray-100'></canvas>
}

export default Canvas
