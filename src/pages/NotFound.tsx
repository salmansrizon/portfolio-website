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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div
        className={`text-center max-w-2xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-8xl md:text-9xl font-black text-primary/30 -z-10 blur-sm">404</div>
        </div>

        {/* Error message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Oops! Page not found</h2>
          <p className="text-lg text-muted-foreground mb-2">The page you're looking for doesn't exist or has been moved.</p>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200 inline-block">
            <p className="text-sm text-muted-foreground font-mono">
              Requested path: <span className="text-danger font-semibold">{location.pathname}</span>
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
            className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Return to Home
          </a>

          <button
            onClick={handleGoBack}
            className="group inline-flex items-center gap-2 bg-card hover:bg-muted text-foreground px-6 py-3 rounded-lg font-semibold border border-border transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <button
            onClick={handleRefresh}
            className="group inline-flex items-center gap-2 bg-muted hover:bg-muted/70 text-foreground px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>

        {/* Additional help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-muted-foreground mb-4">Need help? Here are some suggestions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-foreground mb-2">Check the URL</h3>
              <p className="text-muted-foreground">Make sure the web address is correct</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-foreground mb-2">Try Again Later</h3>
              <p className="text-muted-foreground">The page might be temporarily unavailable</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-foreground mb-2">Contact Support</h3>
              <p className="text-muted-foreground">If the problem persists, let us know</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements for visual interest */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-primary/70 rounded-full animate-ping"></div>
      </div>
    </div>
  )
}

export default NotFound
