"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  IconChefHat, 
  IconTruck, 
  IconStar, 
  IconShield, 
  IconClock, 
  IconMapPin,
  IconPhone,
  IconMail,
  IconBrandApple,
  IconBrandGooglePlay,
  IconArrowRight,
  IconUsers,
  IconDeviceMobile,
  IconCheck,
  IconMenu2,
  IconX,
  IconHeart,
  IconCreditCard,
  IconBell,
  IconSettings,
  IconPackage,
  IconFlame,
  IconBrandAndroid,
  IconDownload,
  IconShieldCheck,
  IconZoomMoney,
  IconTrendingUp,
  IconEye,
  IconSend,
  IconPlayerPlay,
  IconAtom,
  IconPlanet,
  IconRocket
} from "@tabler/icons-react"
import "./globals.css"
import { Button } from "@/components/ui/button"
import { PhoneShowcase } from "@/components/phone-model"

export default function GitHubStyleLandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    
    // Generate stars
    const generateStars = () => {
      const starsContainer = document.getElementById('stars-container')
      if (starsContainer) {
        for (let i = 0; i < 100; i++) {
          const star = document.createElement('div')
          star.className = 'star'
          star.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            --duration: ${2 + Math.random() * 4}s;
            --delay: ${Math.random() * 2}s;
          `
          starsContainer.appendChild(star)
        }
      }
    }

    // Generate quantum particles
    const generateQuantumParticles = () => {
      const particlesContainer = document.getElementById('quantum-container')
      if (particlesContainer) {
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div')
          particle.className = 'quantum-particle'
          const x = Math.random() * 200 - 100
          const y = Math.random() * 200 - 100
          const endX = Math.random() * 400 - 200
          const endY = Math.random() * 400 - 200
          particle.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            --duration: ${8 + Math.random() * 12}s;
            --delay: ${Math.random() * 5}s;
            --x: ${x}px;
            --y: ${y}px;
            --end-x: ${endX}px;
            --end-y: ${endY}px;
          `
          particlesContainer.appendChild(particle)
        }
      }
    }

    setTimeout(generateStars, 100)
    setTimeout(generateQuantumParticles, 200)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="min-h-screen github-hero-bg github-grid text-white overflow-hidden relative">
      {/* Cosmic Background Elements */}
      <div className="stars" id="stars-container"></div>
      <div className="quantum-particles" id="quantum-container"></div>
      
      {/* Comet */}
      <div className="comet"></div>

      {/* Spiral Galaxy */}
      <div className="spiral-galaxy fixed top-10 right-10 opacity-20"></div>

      {/* Gravitational Waves */}
      <div className="gravitational-wave fixed top-1/4 left-1/4 opacity-30"></div>
      <div className="gravitational-wave fixed bottom-1/4 right-1/4 opacity-20" style={{animationDelay: '4s'}}></div>

      {/* Navigation Header - GitHub Style */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-lg border-gray-700/50 shadow-2xl' 
          : 'bg-transparent border-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo GitHub Style */}
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <IconAtom className="h-6 w-6 text-gray-900" />
                </div>
              </div>
              <div>
                <span className="text-xl font-semibold text-white">
                  Kourcier
                </span>
                <div className="text-xs text-gray-400 font-medium">Atomic Delivery</div>
              </div>
            </div>

            {/* Desktop Menu GitHub Style */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#apps" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Applications
              </a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Contact
              </a>
              <Link href="/dashboard">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 text-sm border-0">
                  Dashboard
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700 bg-gray-900/95 backdrop-blur-lg">
              <div className="px-4 py-6 space-y-4">
                <a href="#features" className="block text-gray-300 hover:text-white text-sm font-medium">Features</a>
                <a href="#apps" className="block text-gray-300 hover:text-white text-sm font-medium">Applications</a>
                <a href="#contact" className="block text-gray-300 hover:text-white text-sm font-medium">Contact</a>
                <Link href="/dashboard">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Earth Rotation Background */}
      <div className="earth-rotation"></div>

      {/* Hero Section - Split Layout with Phone Models */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background Cosmic Elements */}
        <div className="planetary-system fixed top-20 left-20 opacity-20 scale-75">
          <div className="sun"></div>
          <div className="planet-orbit planet-orbit-1">
            <div className="planet planet-1"></div>
          </div>
          <div className="planet-orbit planet-orbit-2">
            <div className="planet planet-2"></div>
          </div>
          <div className="planet-orbit planet-orbit-3">
            <div className="planet planet-3"></div>
          </div>
        </div>

        <div className="atomic-orbit fixed bottom-20 right-20 opacity-30 scale-50">
          <div className="atomic-nucleus"></div>
          <div className="electron electron-1"></div>
          <div className="electron electron-2"></div>
          <div className="electron electron-3"></div>
        </div>

        {/* <div className="black-hole fixed top-1/3 right-10 opacity-40 scale-75"></div> */}
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
            
            {/* Left Side - Text Content */}
            <div className="space-y-8 lg:pr-8">
              {/* GitHub Style Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                <IconRocket className="w-4 h-4 mr-2" />
                The future of food delivery
              </div>

              {/* Hero Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                {/* <span className="block text-white">
                  The platform where
                </span> */}
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                  food delivery meets science
                </span>
              </h1>

              {/* Hero Description */}
              <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
                Kourcier connects restaurants, delivery drivers, and customers through 
                cutting-edge technology. Experience atomic-level precision in food delivery 
                with our revolutionary mobile applications.
              </p>

              {/* Feature Highlights */}
              <div className="grid sm:grid-cols-2 gap-4 py-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mt-1">
                    <IconChefHat className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Food Delivery</h3>
                    <p className="text-gray-400 text-sm">Browse hundreds of restaurants</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mt-1">
                    <IconFlame className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Gas Delivery</h3>
                    <p className="text-gray-400 text-sm">Fast & secure gas bottles</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mt-1">
                    <IconPackage className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Package Delivery</h3>
                    <p className="text-gray-400 text-sm">Affordable citywide shipping</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center mt-1">
                    <IconEye className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Real-time Tracking</h3>
                    <p className="text-gray-400 text-sm">GPS precision monitoring</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://play.google.com/store/apps/details?id=com.novic.koursier" target="_blank" rel="noopener noreferrer">
                  <Button className="h-12 px-6 text-base font-medium bg-green-600 hover:bg-green-700 text-white border-0 rounded-md group transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                    <IconDownload className="w-5 h-5 mr-2" />
                    Get Client App
                    <IconArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.Lkoursier.app" target="_blank" rel="noopener noreferrer">
                  <Button className="h-12 px-6 text-base font-medium bg-transparent hover:bg-gray-800 text-white border border-gray-600 hover:border-gray-500 rounded-md group transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                    <IconTruck className="w-5 h-5 mr-2" />
                    Driver App
                    <IconZoomMoney className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 pt-8 border-t border-gray-800/50">
                {[
                  { value: '500+', label: 'Restaurants' },
                  { value: '10K+', label: 'Orders/day' },
                  { value: '1.5K+', label: 'Drivers' },
                  { value: '4.9', label: 'Rating' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Phone Models */}
            <div className="relative flex justify-center lg:justify-start lg:pl-4">
              <div className="relative w-full max-w-xl lg:max-w-none">
                {/* Cosmic Connection Effect */}
                <div className="cosmic-connection absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"></div>
                
                {/* Phone Showcase */}
                <PhoneShowcase 
                  clientImage="/client/Simulator Screenshot - iPhone 15 - 2025-07-29 at 10.44.37.png"
                  driverImage="/livreur/Screenshot_1754111913.png"
                  className="w-full"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Applications Section with Images */}
      <section id="apps" className="py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Two powerful applications
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the future of food delivery with our scientifically-engineered mobile apps
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Client App */}
            <div className="relative">
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <IconUsers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Kourcier Client</h3>
                    <p className="text-gray-400">For food lovers</p>
                  </div>
                </div>
                
                {/* App Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <IconChefHat className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium">Food Delivery</h4>
                      <p className="text-gray-400 text-sm">Browse hundreds of restaurants and order your favorite meals</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <IconFlame className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium">Gas Delivery</h4>
                      <p className="text-gray-400 text-sm">Order gas bottles with secure and fast delivery</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <IconPackage className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium">Package Delivery</h4>
                      <p className="text-gray-400 text-sm">Send packages securely at affordable prices citywide</p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <a href="https://play.google.com/store/apps/details?id=com.novic.koursier" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    <IconBrandGooglePlay className="w-5 h-5 mr-2" />
                    Download Client App
                  </Button>
                </a>
              </div>

              {/* Client App Screenshots */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="relative group">
                  <Image
                    src="/client/Simulator Screenshot - iPhone 15 - 2025-07-29 at 10.44.37.png"
                    alt="Client App Screenshot 1"
                    width={200}
                    height={400}
                    className="rounded-xl shadow-2xl transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="relative group">
                  <Image
                    src="/client/Simulator Screenshot - iPhone 15 - 2025-07-29 at 10.44.52.png"
                    alt="Client App Screenshot 2"
                    width={200}
                    height={400}
                    className="rounded-xl shadow-2xl transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>

            {/* Driver App */}
            <div className="relative">
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <IconTruck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Kourcier Driver</h3>
                    <p className="text-gray-400">For professional drivers</p>
                  </div>
                </div>
                
                {/* How to become a driver */}
                <div className="space-y-4 mb-8">
                  <h4 className="text-white font-medium mb-4 flex items-center">
                    <IconPlayerPlay className="w-5 h-5 mr-2 text-green-400" />
                    How to become a driver:
                  </h4>
                  
                  {[
                    "Download the Kourcier Driver app",
                    "Create your profile and verify documents", 
                    "Activate your availability",
                    "Start delivering and earn money"
                  ].map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-gray-300 text-sm">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Download Button */}
                <a href="https://play.google.com/store/apps/details?id=com.Lkoursier.app" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium">
                    <IconBrandGooglePlay className="w-5 h-5 mr-2" />
                    Download Driver App
                  </Button>
                </a>
              </div>

              {/* Driver App Screenshots */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="relative group">
                  <Image
                    src="/livreur/Screenshot_1754111913.png"
                    alt="Driver App Screenshot 1"
                    width={200}
                    height={400}
                    className="rounded-xl shadow-2xl transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="relative group">
                  <Image
                    src="/livreur/Screenshot_1754407898.png"
                    alt="Driver App Screenshot 2"
                    width={200}
                    height={400}
                    className="rounded-xl shadow-2xl transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Powered by advanced technology
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our platform combines atomic-level precision with cosmic-scale performance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: IconShieldCheck,
                title: "Quantum Security",
                description: "Bank-level encryption protects all your transactions and personal data"
              },
              {
                icon: IconEye,
                title: "Real-time Tracking", 
                description: "GPS precision tracking gives you complete visibility of your orders"
              },
              {
                icon: IconBell,
                title: "24/7 Support",
                description: "Always-on customer support ready to help whenever you need"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-700 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to join the atomic revolution?
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Contact our team to learn more about partnership opportunities
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: IconPhone, title: "Phone", info: "+237 6XX XX XX XX" },
                { icon: IconMail, title: "Email", info: "contact@kourcier.com" },
                { icon: IconMapPin, title: "Location", info: "Yaoundé, Cameroon" }
              ].map((contact, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <contact.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{contact.title}</h3>
                  <p className="text-gray-400">{contact.info}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <IconAtom className="h-5 w-5 text-gray-900" />
                </div>
                <span className="text-lg font-semibold text-white">Kourcier</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                The atomic-powered food delivery platform revolutionizing how we connect 
                restaurants, drivers, and customers.
              </p>
            </div>

            {[
              {
                title: "Applications",
                links: ["Client iOS", "Client Android", "Driver iOS", "Driver Android"]
              },
              {
                title: "Company", 
                links: ["About", "Careers", "Partners", "Press"]
              },
              {
                title: "Support",
                links: ["Help Center", "Terms", "Privacy", "Contact"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="text-sm font-semibold text-white mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Kourcier. All rights reserved. Built with atomic precision.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}