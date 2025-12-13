import Navbar from './components/Navbar'
import URLInput from './components/URLInput'

function App() {
  return (
    <div className="w-full min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16 sm:h-20 md:h-24 lg:h-32"></div>

      {/* Main Content */}
      <main className="w-full flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <section className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Welcome to UXRay UI</h2>
            <p className="text-xl text-gray-400 mb-8">Your modern UI experience</p>
          </section>

          {/* URL Input Component */}
          <URLInput/>
          
        </div>
      </main>
    </div>
  )
}

export default App

