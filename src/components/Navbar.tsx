import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/#about" },
    { name: "Services", href: "/#services" },
    { name: "Courses", href: "/#courses" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/#contact" },
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
              Salman Sakib
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => {
                // Handle hash links differently
                if (item.href.startsWith("/#")) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        // If not on home page, navigate to home first
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
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" asChild>
              <button
                onClick={() => {
                  if (location.pathname !== "/") {
                    window.location.href = "/#contact"
                  } else {
                    handleHashLink("/#contact")
                  }
                }}
              >
                Hire Me
              </button>
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
            {navItems.map((item) => {
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
              <Button
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                onClick={() => {
                  setIsOpen(false)
                  if (location.pathname !== "/") {
                    window.location.href = "/#contact"
                  } else {
                    handleHashLink("/#contact")
                  }
                }}
              >
                Hire Me
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
