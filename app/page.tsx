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
  IconRocket,
  IconQrcode,
  IconStar as IconStarFilled,
  IconArrowDown,
  IconSparkles,
  IconBolt,
  IconTarget,
  IconGift,
  IconExternalLink,
  IconMobiledata,
  IconDevices,
  IconCircleDot,
  IconPlaystationCircle,
  IconPoint,
  IconCircle,
  IconProgress,
  IconPlayerPause,
  IconRefresh,
  IconRotateClockwise2
} from "@tabler/icons-react"

// Images des applications
const clientImages = [
  "/client/Simulator Screenshot - iPhone 15 - 2025-07-29 at 10.44.37.png",
  "/client/Simulator Screenshot - iPhone 15 - 2025-07-29 at 10.44.52.png"
]

const driverImages = [
  "/livreur/Screenshot_1754111913.png", 
  "/livreur/Screenshot_1754407898.png"
]

// Composant PhoneCarousel avec animation automatique
const PhoneCarousel = ({ images, label, gradientColor, delay = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
        setIsAnimating(false)
      }, 300) // Durée de l'animation de transition
    }, 5000 + delay) // 5 secondes + délai pour désynchroniser

    return () => clearInterval(interval)
  }, [images.length, delay])

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor}/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`} />
      
      {/* Phone container */}
      <div className={`relative bg-gray-900 rounded-3xl p-3 shadow-2xl border border-gray-700 group-hover:border-${label === 'Client' ? 'green' : 'blue'}-500/50 transition-all duration-500 ${isAnimating ? 'scale-95' : 'scale-100'}`}>
        
        {/* Progress bar */}
        <div className="absolute -top-1 left-3 right-3 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${gradientColor} rounded-full transition-all duration-500 animate-pulse`}
            style={{
              width: `${((currentIndex + 1) / images.length) * 100}%`
            }}
          />
        </div>

        {/* Image avec transition */}
        <div className="relative overflow-hidden rounded-2xl">
          <Image
            src={images[currentIndex]}
            alt={`${label} App Screenshot ${currentIndex + 1}`}
            width={200}
            height={400}
            className={`rounded-2xl transition-all duration-500 ${isAnimating ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
            priority
          />
          
          {/* Overlay d'animation */}
          {isAnimating && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </div>

        {/* Indicateurs de slides */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? `bg-gradient-to-r ${gradientColor}` 
                  : 'bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Label avec animation */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <div className={`bg-gradient-to-r ${gradientColor} text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${isAnimating ? 'animate-bounce' : ''}`}>
            {label === 'Client' ? <IconUsers className="w-3 h-3" /> : <IconTruck className="w-3 h-3" />}
            <span>{label}</span>
            {isAnimating && <IconRefresh className="w-3 h-3 animate-spin" />}
          </div>
        </div>

        {/* Floating feature badge */}
        <div className="absolute -top-2 -right-2">
          <div className={`w-8 h-8 bg-gradient-to-r ${gradientColor} rounded-full flex items-center justify-center ${isAnimating ? 'animate-ping' : 'animate-pulse'}`}>
            {label === 'Client' ? <IconSparkles className="w-4 h-4 text-white" /> : <IconBolt className="w-4 h-4 text-white" />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant PhoneShowcase amélioré avec carousel
const PhoneShowcase = ({ className = "" }) => {
  const [masterIndex, setMasterIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMasterIndex((prev) => (prev + 1) % 4) // 4 combinaisons possibles
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-center items-center space-x-8 lg:space-x-12">
        {/* Phone Client */}
        <PhoneCarousel 
          images={clientImages}
          label="Client"
          gradientColor="from-green-400 to-emerald-500"
          delay={0}
        />

        {/* Phone Driver */}
        <div style={{transform: 'translateY(2rem)'}}>
          <PhoneCarousel 
            images={driverImages}
            label="Livreur"
            gradientColor="from-blue-400 to-purple-500"
            delay={2500} // Désynchronisé de 2.5 secondes
          />
        </div>
      </div>
      
      {/* Connexion animée entre les téléphones */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 opacity-60">
        <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-400 animate-pulse rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-ping" style={{animation: 'ping 2s infinite, moveAcross 4s infinite linear'}} />
        </div>
      </div>

      {/* Indicateur global de synchronisation */}
      {/* <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-gray-400 text-xs">
          <IconEye className="w-4 h-4" />
          <span>Démonstration en temps réel</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div> */}

      <style jsx>{`
        @keyframes moveAcross {
          0% { transform: translateX(-12px); }
          50% { transform: translateX(12px); }
          100% { transform: translateX(-12px); }
        }
      `}</style>
    </div>
  )
}

// Composant HowItWorksSection avec animation séquentielle
const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  
  const steps = [
    {
      id: 1,
      title: "Choisissez votre service",
      description: "Sélectionnez parmi nos restaurants partenaires, service de gaz domestique ou envoi de colis express",
      icon: IconTarget,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      details: ["500+ restaurants", "Livraison gaz 24h/24", "Colis sécurisés"]
    },
    {
      id: 2,
      title: "Passez commande",
      description: "Interface intuitive, paiement sécurisé et confirmation instantanée de votre commande",
      icon: IconBolt,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10", 
      borderColor: "border-purple-500/30",
      details: ["Paiement mobile", "Confirmation SMS", "Suivi temps réel"]
    },
    {
      id: 3,
      title: "Recevez rapidement",
      description: "Suivez votre livreur en temps réel et recevez votre commande en toute sécurité",
      icon: IconGift,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30", 
      details: ["GPS en temps réel", "Notification arrivée", "Livraison sécurisée"]
    }
  ]

  // Animation automatique des étapes toutes les 3 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  // Intersection Observer pour déclencher l'animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    )
    
    const element = document.getElementById('how-it-works')
    if (element) observer.observe(element)
    
    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" className="py-32 relative bg-gradient-to-br from-gray-900/40 to-black/20 overflow-hidden">
      {/* Background décoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* En-tête animé */}
        <div className="text-center mb-20">
          <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium mb-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <IconCircleDot className="w-4 h-4 mr-2 animate-pulse" />
            Comment ça marche ?
            <IconArrowDown className="w-4 h-4 ml-2" />
          </div>
          
          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <span className="block mb-2">Trois étapes</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              vers la perfection
            </span>
          </h2>
          
          <p className={`text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Une expérience de livraison révolutionnaire en quelques clics
          </p>
        </div>

        {/* Timeline avec étapes animées */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Ligne de connexion */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-1000 ease-out"
                style={{
                  width: `${((activeStep + 1) / steps.length) * 100}%`
                }}
              />
            </div>

            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Étape principale */}
                <div className={`relative transition-all duration-700 ${
                  activeStep === index 
                    ? 'scale-105 translate-y-0' 
                    : activeStep > index 
                      ? 'scale-100 translate-y-2 opacity-70' 
                      : 'scale-95 translate-y-4 opacity-50'
                }`}>
                  
                  {/* Badge numéro animé */}
                  <div className={`w-16 h-16 mx-auto mb-8 rounded-full border-4 flex items-center justify-center relative transition-all duration-500 ${
                    activeStep === index 
                      ? `border-transparent bg-gradient-to-r ${step.color} shadow-2xl` 
                      : activeStep > index
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-600 bg-gray-800'
                  }`}>
                    {activeStep > index ? (
                      <IconCheck className="w-8 h-8 text-white animate-bounce" />
                    ) : (
                      <span className="text-2xl font-bold text-white">{step.id}</span>
                    )}
                    
                    {/* Ring d'animation pour l'étape active */}
                    {activeStep === index && (
                      <>
                        <div className="absolute inset-0 border-4 border-transparent rounded-full animate-ping" 
                             style={{borderColor: 'rgba(59, 130, 246, 0.3)'}} />
                        <div className="absolute -inset-4 border border-blue-400/20 rounded-full animate-pulse" />
                      </>
                    )}
                  </div>

                  {/* Icône de service */}
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    activeStep === index 
                      ? `bg-gradient-to-r ${step.color} shadow-lg scale-110` 
                      : `${step.bgColor} scale-100`
                  }`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Contenu de l'étape */}
                  <div className="text-center space-y-4">
                    <h3 className={`text-2xl font-bold transition-colors duration-500 ${
                      activeStep === index ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-300 leading-relaxed max-w-sm mx-auto">
                      {step.description}
                    </p>

                    {/* Détails animés pour l'étape active */}
                    <div className={`space-y-2 transition-all duration-500 ${
                      activeStep === index 
                        ? 'opacity-100 max-h-32 translate-y-0' 
                        : 'opacity-0 max-h-0 translate-y-4 overflow-hidden'
                    }`}>
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center justify-center space-x-2 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color}`} />
                          <span className="text-gray-400">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indicateur de progression pour mobile */}
                  <div className="lg:hidden mt-6 flex justify-center">
                    <div className="flex space-x-2">
                      {steps.map((_, stepIndex) => (
                        <div
                          key={stepIndex}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            stepIndex === activeStep 
                              ? `bg-gradient-to-r ${step.color}` 
                              : stepIndex < activeStep
                                ? 'bg-green-500'
                                : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contrôles manuels */}
          <div className="flex justify-center mt-16 space-x-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  activeStep === index 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Indicateur de temps */}
          {/* <div className="text-center mt-8">
            <div className="inline-flex items-center space-x-2 text-gray-400 text-sm">
              <IconRefresh className="w-4 h-4 animate-spin" />
              <span>Animation automatique toutes les 3 secondes</span>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}

// Composant ProjectSection amélioré avec carousel
const ProjectSection = ({ 
  index, 
  title, 
  description, 
  appImages, 
  downloadUrl, 
  features, 
  appType,
  alternate = false 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageAnimating, setIsImageAnimating] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    )
    
    const element = document.getElementById(`project-${index}`)
    if (element) observer.observe(element)
    
    return () => observer.disconnect()
  }, [index])

  // Animation automatique des images
  useEffect(() => {
    const interval = setInterval(() => {
      setIsImageAnimating(true)
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % appImages.length)
        setIsImageAnimating(false)
      }, 400)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [appImages.length])

  const indexText = index < 10 ? `0${index}` : index
  const gradientColor = appType === 'client' 
    ? 'from-green-500 to-emerald-600' 
    : 'from-blue-500 to-purple-600'
  const accentColor = appType === 'client' ? 'text-green-400' : 'text-blue-400'
  const bgGradient = appType === 'client' 
    ? 'from-green-500/5 to-emerald-500/5' 
    : 'from-blue-500/5 to-purple-500/5'

  const renderDetails = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Index avec animation */}
      <div className="flex items-center space-x-4">
        <div className={`w-16 h-0.5 bg-gradient-to-r ${gradientColor} transform transition-all duration-1000 ${
          isVisible ? 'scale-x-100' : 'scale-x-0'
        } origin-left`} />
        <span className={`text-4xl font-bold ${accentColor} transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          {indexText}
        </span>
        <div className={`w-8 h-8 bg-gradient-to-r ${gradientColor} rounded-full flex items-center justify-center ${isImageAnimating ? 'animate-spin' : 'animate-pulse'}`}>
          <IconRefresh className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Title */}
      <h2 className={`text-3xl lg:text-4xl font-bold text-white leading-tight transition-all duration-700 delay-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {title}
      </h2>

      {/* Description */}
      <p className={`text-lg text-gray-400 leading-relaxed transition-all duration-700 delay-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {description}
      </p>

      {/* Features avec animations */}
      <div className={`space-y-3 transition-all duration-700 delay-400 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center space-x-3 group">
            <div className={`w-2 h-2 bg-gradient-to-r ${gradientColor} rounded-full group-hover:scale-125 transition-transform`} />
            <span className="text-gray-300 group-hover:text-white transition-colors">{feature}</span>
          </div>
        ))}
      </div>

      {/* Image carousel progress */}
      <div className={`transition-all duration-700 delay-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="flex items-center space-x-2 mb-4">
          <IconEye className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Démonstration automatique</span>
          <div className="flex space-x-1">
            {appImages.map((_, imgIndex) => (
              <div
                key={imgIndex}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  imgIndex === currentImageIndex 
                    ? `bg-gradient-to-r ${gradientColor}` 
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Buttons - Style premium */}
      <div className={`space-y-2 transition-all duration-700 delay-600 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Bouton Android Premium */}
        <div className="flex justify-start">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
            <div className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor.replace('500', '400').replace('600', '500')} rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
              <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-lg px-4 py-3 hover:border-gray-600/50 transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 bg-gradient-to-br ${gradientColor} rounded-lg flex items-center justify-center shadow-lg`}>
                    <IconBrandGooglePlay className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold text-sm">Télécharger</div>
                    <div className="text-gray-400 text-xs">Google Play</div>
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="flex text-yellow-400 text-xs">
                        {'★'.repeat(5)}
                      </div>
                      <span className="text-xs text-gray-400">4.8</span>
                    </div>
                  </div>
                  <IconArrowRight className={`w-4 h-4 ${appType === 'client' ? 'text-green-400' : 'text-blue-400'} group-hover:translate-x-1 transition-transform duration-300`} />
                </div>
              </div>
            </div>
          </a>
        </div>
        
      </div>
    </div>
  )

  const renderPreview = () => (
    <div className="relative">
      {/* Background decoration animé */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} rounded-3xl transform transition-all duration-1000 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      } ${isImageAnimating ? 'animate-pulse' : ''}`} />
      
      {/* Phone mockup avec carousel */}
      <div className={`relative z-10 flex justify-center transition-all duration-1000 delay-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}>
        <div className="relative group">
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor.replace('500', '400').replace('600', '500')}/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 ${isImageAnimating ? 'scale-110' : 'scale-100'}`} />
          
          {/* Phone container */}
          <div className={`relative bg-gray-900 rounded-3xl p-3 shadow-2xl border border-gray-700 group-hover:border-${appType === 'client' ? 'green' : 'blue'}-500/50 transition-all duration-500 ${isImageAnimating ? 'scale-95' : 'scale-100'}`}>
            
            {/* Progress bar top */}
            <div className="absolute -top-1 left-3 right-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${gradientColor} rounded-full transition-all duration-500 animate-pulse`}
                style={{
                  width: `${((currentImageIndex + 1) / appImages.length) * 100}%`
                }}
              />
            </div>

            {/* Image avec transition fluide */}
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src={appImages[currentImageIndex]}
                alt={`${title} interface ${currentImageIndex + 1}`}
                width={300}
                height={600}
                className={`rounded-2xl transition-all duration-500 ${isImageAnimating ? 'opacity-0 scale-110 blur-sm' : 'opacity-100 scale-100 blur-0'}`}
                priority
              />
              
              {/* Overlay d'animation shimmer */}
              {isImageAnimating && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              )}
            </div>

            {/* Floating features */}
            <div className="absolute -top-3 -right-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${gradientColor} rounded-full flex items-center justify-center ${isImageAnimating ? 'animate-ping' : 'animate-pulse'} shadow-lg`}>
                {appType === 'client' ? <IconUsers className="w-5 h-5 text-white" /> : <IconTruck className="w-5 h-5 text-white" />}
              </div>
            </div>

            {/* Live indicator */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-white font-medium">LIVE</span>
              </div>
            </div>

            {/* Bottom indicators */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {appImages.map((_, imgIndex) => (
                <div
                  key={imgIndex}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    imgIndex === currentImageIndex 
                      ? `bg-gradient-to-r ${gradientColor}` 
                      : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section 
      id={`project-${index}`}
      className={`py-24 relative ${alternate ? 'bg-gray-900/20' : ''}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
          alternate ? 'lg:grid-flow-col-dense' : ''
        }`}>
          {alternate ? (
            <>
              <div className="lg:col-start-2">{renderDetails()}</div>
              <div className="lg:col-start-1">{renderPreview()}</div>
            </>
          ) : (
            <>
              {renderDetails()}
              {renderPreview()}
            </>
          )}
        </div>
      </div>

      {/* CSS pour l'effet shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1s ease-in-out;
        }
      `}</style>
    </section>
  )
}

export default function KoursierEnhancedLanding() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0)
  
  const fullText = "Commandez Vos repas, gaz domestique et envoyer vos colis dans la ville, faites-vous livrer instantanément, en toute sécurité et à moindre coût."
  const services = [
    {
      title: "Restaurants",
      description: "500+ restaurants partenaires",
      icon: IconChefHat,
      color: "from-orange-400 to-red-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30"
    },
    {
      title: "Gaz domestique", 
      description: "Livraison sécurisée 24h/24",
      icon: IconFlame,
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30"
    },
    {
      title: "Colis express",
      description: "Envoi rapide en ville",
      icon: IconPackage,
      color: "from-green-400 to-emerald-500", 
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30"
    }
  ]

  // Animation de frappe
  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 60)
    
    return () => clearInterval(interval)
  }, [])

  // Rotation des services
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % services.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden relative">
      {/* Background animé amélioré */}
      <div className="fixed inset-0 z-0">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59, 130, 246) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Particules flottantes */}
        <div className="absolute inset-0">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Orbes lumineux améliorés */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/15 via-purple-500/8 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-green-500/15 via-cyan-500/8 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />
      </div>

      {/* Navigation premium */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110">
                  <IconRocket className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Koursier
                </span>
                <div className="text-xs text-gray-400 font-medium">Atomic Delivery</div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {['Applications', 'Services', 'Comment ça marche', 'Contact'].map((item, index) => (
                <a key={index} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                   className="text-gray-300 hover:text-white transition-all duration-300 text-sm font-medium relative group">
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
              <Link href="/dashboard">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-full text-sm transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2">
                  <IconDevices className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
              </Link>
            </div>

            <button 
              className="md:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
            </button>
          </div>

          {/* Menu mobile amélioré */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700 bg-gray-900/95 backdrop-blur-lg">
              <div className="px-4 py-6 space-y-4">
                {['Applications', 'Services', 'Comment ça marche', 'Contact'].map((item, index) => (
                  <a key={index} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                     className="block text-gray-300 hover:text-white text-sm font-medium py-2 px-2 rounded-md hover:bg-gray-800 transition-all duration-300"
                     onClick={() => setMobileMenuOpen(false)}>
                    {item}
                  </a>
                ))}
                <Link href="/dashboard">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-full text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 mt-4">
                    <IconDevices className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section avec phones showcase animé */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Content */}
            <div className="space-y-8">
              {/* Badge viral */}
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 text-green-400 text-sm font-medium animate-bounce">
                <IconSparkles className="w-4 h-4 mr-2" />
                🚀 +10 000 commandes par jour
                <IconTrendingUp className="w-4 h-4 ml-2" />
              </div>

              {/* Titre principal */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                <span className="block text-white mb-4">
                  Koursier révolutionne
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  vos livraisons
                </span>
              </h1>

              {/* Texte tapé */}
              <div className="text-lg text-gray-300 min-h-16 flex items-start">
                <p className="font-light leading-relaxed">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </p>
              </div>

              {/* Services grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {services.map((service, index) => (
                  <div 
                    key={index}
                    className={`relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-500 ${
                      currentServiceIndex === index 
                        ? `${service.bgColor} ${service.borderColor} scale-105 shadow-lg` 
                        : 'bg-gray-800/20 border-gray-700/50 hover:scale-102'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-r ${service.color}`}>
                      <service.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{service.title}</h3>
                    <p className="text-gray-400 text-xs">{service.description}</p>
                    
                    {currentServiceIndex === index && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                    )}
                  </div>
                ))}
              </div>

              {/* CTA Buttons - Android uniquement */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* App Client */}
                  <div className="text-center">
                    
                    <a href="https://play.google.com/store/apps/details?id=com.novic.koursier" target="_blank" rel="noopener noreferrer">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 hover:border-green-500/30 transition-all duration-300 group-hover:scale-105">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                                <IconBrandGooglePlay className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="text-white font-semibold text-sm">App Client</div>
                                <div className="text-gray-400 text-xs">Google Play Store</div>
                              </div>
                            </div>
                            <IconArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* App Livreur */}
                  <div className="text-center">
                    
                    <a href="https://play.google.com/store/apps/details?id=com.Lkoursier.app" target="_blank" rel="noopener noreferrer">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300 group-hover:scale-105">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <IconBrandGooglePlay className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="text-white font-semibold text-sm">App Livreur</div>
                                <div className="text-gray-400 text-xs">Google Play Store</div>
                              </div>
                            </div>
                            <IconArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Message informatif */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    🚀 Plus de <span className="text-green-400 font-semibold">50 000</span> téléchargements
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8 border-t border-gray-800/50">
                {[
                  { value: '500+', label: 'Restaurants', icon: IconChefHat },
                  { value: '10K+', label: 'Commandes', icon: IconPackage },
                  { value: '1.5K+', label: 'Livreurs', icon: IconTruck },
                  { value: '4.9★', label: 'Satisfaction', icon: IconStar }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Phone Showcase avec carousel automatique */}
            <div className="relative flex justify-center">
              <PhoneShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* Applications Section - ProjectSummary Style avec carousel */}
      <section id="applications" className="relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Nos applications mobiles
            </h2>
            <p className="text-xl text-gray-400">
              Découvrez toutes les fonctionnalités en action
            </p>
          </div>
        </div>

        {/* Client App Project avec carousel */}
        <ProjectSection
          index={1}
          title="Koursier Client"
          description="L'application ultime pour commander vos repas, gaz domestique et envoyer vos colis en quelques clics. Interface intuitive, paiement sécurisé et suivi en temps réel."
          appImages={clientImages}
          downloadUrl="https://play.google.com/store/apps/details?id=com.novic.koursier"
          features={[
            "500+ restaurants partenaires disponibles",
            "Livraison de gaz domestique 24h/24",
            "Service d'envoi de colis express",
            "Paiement sécurisé et suivi temps réel"
          ]}
          appType="client"
        />

        {/* Driver App Project avec carousel */}
        <ProjectSection
          index={2}
          title="Koursier Livreur"
          description="Rejoignez notre réseau de livreurs professionnels et générez des revenus flexibles. Gestion optimisée des commandes, navigation GPS intégrée et paiements instantanés."
          appImages={driverImages}
          downloadUrl="https://play.google.com/store/apps/details?id=com.Lkoursier.app"
          features={[
            "Système de commandes intelligent",
            "Navigation GPS optimisée",
            "Paiements instantanés sécurisés",
            "Support 24h/24 pour les livreurs"
          ]}
          appType="driver"
          alternate
        />
      </section>

      {/* Section Comment ça marche - Version animée */}
      <HowItWorksSection />

      {/* Section Services */}
      <section id="services" className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Nos services premium
            </h2>
            <p className="text-xl text-gray-400">
              Tout ce dont vous avez besoin, livré avec excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: IconChefHat,
                title: "Livraison de repas",
                description: "500+ restaurants partenaires à votre disposition",
                features: ["Cuisine locale et internationale", "Livraison en 30min max", "Paiement sécurisé"],
                color: "from-orange-500 to-red-500",
                bgGrad: "from-orange-500/10 to-red-500/10"
              },
              {
                icon: IconFlame,
                title: "Livraison de gaz",
                description: "Service 24h/24 pour vos besoins énergétiques",
                features: ["Bouteilles certifiées", "Livraison sécurisée", "Service d'urgence"],
                color: "from-blue-500 to-cyan-500",
                bgGrad: "from-blue-500/10 to-cyan-500/10"
              },
              {
                icon: IconPackage,
                title: "Envoi de colis",
                description: "Expédition rapide et fiable en ville",
                features: ["Tarifs compétitifs", "Suivi en temps réel", "Assurance incluse"],
                color: "from-green-500 to-emerald-500",
                bgGrad: "from-green-500/10 to-emerald-500/10"
              }
            ].map((service, index) => (
              <div key={index} className={`bg-gradient-to-br ${service.bgGrad} backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 group hover:scale-105`}>
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 mb-6">{service.description}</p>
                
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-300">
                      <IconCheck className="w-4 h-4 text-green-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section id="contact" className="py-24 relative bg-gray-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Rejoignez la révolution Koursier
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Prêt à transformer votre expérience de livraison ?
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { icon: IconPhone, title: "Téléphone", info: "+237 690 089 951", color: "text-green-400" },
                { icon: IconMail, title: "Email", info: "contact@Koursier.com", color: "text-blue-400" },
                { icon: IconMapPin, title: "Localisation", info: "Douala, Cameroun", color: "text-purple-400" }
              ].map((contact, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-700 transition-all duration-300 group-hover:scale-110">
                    <contact.icon className={`w-8 h-8 ${contact.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{contact.title}</h3>
                  <p className="text-gray-400">{contact.info}</p>
                </div>
              ))}
            </div>

            {/* CTA final amélioré */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="https://play.google.com/store/apps/details?id=com.novic.koursier" target="_blank" rel="noopener noreferrer">
                <button className="h-12 px-6 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-3">
                  <IconDownload className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Commander Maintenant</div>
                    <div className="text-xs opacity-80">App Client Koursier</div>
                  </div>
                  <IconArrowRight className="w-5 h-5" />
                </button>
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.Lkoursier.app" target="_blank" rel="noopener noreferrer">
                <button className="h-12 px-6 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-3">
                  <IconTruck className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Devenir livreur</div>
                    <div className="text-xs opacity-80">App Livreur Koursier</div>
                  </div>
                  <IconZoomMoney className="w-5 h-5" />
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <IconRocket className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Koursier</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                La plateforme de livraison nouvelle génération qui connecte restaurants, 
                livreurs et clients avec une technologie de pointe.
              </p>
            </div>

            {[
              {
                title: "Applications",
                links: ["App Client Android", "App Livreur Android"]
              },
              {
                title: "Services", 
                links: ["Livraison repas", "Livraison gaz", "Envoi colis", "Service d'urgence"]
              },
              {
                title: "Support",
                links: ["Centre d'aide", "Conditions", "Confidentialité", "Contact"]
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
            <a href="https://novic.dev" className="text-gray-400 text-sm">
              © 2025 Koursier. Tous droits réservés. 🚀
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}