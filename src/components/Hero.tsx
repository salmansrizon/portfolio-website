"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Mail } from "lucide-react"
import { Link } from "react-router-dom"
import LottieAnimation from "@/components/LottieAnimation"

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-background pt-16 overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Content Column */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Main Heading — ink with accent highlight */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
                Transforming Data into <span className="text-accent">Strategic Insights</span>
              </h1>
              <p className="text-xl sm:text-2xl text-accent font-bold animate-fade-in-up delay-300">
                Google Certified Data Analytics Professional
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground animate-fade-in-up delay-500">
                Salman Sakib
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-700">
              Google Certified Analytics Engineer with 7+ years of experience transforming complex data into actionable
              insights. Specializing in data driven business growth with data analysis and data engineering solutions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-fade-in-up delay-1000">
              <Button
                asChild
                size="lg"
                className="px-8 py-3 text-lg w-full sm:w-auto"
              >
                <Link to="/book-session" className="flex items-center justify-center">
                  Book 1-1 Session
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg group w-full sm:w-auto"
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
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-1 sm:space-y-0 sm:space-x-2 text-muted-foreground animate-fade-in-up delay-1200">
              <MapPin className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-lg">Dhaka, Bangladesh • Available for global remote projects</span>
            </div>
          </div>

          {/* Lottie Animation Column */}
          <div className="lg:col-span-5 flex justify-center items-center animate-fade-in-up delay-500">
            <LottieAnimation
              src="/animations/data-insights.json"
              className="w-full max-w-[800px] sm:max-w-[1000px] lg:max-w-[1200px] aspect-square"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
