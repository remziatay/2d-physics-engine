import React from 'react'

const Controls = () => {
  return (
    <div style={{ border: '3px solid navy', marginRight: '3px', padding: '.5em', display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '.2em' }}>
        <label htmlFor="v-count">Vertex count:</label>
        <input id="v-count" type='number' min="3" max="20"/>
        <label htmlFor="v-size">Vertex size:</label>
        <input id="v-size" type='number' min="5" max="100"/>
        <label htmlFor="angle">Initial angle:</label>
        <input id="angle" type='number' min="-360" max="360"/>
        <label htmlFor="mass">Mass:</label>
        <input id="mass" type='number' min="1"/>
        <label htmlFor="inertia">Inertia:</label>
        <input id="inertia" type='number' min="1" />
      </div>
      <label htmlFor="kinetic"><input id="kinetic" type="checkbox"/> Kinetic</label>
      <legend style={{ fontSize: '.8em', fontWeight: 'bold', margin: '1em 0 0 0' }}>Initial Speed</legend>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 0, paddingTop: 0, gap: '.2em' }}>
        <label htmlFor="sx">X: </label>
        <label htmlFor="sy">Y: </label>
        <label htmlFor="sw">W: </label>
        <input style={{ minWidth: '20px' }} id="sx" type='number' min="-100" max="100"/>
        <input style={{ minWidth: '20px' }} id="sy" type='number' min="-100" max="100"/>
        <input style={{ minWidth: '20px' }} id="sw" type='number' min="-360" max="360"/>
      </div>
      <legend style={{ fontSize: '.8em', fontWeight: 'bold', margin: '1em 0 0 0' }}>Initial Acceleration</legend>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 0, gap: '.2em' }}>
        <label htmlFor="ax">X: </label>
        <label htmlFor="ay">Y: </label>
        <label htmlFor="aw">W: </label>
        <input style={{ minWidth: '20px' }} id="ax" type='number' min="-100" max="100"/>
        <input style={{ minWidth: '20px' }} id="ay" type='number' min="-100" max="100"/>
        <input style={{ minWidth: '20px' }} id="aw" type='number' min="-360" max="360"/>
      </div>
      <legend style={{ fontSize: '.8em', fontWeight: 'bold', margin: '1em 0 0 0' }}>Position</legend>

      <button type="submit">Add</button>
    </div>
  )
}

export default Controls
