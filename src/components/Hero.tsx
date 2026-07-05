"use client"

import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink, Mail } from "lucide-react"
import { Link } from "react-router-dom"
import LottieAnimation from "@/components/LottieAnimation"
import { useSectionContent } from "@/hooks/useSectionContent"

const Hero = () => {
  const { content } = useSectionContent("hero")
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/30 pt-16 overflow-hidden"
    >
      {/* Background Blur Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large blur orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-pulse delay-2000"></div>

        {/* Medium blur elements */}
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-56 h-56 bg-primary/10 rounded-full blur-xl animate-float-delayed"></div>

        {/* Small floating elements */}
        <div className="absolute top-1/5 left-1/2 w-32 h-32 bg-primary/15 rounded-full blur-lg animate-bounce-slow"></div>
        <div className="absolute bottom-1/5 right-1/2 w-24 h-24 bg-accent/12 rounded-full blur-lg animate-bounce-slow delay-500"></div>
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30 pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Content Column */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Main Heading with Moving Gradient */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-blue-500 to-blue-400 bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-move">
                  {content.title.main} {content.title.highlight}
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-primary font-semibold animate-fade-in-up delay-300">
                {content.subtitle}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground animate-fade-in-up delay-500">
                {content.name}
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-700">
              {content.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-fade-in-up delay-1000">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3 text-lg font-semibold shadow-card hover:shadow-hover transition-all hover:scale-105 group w-full sm:w-auto"
              >
                <Link to={content.cta.primary.link} className="flex items-center justify-center">
                  <div className="relative flex h-3 w-3 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/80 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                  </div>
                  {content.cta.primary.text}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg font-semibold hover:scale-105 transition-all group backdrop-blur-sm bg-transparent w-full sm:w-auto"
                onClick={() => {
                  const contactSection = document.getElementById("contact")
                  contactSection?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                <Mail className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {content.cta.secondary.text}
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
              className="w-full max-w-[800px] sm:max-w-[1000px] lg:max-w-[1200px] aspect-square drop-shadow-[0_0_48px_rgba(59,130,246,0.25)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
