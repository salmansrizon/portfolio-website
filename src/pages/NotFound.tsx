import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { Home, ArrowLeft, Search, RefreshCw } from "lucide-react"
import LottieAnimation from "@/components/LottieAnimation"

const NotFound = () => {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname)
    setIsVisible(true)
  }, [location.pathname])

  const handleGoBack = () => { 
    window.history.back()
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
      <div
        className={`text-center max-w-2xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-8xl md:text-9xl font-black text-blue-200 -z-10 blur-sm">404</div>
        </div>

        {/* Error message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Oops! Page not found</h2>
          <p className="text-lg text-gray-600 mb-2">The page you're looking for doesn't exist or has been moved.</p>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200 inline-block">
            <p className="text-sm text-gray-500 font-mono">
              Requested path: <span className="text-red-500 font-semibold">{location.pathname}</span>
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <LottieAnimation
            src="https://assets5.lottiefiles.com/packages/lf20_kji3m1gf.json"
            className="w-72 h-72 drop-shadow-[0_0_32px_rgba(59,130,246,0.15)] filter hue-rotate-[220deg] saturate-150"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/"
            className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Return to Home
          </a>

          <button
            onClick={handleGoBack}
            className="group inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <button
            onClick={handleRefresh}
            className="group inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>

        {/* Additional help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Need help? Here are some suggestions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Check the URL</h3>
              <p className="text-gray-600">Make sure the web address is correct</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Try Again Later</h3>
              <p className="text-gray-600">The page might be temporarily unavailable</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Contact Support</h3>
              <p className="text-gray-600">If the problem persists, let us know</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements for visual interest */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-300 rounded-full animate-ping"></div>
      </div>
    </div>
  )
}

export default NotFound
