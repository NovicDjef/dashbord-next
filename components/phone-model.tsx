"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface PhoneModelProps {
  image: string
  alt: string
  className?: string
  delay?: number
}

export function PhoneModel({ image, alt, className, delay = 0 }: PhoneModelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      className={cn(
        "relative transform-gpu transition-all duration-1000 ease-out",
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95",
        className
      )}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Phone Frame */}
      <div className="relative group">
        {/* Phone Shadow */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 to-transparent rounded-[2.5rem] blur-2xl transform translate-y-8 scale-110 opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
        
        {/* Phone Body */}
        <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-[2.5rem] p-2 shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-500 transform group-hover:scale-105">
          {/* Screen Bezel */}
          <div className="bg-black rounded-[2rem] p-1 relative overflow-hidden">
            {/* Notch */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20 border border-gray-700"></div>
            
            {/* Screen */}
            <div className="relative rounded-[1.5rem] overflow-hidden bg-gray-900 aspect-[9/19.5]">
              {/* Loading Shimmer */}
              {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse">
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-600/50 to-transparent animate-pulse bg-[length:200%_100%] animation-delay-200"></div>
                </div>
              )}
              
              {/* App Screenshot */}
              <Image
                src={image}
                alt={alt}
                fill
                className={cn(
                  "object-cover transition-all duration-700",
                  isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                )}
                onLoad={() => setIsLoaded(true)}
                quality={90}
                sizes="(max-width: 768px) 200px, 300px"
              />
              
              {/* Screen Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none"></div>
              
              {/* Screen Reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full"></div>
        </div>

        {/* Glowing Ring */}
        <div className="absolute inset-0 rounded-[2.5rem] border border-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
      </div>
    </div>
  )
}

interface PhoneShowcaseProps {
  clientImage: string
  driverImage: string
  className?: string
}

export function PhoneShowcase({ clientImage, driverImage, className }: PhoneShowcaseProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      {/* Phone Models Container */}
      <div className="relative flex items-center justify-center space-x-4 lg:space-x-8">
        {/* Client App Phone */}
        <div className="relative">
          <PhoneModel
            image={clientImage}
            alt="Kourcier Client App"
            className="w-44 md:w-52 lg:w-60"
            delay={300}
          />
          
          {/* Client Label */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-lg px-4 py-2">
              <div className="text-sm font-semibold text-blue-300">Client App</div>
              <div className="text-xs text-gray-400">Order & Track</div>
            </div>
          </div>
          
          {/* Orbital Ring */}
          <div className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 border border-blue-500/10 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
        </div>
        
        {/* Driver App Phone */}
        <div className="relative">
          <PhoneModel
            image={driverImage}
            alt="Kourcier Driver App"
            className="w-44 md:w-52 lg:w-60"
            delay={600}
          />
          
          {/* Driver Label */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-lg px-4 py-2">
              <div className="text-sm font-semibold text-green-300">Driver App</div>
              <div className="text-xs text-gray-400">Deliver & Earn</div>
            </div>
          </div>
          
          {/* Orbital Ring */}
          <div className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 border border-green-500/10 rounded-full animate-spin" style={{animationDuration: '25s', animationDirection: 'reverse'}}></div>
        </div>
      </div>
      
      {/* Connection Line */}
      <div className="absolute top-1/2 left-1/2 w-32 lg:w-48 h-px bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 -translate-x-1/2 -translate-y-1/2 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 blur-sm"></div>
      </div>
    </div>
  )
}