import { ErrorMessage, Field, Form, Formik } from 'formik'
import rafSchd from 'raf-schd'
import React, { useEffect, useRef, useState } from 'react'
import { boolean, number, object } from 'yup'
import Vector from '../Math/Vector'
import Polygon from '../Shapes/Polygon'
import TargetIcon from './TargetIcon'
import styles from './Controls.module.css'

const memo = { lastArgs: {}, ret: {} }
const getMassInertia = (vCount, size = 1) => {
  if (memo.lastArgs.vCount === vCount && memo.lastArgs.size === size) return memo.ret
  memo.lastArgs = { vCount, size }
  const vertices = []
  for (let i = 0; i < vCount; i++) {
    vertices.push(
      new Vector(size * Math.cos(i * 2 * Math.PI / vCount), size * Math.sin(i * 2 * Math.PI / vCount))
    )
  }

  let [area, inertia] = [0, 0]
  for (let i = 0; i < vCount; i++) {
    const vertex1 = vertices[i]
    const vertex2 = vertices[(i + 1) % vCount]
    const cross = vertex1.cross(vertex2)

    const triArea = cross / 2
    const triInertia = triArea * (vertex1.sqrLength + vertex1.dot(vertex2) + vertex2.sqrLength)
    area += triArea
    inertia += triInertia
  }
  memo.ret = { mass: area, inertia }
  return memo.ret
}

const ErrorDiv = ({ children }) => (
  <div className='bg-red-600 px-2 py-1 text-justify text-yellow-100 border-gray-900 border rounded mb-2 col-span-full'>
    {children}
  </div>
)

