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
  IconSettings
} from "@tabler/icons-react"
import "./globals.css"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <IconChefHat className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Kourcier
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">Fonctionnalités</a>
              <a href="#apps" className="text-foreground/80 hover:text-primary transition-colors">Applications</a>
              <a href="#contact" className="text-foreground/80 hover:text-primary transition-colors">Contact</a>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">Administration</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <IconX className="h-6 w-6" /> : <IconMenu2 className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-foreground/80 hover:text-primary">Fonctionnalités</a>
                <a href="#apps" className="block px-3 py-2 text-foreground/80 hover:text-primary">Applications</a>
                <a href="#contact" className="block px-3 py-2 text-foreground/80 hover:text-primary">Contact</a>
                <Link href="/dashboard" className="block px-3 py-2">
                  <Button variant="outline" size="sm" className="w-full">Administration</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center max-w-5xl mx-auto">
            {/* Hero Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <IconStar className="w-4 h-4 mr-2" />
              Plateforme #1 de livraison de repas
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Révolutionnez votre
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent block mt-2">
                expérience culinaire
              </span>
            </h1>

            {/* Hero Description */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Connectez restaurants, livreurs et clients dans un écosystème unifié. 
              Gérez vos commandes, optimisez vos livraisons et développez votre business 
              avec nos applications mobiles innovantes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90">
                <IconDeviceMobile className="w-5 h-5 mr-2" />
                Télécharger l'app Client
                <IconArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold">
                <IconTruck className="w-5 h-5 mr-2" />
                App Livreur
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Restaurants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Commandes/jour</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">1500+</div>
                <div className="text-sm text-muted-foreground">Livreurs actifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">4.9</div>
                <div className="text-sm text-muted-foreground">Note moyenne</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Trois applications, une plateforme
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez comment nos applications transforment l'expérience de livraison 
              pour chaque acteur de l'écosystème.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* App Client */}
            <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <IconUsers className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Application Client</h3>
              <p className="text-muted-foreground mb-6">
                Une expérience utilisateur fluide pour découvrir, commander et suivre vos repas préférés.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Navigation intuitive et recherche avancée
                </li>
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Suivi en temps réel des commandes
                </li>
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Paiements sécurisés multiples
                </li>
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Programme de fidélité et récompenses
                </li>
              </ul>
            </div>

            {/* App Livreur */}
            <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <IconTruck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Application Livreur</h3>
              <p className="text-muted-foreground mb-6">
                Optimisez vos courses avec des outils professionnels de navigation et de gestion.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Optimisation intelligente des trajets
                </li>
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Gestion des disponibilités
                </li>
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Historique détaillé des gains
                </li>
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Support instantané 24/7
                </li>
              </ul>
            </div>

            {/* App Restaurant */}
            <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <IconChefHat className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Dashboard Restaurant</h3>
              <p className="text-muted-foreground mb-6">
                Gérez votre établissement avec des outils avancés de pilotage et d'analyse.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Gestion complète du menu
                </li>
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Statistiques et analytics avancés
                </li>
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Gestion des commandes en temps réel
                </li>
                <li className="flex items-center text-sm">
                  <IconCheck className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  Rapports financiers détaillés
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* App Downloads Section */}
      <section id="apps" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Téléchargez nos applications
              </h2>
              <p className="text-xl text-muted-foreground">
                Disponibles sur iOS et Android pour une expérience optimale sur tous vos appareils.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Client App */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mr-4">
                    <IconUsers className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Kourcier Client</h3>
                    <p className="text-sm text-muted-foreground">Commandez vos repas favoris</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button className="flex-1 bg-black hover:bg-black/90 text-white">
                    <IconBrandApple className="w-5 h-5 mr-2" />
                    App Store
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <IconBrandGooglePlay className="w-5 h-5 mr-2" />
                    Google Play
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <IconStar className="w-4 h-4 text-yellow-500 mr-1" />
                    4.8 (12.5k avis)
                  </div>
                  <div>Gratuit</div>
                </div>
              </div>

              {/* Delivery App */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mr-4">
                    <IconTruck className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Kourcier Livreur</h3>
                    <p className="text-sm text-muted-foreground">Gagnez en livrant des repas</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button className="flex-1 bg-black hover:bg-black/90 text-white">
                    <IconBrandApple className="w-5 h-5 mr-2" />
                    App Store
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <IconBrandGooglePlay className="w-5 h-5 mr-2" />
                    Google Play
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <IconStar className="w-4 h-4 text-yellow-500 mr-1" />
                    4.7 (8.2k avis)
                  </div>
                  <div>Gratuit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Pourquoi choisir Kourcier ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Une plateforme conçue pour l'efficacité, la sécurité et la satisfaction de tous.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconClock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Livraison Rapide</h3>
              <p className="text-sm text-muted-foreground">Temps de livraison moyen de 25 minutes</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconShield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Sécurisé</h3>
              <p className="text-sm text-muted-foreground">Paiements cryptés et données protégées</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconHeart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Service Client</h3>
              <p className="text-sm text-muted-foreground">Support 24/7 pour tous vos besoins</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <IconSettings className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Personnalisable</h3>
              <p className="text-sm text-muted-foreground">Adaptez l'app selon vos préférences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Contactez-nous
              </h2>
              <p className="text-xl text-muted-foreground">
                Une question ? Un projet ? Notre équipe est là pour vous accompagner.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IconPhone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Téléphone</h3>
                <p className="text-muted-foreground">+33 1 23 45 67 89</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IconMail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground">contact@kourcier.com</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IconMapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Adresse</h3>
                <p className="text-muted-foreground">123 Avenue des Champs-Élysées<br />75008 Paris, France</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <IconChefHat className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Kourcier</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                La plateforme de livraison nouvelle génération qui connecte restaurants, 
                livreurs et clients dans un écosystème intelligent.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Applications</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">App Client iOS</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">App Client Android</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">App Livreur iOS</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">App Livreur Android</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Entreprise</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Partenaires</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Presse</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Kourcier. Tous droits réservés. Conçu avec ❤️ pour révolutionner la livraison.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}