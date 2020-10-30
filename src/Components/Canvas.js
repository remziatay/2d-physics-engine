import React, { createRef } from 'react'
import World from '../Engine/World'
import Vector from '../Math/Vector'
import Polygon from '../Shapes/Polygon'

class Canvas extends React.Component {
  canvasRef = createRef()

  componentDidMount () {
    const canvas = this.canvasRef.current
    function resizeCanvas () {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }
    window.addEventListener('resize', resizeCanvas, false)
    resizeCanvas()

    const world = new World(document.getElementById('game'), 10)
    this.props.setWorld(world)

    // for (let i = 0; i < 15; i++) {
    // world.addShapes(new Circle(700 * Math.random(), 150 * Math.random(), 65 * Math.random() + 15));
    // }

    /* let m = new Circle({ x: 325, y: 2, r: 50, ax: 1 });
      let re = new Rectangle({ x: 290, y: 400, w: 100, h: 80, kinetic: false });
      let m2 = new Circle({ x: 100, y: 30, r: 25, kinetic: false });
      let re3 = new Rectangle({ x: 100, y: 100, w: 100, h: 100, kinetic: false });
      let re4 = new Rectangle({ x: 50, y: 350, w: 100, h: 100, kinetic: false }); */
    const poly = new Polygon({
      center: { x: 380, y: 200 },
      vCount: 3,
      angle: 0,
      v: { r: 100 },
      size: 50,
      kinetic: true
    })
    const poly2 = new Polygon({
      center: new Vector(300, 250),
      vCount: 4,
      angle: 0,
      size: 80,
      kinetic: true
    })
    const poly3 = new Polygon({
      center: new Vector(520, 450),
      vCount: 7,
      v: { y: -40 },
      size: 120,
      kinetic: true,
      gravity: false
    })
    const poly4 = new Polygon({
      center: new Vector(500, 30),
      v: { y: 80 },
      // angle:20,
      vCount: 5,
      size: 80,
      kinetic: true
    })
    const tri1 = new Polygon({
      center: new Vector(195, 100),
      mass: Infinity,
      v: { r: 80 },
      vCount: 3,
      size: 80,
      kinetic: true,
      gravity: false
    })
    const tri2 = new Polygon({
      center: new Vector(800/* 300 */, 100),
      mass: Infinity,
      v: { r: 80 },
      vCount: 3,
      size: 80,
      kinetic: true,
      gravity: false
    })
    const ground = new Polygon({
      center: { x: 550, y: canvas.height + 300 },
      mass: Infinity,
      inertia: Infinity,
      vCount: 4,
      size: 500,
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
    const gon6 = new Polygon({
      center: { x: 900, y: 250 },
      angle: 180,
      v: { x: -25, y: 200, r: -100 },
      vCount: 9,
      size: 100,
      kinetic: true
      // gravity: false,
    })
    // world.engine.stop();
    // gon5.draw(cx);
    // console.table(gon5.vertices);

    world.addShapes(/* re, m2, m, re3, re4,   poly, poly2, poly3, poly4 */ tri1, tri2, ground, gon5 /* gon6 */)

    // todo: add right click menu
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      // alert("hi");
      // console.log(e)
    })

    canvas.addEventListener('mousemove', (e) => {
      poly.moveTo(new Vector(e.layerX - 10, e.layerY - 10))
      // if (e.buttons == 1) m2.updateRadius(m2.r + 1);
      // else if (e.buttons == 2) m2.updateRadius(m2.r - 1);
    })
  }

  render () {
    return (
      <canvas id='game' ref={this.canvasRef}></canvas>
    )
  }
}

export default Canvas
