"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
  IconPlayerPlay
} from "@tabler/icons-react"
import "./globals.css"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
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
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-l from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Cursor Following Glow */}
      <div 
        className="fixed w-96 h-96 pointer-events-none z-0 transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)'
        }}
      ></div>

      {/* Navigation Header */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-slate-950/90 backdrop-blur-2xl border-b border-cyan-500/20 shadow-lg shadow-cyan-500/10' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/50 transition-all duration-300">
                  <IconChefHat className="h-7 w-7 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Kourcier
                </span>
                <div className="text-xs text-cyan-300/60 font-medium tracking-wider">NEXT-GEN DELIVERY</div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="relative text-white/80 hover:text-cyan-300 transition-all duration-300 group px-4 py-2">
                <span className="relative z-10">Fonctionnalités</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a href="#apps" className="relative text-white/80 hover:text-cyan-300 transition-all duration-300 group px-4 py-2">
                <span className="relative z-10">Applications</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a href="#contact" className="relative text-white/80 hover:text-cyan-300 transition-all duration-300 group px-4 py-2">
                <span className="relative z-10">Contact</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50 transition-all duration-300 border-0">
                  <IconShieldCheck className="w-4 h-4 mr-2" />
                  Administration
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <IconX className="h-6 w-6" /> : <IconMenu2 className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-cyan-500/20 bg-slate-950/95 backdrop-blur-xl rounded-b-2xl mt-2">
              <div className="px-4 pt-4 pb-6 space-y-3">
                <a href="#features" className="block px-4 py-3 text-white/80 hover:text-cyan-300 hover:bg-cyan-500/5 rounded-xl transition-all duration-300">Fonctionnalités</a>
                <a href="#apps" className="block px-4 py-3 text-white/80 hover:text-cyan-300 hover:bg-cyan-500/5 rounded-xl transition-all duration-300">Applications</a>
                <a href="#contact" className="block px-4 py-3 text-white/80 hover:text-cyan-300 hover:bg-cyan-500/5 rounded-xl transition-all duration-300">Contact</a>
                <Link href="/dashboard" className="block px-4 py-3">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold">
                    Administration
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Floating Geometric Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 right-10 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          
          {/* Animated Grid Lines */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse"></div>
            <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-purple-500/10 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute right-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-pulse" style={{animationDelay: '3s'}}></div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            {/* Hero Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-semibold mb-8 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <IconFlame className="w-5 h-5 mr-3 text-orange-400 animate-pulse" />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                PLATEFORME #1 DE LIVRAISON NOUVELLE GÉNÉRATION
              </span>
              <IconTrendingUp className="w-5 h-5 ml-3 text-green-400" />
            </div>

            {/* Hero Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black mb-8 leading-none">
              <span className="block bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                L'ÉCOSYSTÈME
              </span>
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
                DU FUTUR
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl mt-4 bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent font-bold">
                pour la livraison
              </span>
            </h1>

            {/* Hero Description */}
            <p className="text-xl sm:text-2xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              <span className="text-cyan-300 font-semibold">KOURCIER</span> connecte 
              <span className="text-blue-300 font-medium">restaurants</span>, 
              <span className="text-purple-300 font-medium">livreurs</span> et 
              <span className="text-pink-300 font-medium">clients</span> dans un écosystème intelligent.
              <br className="hidden sm:block" />
              Trois applications mobiles, une expérience unifiée, 
              <span className="text-orange-300 font-medium">des performances inégalées</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <a href="https://play.google.com/store/apps/details?id=com.novic.koursier" target="_blank" rel="noopener noreferrer">
                <Button className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/50 border-0 rounded-2xl group transition-all duration-500 hover:scale-105">
                  <IconDownload className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                  APP CLIENT - COMMANDER
                  <IconArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.Lkoursier.app" target="_blank" rel="noopener noreferrer">
                <Button className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-purple-500 via-pink-600 to-orange-600 hover:from-purple-400 hover:via-pink-500 hover:to-orange-500 text-white shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/50 border-0 rounded-2xl group transition-all duration-500 hover:scale-105">
                  <IconTruck className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                  APP LIVREUR - GAGNER
                  <IconZoomMoney className="w-6 h-6 ml-3 group-hover:rotate-12 transition-transform" />
                </Button>
              </a>
            </div>

            {/* Advanced Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">500+</div>
                <div className="text-cyan-200/80 font-medium tracking-wider uppercase text-sm">Restaurants Partenaires</div>
                <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mt-2 rounded-full"></div>
              </div>
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">10K+</div>
                <div className="text-blue-200/80 font-medium tracking-wider uppercase text-sm">Commandes Quotidiennes</div>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
              </div>
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">1.5K+</div>
                <div className="text-purple-200/80 font-medium tracking-wider uppercase text-sm">Livreurs Actifs 24/7</div>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-2 rounded-full"></div>
              </div>
              <div className="text-center group">
                <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-pink-300 to-orange-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">4.9</div>
                <div className="text-pink-200/80 font-medium tracking-wider uppercase text-sm">Satisfaction Client</div>
                <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-orange-500 mx-auto mt-2 rounded-full"></div>
              </div>
            </div>

            {/* Floating Action Indicators */}
            <div className="mt-16 flex justify-center space-x-8">
              <div className="flex items-center space-x-2 text-white/60 hover:text-cyan-300 transition-colors duration-300 cursor-pointer">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Système Opérationnel</span>
              </div>
              <div className="flex items-center space-x-2 text-white/60 hover:text-cyan-300 transition-colors duration-300 cursor-pointer">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span className="text-sm font-medium">IA Intégrée</span>
              </div>
              <div className="flex items-center space-x-2 text-white/60 hover:text-cyan-300 transition-colors duration-300 cursor-pointer">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span className="text-sm font-medium">Sécurité Max</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple placeholder for other sections */}
      <section id="features" className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">Applications en développement...</h2>
        <p className="text-white/70">Contenu détaillé bientôt disponible</p>
      </section>

      <section id="apps" className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">Téléchargements</h2>
        <p className="text-white/70">Liens vers les apps disponibles</p>
      </section>

      <section id="contact" className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">Contact</h2>
        <p className="text-white/70">Contactez-nous</p>
      </section>

    </div>
  )
}