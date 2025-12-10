import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="max-w-4xl mx-auto px-8 py-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <img src="/uxray.png" alt="UXRay Logo" className="h-16 w-auto object-contain" />
          <h1 className="text-5xl font-bold">UXRay UI</h1>
        </div>
        <div className="bg-gray-800 rounded-lg p-8">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="px-5 py-3 rounded-lg border border-transparent bg-gray-700 text-white font-medium cursor-pointer transition-colors hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            count is {count}
          </button>
          <p className="mt-4 text-gray-300">
            Edit <code className="bg-gray-700 px-2 py-1 rounded text-sm">src/App.jsx</code> and save to test HMR
          </p>
        </div>
      </header>
    </div>
  )
}

export default App

