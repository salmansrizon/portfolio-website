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
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div
        className={`text-center max-w-2xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-8xl md:text-9xl font-black text-primary animate-pulse">
            404
          </h1>
        </div>

        {/* Error message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Oops! Page not found</h2>
          <p className="text-lg text-muted-foreground mb-2">The page you're looking for doesn't exist or has been moved.</p>
          <div className="bg-card rounded-lg p-4 border border-border inline-block">
            <p className="text-sm text-muted-foreground font-mono">
              Requested path: <span className="text-destructive font-semibold">{location.pathname}</span>
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <LottieAnimation
            src="https://assets5.lottiefiles.com/packages/lf20_kji3m1gf.json"
            className="w-72 h-72"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/"
            className="group inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Return to Home
          </a>

          <button
            onClick={handleGoBack}
            className="group inline-flex items-center gap-2 bg-card hover:bg-muted text-foreground px-6 py-3 rounded-full font-semibold border border-input transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <button
            onClick={handleRefresh}
            className="group inline-flex items-center gap-2 bg-muted hover:bg-secondary text-foreground px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>

        {/* Additional help */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Need help? Here are some suggestions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-card rounded-lg p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-2">Check the URL</h3>
              <p className="text-muted-foreground">Make sure the web address is correct</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-2">Try Again Later</h3>
              <p className="text-muted-foreground">The page might be temporarily unavailable</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-2">Contact Support</h3>
              <p className="text-muted-foreground">If the problem persists, let us know</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
