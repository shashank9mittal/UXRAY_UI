import { useState } from 'react'
import Navbar from './components/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="w-full min-h-screen bg-slate-900 text-white">
      <Navbar />

      {/* Main Content with responsive top margin */}
      <main className="mt-16 sm:mt-20 md:mt-24 lg:mt-24 w-full flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Welcome to UXRay UI</h2>
            <p className="text-xl text-gray-400 mb-8">Your modern UI experience</p>
          </section>

          {/* Content Section */}
          <section className="bg-slate-800/50 rounded-lg p-8 mb-8 w-full">
            <div className="flex flex-col items-center justify-center text-center">
              <button 
                onClick={() => setCount((count) => count + 1)}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Count is {count}
              </button>
              <p className="mt-4 text-gray-300">
                Edit <code className="bg-slate-700 px-2 py-1 rounded text-sm">src/App.jsx</code> and save to test HMR
              </p>
            </div>
          </section>

          {/* Scrollable Content Section - to demonstrate sticky navbar */}
          <section className="w-full mb-12">
            <h3 className="text-2xl font-bold text-center text-white mb-8">Content Section</h3>
            <div className="flex flex-col items-center gap-8 w-full">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="bg-slate-800/50 rounded-lg p-6 w-full text-center">
                  <h4 className="text-lg font-semibold mb-2 text-white">Section {index + 1}</h4>
                  <p className="text-gray-400">
                    This is some content to demonstrate that the navbar stays fixed at the top when you scroll.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App

