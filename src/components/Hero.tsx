"use client"

import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink, Mail } from "lucide-react"
import { Link } from "react-router-dom"

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/30 pt-16 overflow-hidden"
    >
      {/* Background Blur Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large blur orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse delay-2000"></div>

        {/* Medium blur elements */}
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-56 h-56 bg-blue-300/8 rounded-full blur-xl animate-float-delayed"></div>

        {/* Small floating elements */}
        <div className="absolute top-1/5 left-1/2 w-32 h-32 bg-primary/15 rounded-full blur-lg animate-bounce-slow"></div>
        <div className="absolute bottom-1/5 right-1/2 w-24 h-24 bg-accent/12 rounded-full blur-lg animate-bounce-slow delay-500"></div>
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30 pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main Heading with Moving Gradient */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-blue-500 to-blue-400 bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-move">
                Transforming Data into Strategic Insights
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-primary font-semibold animate-fade-in-up delay-300">
              Google Certified Data Analytics Professional
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground animate-fade-in-up delay-500">
              Salman Sakib
            </h2>
          </div>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-700">
            Google Certified Analytics Engineer with 7+ years of experience transforming complex data into actionable
            insights. Specializing in data driven business growth with data analysis and data engineering solutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-1000">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3 text-lg font-semibold shadow-card hover:shadow-hover transition-all hover:scale-105 group"
            >
              <Link to="/portfolio">
                <ExternalLink className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                View Portfolio
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg font-semibold hover:scale-105 transition-all group backdrop-blur-sm bg-transparent"
              onClick={() => {
                const contactSection = document.getElementById("contact")
                contactSection?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              <Mail className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Get in Touch
            </Button>
          </div>

          {/* Location */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-muted-foreground animate-fade-in-up delay-1200">
            <MapPin className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-lg">Dhaka, Bangladesh • Available for global remote projects</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
