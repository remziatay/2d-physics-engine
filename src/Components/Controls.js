import { ErrorMessage, Field, Form, Formik } from 'formik'
import React, { useCallback, useEffect, useState } from 'react'
import { boolean, number, object } from 'yup'
import Vector from '../Math/Vector'
import Polygon from '../Shapes/Polygon'

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

const ErrorDiv = ({ children }) => <div style={{
  gridColumn: '1 / 3',
  background: 'red',
  padding: '4px',
  textAlign: 'center',
  borderRadius: '10px',
  color: 'white',
  marginBottom: '.5em'
}}>{children}</div>

const Controls = ({ world }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!dragging) return
    let poss = {}
    const move = e => {
      setPos({ x: e.pageX, y: e.pageY })
      poss = { x: e.pageX, y: e.pageY }
    }
    const drop = () => {
      dragging(poss.x, poss.y)
      setPos({ x: 0, y: 0 })
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
    <Formik
      initialValues={{
        'v-count': 6,
        'v-size': 50,
        angle: 0,
        mass: getMassInertia(6, 50).mass,
        inertia: getMassInertia(6, 50).inertia,
        kinetic: true,
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
        'v-count': number().moreThan(2).lessThan(20).integer().required(),
        'v-size': number().moreThan(0).lessThan(150).integer().required(),
        angle: number().moreThan(-361).lessThan(361).required(),
        mass: number().moreThan(0).required(),
        inertia: number().moreThan(0).required(),
        kinetic: boolean().required(),
        px: number().required(),
        py: number().required()
      })}
      onSubmit={(values) => {
        const { 'v-count': vCount, 'v-size': size, angle, mass, inertia, kinetic } = values
        const center = { x: values.px, y: values.py }
        const v = { x: parseFloat(values.vx) || 0, y: parseFloat(values.vy) || 0, r: parseFloat(values.vw) || 0 }
        const a = { x: parseFloat(values.ax) || 0, y: parseFloat(values.ay) || 0, r: parseFloat(values.aw) || 0 }
        const pol = new Polygon({ vCount, size, angle, mass, inertia, kinetic, center, v, a })
        world.addShapes(pol)
      }}
    >
      {formik =>
        <Form style={{ border: '3px solid navy', marginRight: '3px', padding: '1em .5em', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '.2em' }}>
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
          <Field style={{ minWidth: '40px' }} id="mass" name="mass" type='number'/>
          <ErrorMessage name="mass" component={ErrorDiv}/>
          <label htmlFor="inertia">Inertia:</label>
          <Field style={{ minWidth: '40px' }} id="inertia" name="inertia" type='number' />
          <ErrorMessage name="inertia" component={ErrorDiv}/>
        </div>
        <label htmlFor="kinetic"><Field id="kinetic" name="kinetic" type="checkbox"/> Kinetic</label>
        {formik.values.kinetic &&
        <>
          <legend style={{ fontSize: '.8em', fontWeight: 'bold', margin: '1em 0 0 0' }}>Initial Speed</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 0, paddingTop: 0, gap: '.2em' }}>
            <label htmlFor="vx">X: </label>
            <label htmlFor="vy">Y: </label>
            <label htmlFor="vw">W: </label>
            <input style={{ minWidth: '20px' }} id="vx" name="vx" type='number' {...formik.getFieldProps('vx')} value={formik.values.vx || '0'}/>
            <input style={{ minWidth: '20px' }} id="vy" name="vy" type='number' {...formik.getFieldProps('vy')} value={formik.values.vy || '0'}/>
            <input style={{ minWidth: '20px' }} id="vw" name="vw" type='number' {...formik.getFieldProps('vw')} value={formik.values.vw || '0'}/>
          </div>
          <legend style={{ fontSize: '.8em', fontWeight: 'bold', margin: '1em 0 0 0' }}>Initial Acceleration</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 0, gap: '.2em' }}>
            <label htmlFor="ax">X: </label>
            <label htmlFor="ay">Y: </label>
            <label htmlFor="aw">W: </label>
            <input style={{ minWidth: '20px' }} id="ax" name="ax" type='number' {...formik.getFieldProps('ax')} value={formik.values.ax || '0'}/>
            <input style={{ minWidth: '20px' }} id="ay" name="ay" type='number' {...formik.getFieldProps('ay')} value={formik.values.ay || '0'}/>
            <input style={{ minWidth: '20px' }} id="aw" name="aw" type='number' {...formik.getFieldProps('aw')} value={formik.values.aw || '0'}/>
          </div>
        </>
        }
        <legend style={{ fontSize: '.8em', fontWeight: 'bold', margin: '1em 0 0 0' }}>Position</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 0, gap: '.2em' }}>
            <label htmlFor="px">X: </label>
            <label htmlFor="py">Y: </label>
            <Field style={{ minWidth: '20px' }} id="px" name="px" type='number'/>
            <Field style={{ minWidth: '20px' }} id="py" name="py" type='number'/>

        <button style={{ gridColumn: 3, gridRow: '1 / 3', fontSize: '1.5em', padding: 0 }} onMouseDown={e => {
          /*  e.buttons === 1 &&  */
          setDragging(() => (x, y) => {
            formik.setFieldValue('px', x)
            formik.setFieldValue('py', y)
          })
        }} >☺</button>
        {dragging &&
          <div style={{ fontSize: '1.5em', position: 'fixed', left: pos.x, top: pos.y, transform: 'translate3D(-50%, -50%, 0)', userSelect: 'none' }}>☺</div>
        }
        </div>
        <button type="submit">Add</button>
      </Form>
      }
    </Formik>
  )
}

export default Controls
