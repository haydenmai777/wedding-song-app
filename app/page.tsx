'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Music, Users, Star, QrCode, Sparkles, Heart, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [eventId, setEventId] = useState('')

  const [currentFeature, setCurrentFeature] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <QrCode className="h-6 w-6" />,
      title: "Instant Access",
      description: "QR codes and short links for seamless guest entry"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Live Updates",
      description: "Real-time leaderboard with instant vote tracking"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Smart Voting",
      description: "Intelligent song ranking and guest engagement"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full shadow-2xl">
                <Music className="h-12 w-12 text-white" />
              </div>
              <motion.div
                className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4 text-yellow-900" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Song Request & Live Voting
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Transform your events with real-time music democracy. Create interactive playlists, 
            let guests vote live, and watch the magic happen as the crowd chooses the soundtrack.
          </motion.p>
        </motion.div>

        {/* Main Action Cards */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {/* Host Section */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader className="text-center">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Users className="h-10 w-10 text-white" />
                </motion.div>
                <CardTitle className="text-3xl text-white mb-2">Event Host</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Create and manage your event&apos;s musical journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-300 text-center leading-relaxed">
                  Take control of your event&apos;s atmosphere with our powerful host dashboard. 
                  Manage playlists, approve requests, and monitor engagement in real-time.
                </p>
                <Link href="/host/login" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg shadow-lg transform transition-all duration-200 hover:scale-105">
                    <Zap className="h-5 w-5 mr-2" />
                    Launch Host Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Guest Section */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader className="text-center">
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Star className="h-10 w-10 text-white" />
                </motion.div>
                <CardTitle className="text-3xl text-white mb-2">Join Event</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Enter event code and start voting for your favorites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Input
                    placeholder="Enter Event Code"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="text-center bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg py-3"
                  />
                  <Link href={`/event/${eventId}`} className="block">
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 text-lg shadow-lg transform transition-all duration-200 hover:scale-105"
                      disabled={!eventId.trim()}
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Join & Vote
                    </Button>
                  </Link>
                </div>
                <p className="text-gray-300 text-center text-sm">
                  Or scan the QR code provided by your host
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <h2 className="text-4xl font-bold text-center text-white mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Why Choose Our Platform?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className={`bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-white/20 backdrop-blur-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 ${
                    currentFeature === index ? 'scale-110 bg-gradient-to-r from-purple-500/40 to-pink-500/40' : ''
                  }`}
                  animate={currentFeature === index ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-purple-400 group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                </motion.div>
                <h3 className="font-semibold text-xl mb-3 text-white group-hover:text-purple-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Create Unforgettable Events?
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of event hosts who&apos;ve transformed their gatherings with interactive music experiences.
            </p>
            <Link href="/host/login">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 text-lg shadow-lg transform transition-all duration-200 hover:scale-105">
                <Sparkles className="h-6 w-6 mr-3" />
                Get Started Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
