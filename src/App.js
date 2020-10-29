import React, { useState } from 'react'
import './App.css'
import Canvas from './Components/Canvas'
import Controls from './Components/Controls'

function App () {
  const [world, setWorld] = useState(null)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', height: '95vh', maxHeight: '100vh' }}>
      <Canvas world={world} setWorld={setWorld}/>
      <Controls world={world}/>
    </div>
  )
}

export default App
