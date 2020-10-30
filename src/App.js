import React, { useCallback, useEffect, useState } from 'react'
import './App.css'
import Canvas from './Components/Canvas'
import Controls from './Components/Controls'

function App () {
  const [world, setWorld] = useState(null)
  const [canvas, setCanvas] = useState(null)

  useEffect(() => {
    setCanvas([<Canvas key={Math.random()} setWorld={setWorld}/>])
  }, [])

  const reset = useCallback(() => {
    setCanvas([<Canvas key={Math.random()} setWorld={setWorld}/>])
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', height: '95vh', maxHeight: '100vh' }}>
      {canvas}
      <Controls world={world} reset={reset}/>
    </div>
  )
}

export default App
