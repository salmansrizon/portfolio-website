import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { name: "Career Prep", href: "/career-prep", highlight: true },
    { name: "Roadmaps", href: "/roadmaps" },
    { name: "Services", href: "/#services" },
    { name: "All Courses", href: "/courses" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
  ]

  // Helper function to handle hash links
  const handleHashLink = (href: string) => {
    if (href.startsWith("/#")) {
      const element = document.getElementById(href.substring(2))
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  // Check if current path matches nav item
  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/"
    }
    return location.pathname === href
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-panel/80 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3 md:gap-0">
            <Link to="/" className="font-display text-xl sm:text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
              Salman Sakib
            </Link>
            
            {/* Mobile Quick Action - Career Prep */}
            <Link 
              to="/career-prep" 
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 rounded-full border border-primary/20 transition-all hover:bg-primary/20 active:scale-95"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Career Prep</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item: any) => {
                // Highlight button
                if (item.highlight) {
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-primary border-b-2 border-primary"
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      {item.name}
                    </Link>
                  )
                }

                // Handle hash links differently
                if (item.href.startsWith("/#")) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (location.pathname !== "/") {
                          window.location.href = item.href
                        } else {
                          handleHashLink(item.href)
                        }
                      }}
                      className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                    >
                      {item.name}
                    </button>
                  )
                }

                // Regular route links
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-primary border-b-2 border-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground animate-pulse [animation-duration:3s] hover:animate-none font-semibold rounded-xl shadow-pop transition-all duration-500" asChild>
              <Link to="/book-session">
                Book Session
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/80 backdrop-blur-xl border-b border-primary/10">
            {navItems.map((item: any) => {
              // Highlight button for mobile
              if (item.highlight) {
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center gap-2 px-3 py-2 text-base font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    {item.name}
                  </Link>
                )
              }

              // Handle hash links for mobile
              if (item.href.startsWith("/#")) {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setIsOpen(false)
                      if (location.pathname !== "/") {
                        window.location.href = item.href
                      } else {
                        handleHashLink(item.href)
                      }
                    }}
                    className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                  >
                    {item.name}
                  </button>
                )
              }

              // Regular route links for mobile
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActive(item.href) ? "text-primary bg-primary/10" : "text-foreground hover:text-primary"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              )
            })}
            <div className="pt-2 space-y-2">
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
              <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold" asChild>
                <Link to="/book-session" onClick={() => setIsOpen(false)}>
                  Book Session
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
