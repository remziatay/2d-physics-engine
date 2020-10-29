import React from 'react'
import './App.css'
import Canvas from './Components/Canvas'
import Controls from './Components/Controls'

function App () {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', height: '80vh' }}>
      <div><Canvas/></div>
      <Controls/>
    </div>
  )
}

export default App
