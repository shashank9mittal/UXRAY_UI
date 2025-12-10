function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16 relative">
          <div className="flex items-center gap-3">
            <img src="/uxray.png" alt="UXRay Logo" className="h-10 w-auto object-contain" />
            <h1 className="text-xl font-bold text-white">UXRay UI</h1>
          </div>
          <div className="hidden md:flex items-center gap-6 absolute right-0">
            <a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a>
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