const Controls = ({ world, reset }) => {
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef(null)

  useEffect(() => {
    if (!dragging) return
    let poss = {}
    const move = rafSchd(e => {
      // setPos({ x: e.pageX, y: e.pageY })
      poss = { x: e.pageX, y: e.pageY }
      dragRef.current.style.left = poss.x + 'px'
      dragRef.current.style.top = poss.y + 'px'
    })
    const drop = () => {
      dragging(poss.x, poss.y)
      move.cancel()
      dragRef.current.style.left = 0
      dragRef.current.style.top = 0
      setDragging(false)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', drop)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', drop)
    }
  }, [dragging])

  return (
    <>
    <Formik
      initialValues={{
        'v-count': 6,
        'v-size': 50,
        angle: 0,
        mass: getMassInertia(6, 50).mass,
        inertia: getMassInertia(6, 50).inertia,
        kinetic: true,
        gravity: true,
        vx: 0,
        vy: 0,
        vw: 0,
        ax: 0,
        ay: 0,
        aw: 0,
        px: 0,
        py: 0
      }}
      initialTouched={{ 'v-count': true, 'v-size': true, mass: true, inertia: true }}
      validationSchema={object({
        'v-count': number().moreThan(2).lessThan(20).integer().required().label('Vertex count'),
        'v-size': number().moreThan(0).lessThan(150).integer().required().label('Vertex size'),
        angle: number().moreThan(-361).lessThan(361).required().label('Angle'),
        mass: number().transform((v, ov) => ov === 'Infinity' ? Infinity : v).positive().required().label('Mass'),
        inertia: number().transform((v, ov) => ov === 'Infinity' ? Infinity : v).positive().required().label('Inertia'),
        kinetic: boolean().required(),
        gravity: boolean().required(),
        vx: number().default(0).transform((v, ov) => ov === '-' ? 0 : v).required().label('Velocity X'),
        vy: number().default(0).transform((v, ov) => ov === '-' ? 0 : v).required().label('Velocity Y'),
        vw: number().default(0).transform((v, ov) => ov === '-' ? 0 : v).required().label('Radial velocity'),
        ax: number().default(0).transform((v, ov) => ov === '-' ? 0 : v).required().label('Acceleration X'),
        ay: number().default(0).transform((v, ov) => ov === '-' ? 0 : v).required().label('Acceleration Y'),
        aw: number().default(0).transform((v, ov) => ov === '-' ? 0 : v).required().label('Radial acceleration'),
        px: number().required().label('Center X'),
        py: number().required().label('Center Y')
      })}
      onSubmit={(values) => {
        const { 'v-count': vCount, 'v-size': size, angle, mass, inertia, kinetic, gravity } = values
        const center = { x: values.px, y: values.py }
        const v = { x: parseFloat(values.vx) || 0, y: parseFloat(values.vy) || 0, r: parseFloat(values.vw) || 0 }
        const a = { x: parseFloat(values.ax) || 0, y: parseFloat(values.ay) || 0, r: parseFloat(values.aw) || 0 }
        const pol = new Polygon({ vCount, size, angle, mass, inertia, kinetic, gravity, center, v, a })
        world.addShapes(pol)
      }}
    >
      {formik =>
        <Form className={styles.Form}>
        <h2 className='block text-center text-xl py-1 text-green-700 font-semibold border-b-2 border-gray-400 '>Add a polygon</h2>
        <div className='grid gap-1' style={{ gridTemplateColumns: '1fr 2fr' }}>
          <label htmlFor="v-count">Vertex count:</label>
            <input id="v-count" name="v-count" type='number'
              style={{ minWidth: '40px' }}
              onBlur={formik.handleBlur}
              value={formik.values['v-count']}
              onChange={e => {
                const val = e.target.valueAsNumber
                const mi = getMassInertia(val, formik.values['v-size'])
                formik.setValues(k => ({ ...k, ...mi, 'v-count': val }), true)
              }}
            />
          <ErrorMessage name="v-count" component={ErrorDiv}/>
          <label htmlFor="v-size">Vertex size:</label>
          <input id="v-size" name="v-size" type='number'
          style={{ minWidth: '40px' }}
            onBlur={formik.handleBlur}
            value={formik.values['v-size']}
            onChange={e => {
              const val = e.target.valueAsNumber
              const mi = getMassInertia(formik.values['v-count'], val)
              formik.setValues(k => ({ ...k, ...mi, 'v-size': val }), true)
            }}/>
          <ErrorMessage name="v-size" component={ErrorDiv}/>
          <label htmlFor="angle">Initial angle:</label>
          <Field style={{ minWidth: '40px' }} id="angle" name="angle" type='number'/>
          <ErrorMessage name="angle" component={ErrorDiv}/>
          <label htmlFor="mass">Mass:</label>
          <Field style={{ minWidth: '40px' }} id="mass" name="mass"/>
          <ErrorMessage name="mass" component={ErrorDiv}/>
          <label htmlFor="inertia">Inertia:</label>
          <Field style={{ minWidth: '40px' }} id="inertia" name="inertia" />
          <ErrorMessage name="inertia" component={ErrorDiv}/>
        </div>
        <div className='grid grid-cols-2'>
          <label htmlFor="kinetic"><Field id="kinetic" name="kinetic" type="checkbox"/> Kinetic</label>
          <label htmlFor="gravity"><Field id="gravity" name="gravity" type="checkbox"/> Gravity applies</label>
        </div>
        {formik.values.kinetic &&
        <>
          <legend className={styles.Legend}>Initial Speed</legend>
          <div className='grid grid-cols-3 gap-1'>
            <label htmlFor="vx">X: </label>
            <label htmlFor="vy">Y: </label>
            <label htmlFor="vw">W: </label>
            <Field style={{ minWidth: '20px' }} id="vx" name="vx" />
            <Field style={{ minWidth: '20px' }} id="vy" name="vy" />
            <Field style={{ minWidth: '20px' }} id="vw" name="vw" />
            <ErrorMessage name="vx" component={ErrorDiv}/>
            <ErrorMessage name="vy" component={ErrorDiv}/>
            <ErrorMessage name="vw" component={ErrorDiv}/>
          </div>
          <legend className={styles.Legend}>Initial Acceleration</legend>
          <div className='grid grid-cols-3 gap-1'>
            <label htmlFor="ax">X: </label>
            <label htmlFor="ay">Y: </label>
            <label htmlFor="aw">W: </label>
            <Field style={{ minWidth: '20px' }} id="ax" name="ax" />
            <Field style={{ minWidth: '20px' }} id="ay" name="ay" />
            <Field style={{ minWidth: '20px' }} id="aw" name="aw" />
            <ErrorMessage name="ax" component={ErrorDiv}/>
            <ErrorMessage name="ay" component={ErrorDiv}/>
            <ErrorMessage name="aw" component={ErrorDiv}/>
          </div>
        </>
        }
        <legend className={styles.Legend}>Position</legend>
        <div className='grid grid-cols-3 gap-1'>
            <label htmlFor="px">X: </label>
            <label htmlFor="py">Y: </label>
            <Field style={{ minWidth: '20px' }} id="px" name="px" />
            <Field style={{ minWidth: '20px' }} id="py" name="py" />
            <ErrorMessage name="px" component={ErrorDiv}/>
            <ErrorMessage name="py" component={ErrorDiv}/>

        <button className={styles.Button + ' row-start-1 row-span-2 col-start-3 rounded-sm bg-indigo-500 hover:bg-indigo-400'} onMouseDown={() => {
          setDragging(() => (x, y) => {
            formik.setFieldValue('px', x)
            formik.setFieldValue('py', y)
          })
        }} ><TargetIcon width={35} height={35}/></button>
        </div>
        <button className={styles.Button + ' py-1 mt-2 font-semibold bg-green-500 hover:bg-green-400'} type="submit">Add</button>
        <button className={styles.Button + ' py-1 mt-2 font-semibold bg-red-500 hover:bg-red-400'} type='button' onClick={reset}>Reset</button>
      </Form>
      }
    </Formik>
    {dragging &&
      <div ref={dragRef} className='z-20 fixed transform -translate-x-1/2 -translate-y-1/2 select-none' style={{ left: -500 }}>
        <TargetIcon width={60} height={60}/>
      </div>
    }
    </>
  )
}

export default Controls
