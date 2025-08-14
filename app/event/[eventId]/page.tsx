'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Music, Heart, Plus, Star, TrendingUp, Users, Clock, Play, Pause, Volume2, Crown, Trophy, Medal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  host_id: string
}

interface Song {
  id: string
  title: string
  artist: string
  votes: number
  is_approved: boolean
  submitted_by: string | null
}

export default function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const [eventId, setEventId] = useState<string>('')
  const [event, setEvent] = useState<Event | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [showSongRequest, setShowSongRequest] = useState(false)
  const [newSong, setNewSong] = useState({ title: '', artist: '' })
  const [votedSongs, setVotedSongs] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('leaderboard')

  useEffect(() => {
    const getEventId = async () => {
      const resolvedParams = await params
      setEventId(resolvedParams.eventId)
      fetchEvent(resolvedParams.eventId)
      fetchSongs(resolvedParams.eventId)
      loadVotedSongs(resolvedParams.eventId)
    }
    getEventId()
  }, [params])

  const fetchEvent = async (id: string) => {
    if (!supabase) return
    
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setEvent(data)
    }
    setIsLoading(false)
  }

  const fetchSongs = async (id: string) => {
    if (!supabase) return
    
    const { data } = await supabase
      .from('songs')
      .select('*')
      .eq('event_id', id)
      .eq('is_approved', true)
      .order('votes', { ascending: false })

    if (data) {
      setSongs(data)
    }
  }

  const voteForSong = async (songId: string) => {
    if (!supabase || !eventId) return

    const newVotes = songs.find(s => s.id === songId)?.votes || 0
    const { error } = await supabase
      .from('songs')
      .update({ votes: newVotes + 1 })
      .eq('id', songId)

    if (!error) {
      setVotedSongs(prev => new Set([...prev, songId]))
      localStorage.setItem(`voted_${eventId}`, JSON.stringify([...votedSongs, songId]))
      fetchSongs(eventId)
    }
  }

  const submitSongRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !eventId) return

    const { error } = await supabase
      .from('songs')
      .insert({
        event_id: eventId,
        title: newSong.title,
        artist: newSong.artist,
        votes: 0,
        is_approved: false,
        submitted_by: 'Guest'
      })

    if (!error) {
      setNewSong({ title: '', artist: '' })
      setShowSongRequest(false)
    }
  }

  const loadVotedSongs = (id: string) => {
    const saved = localStorage.getItem(`voted_${id}`)
    if (saved) {
      setVotedSongs(new Set(JSON.parse(saved)))
    }
  }

  useEffect(() => {
    if (!eventId || !supabase) return
    
    const channel = supabase
      .channel(`songs_${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'songs', filter: `event_id=eq.${eventId}` }, () => {
        fetchSongs(eventId)
      })
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [eventId])

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Music className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Configuration Error</h2>
          <p className="text-gray-300 mb-4">Supabase is not configured. Please check your environment variables.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <motion.div 
            className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-300 text-lg">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Music className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
          <p className="text-gray-300 mb-4">The event you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const totalVotes = songs.reduce((sum, song) => sum + song.votes, 0)
  const topSongs = songs.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
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
        {/* Event Header */}
        <motion.div 
          className="text-center mb-12"
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
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full shadow-2xl">
              <Music className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {event.title}
          </motion.h1>
          
          {event.description && (
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {event.description}
            </motion.p>
          )}

          <motion.div 
            className="flex items-center justify-center space-x-6 text-gray-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>{new Date(event.event_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{songs.length} songs</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>{totalVotes} votes</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
            {[
              { id: 'leaderboard', label: 'Live Leaderboard', icon: TrendingUp },
              { id: 'playlist', label: 'Full Playlist', icon: Music },
              { id: 'request', label: 'Request Song', icon: Plus }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        {activeTab === 'leaderboard' && topSongs.length > 0 && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <h2 className="text-3xl font-bold text-center text-white mb-8">🏆 Top Songs</h2>
            <div className="flex justify-center items-end space-x-4 max-w-4xl mx-auto">
              {topSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  className="text-center"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 + index * 0.2 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className={`relative mb-4 ${
                    index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'
                  }`}>
                    <div className={`w-32 h-32 rounded-2xl flex items-center justify-center shadow-2xl ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                      'bg-gradient-to-br from-orange-400 to-red-500'
                    }`}>
                      {index === 0 ? <Crown className="h-16 w-16 text-white" /> :
                       index === 1 ? <Trophy className="h-16 w-16 text-white" /> :
                       <Medal className="h-16 w-16 text-white" />}
                    </div>
                    <div className={`absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-500' :
                      'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{song.title}</h3>
                  <p className="text-gray-400 mb-3">{song.artist}</p>
                  <div className="flex items-center justify-center text-yellow-400 font-bold text-xl">
                    <Star className="h-6 w-6 mr-2 fill-current" />
                    {song.votes}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'leaderboard' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <Card className="border-0 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-2xl text-center">Live Leaderboard</CardTitle>
                  <CardDescription className="text-gray-300 text-center">
                    Vote for your favorite songs and watch the rankings change in real-time!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {songs.map((song, index) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 1.8 + index * 0.1 }}
                        className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-center space-x-6">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                            index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                            'bg-gradient-to-r from-purple-500 to-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-xl">{song.title}</h3>
                            <p className="text-gray-400">{song.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-yellow-400 font-bold text-2xl">{song.votes}</div>
                            <div className="text-gray-400 text-sm">votes</div>
                          </div>
                          <Button
                            onClick={() => voteForSong(song.id)}
                            disabled={votedSongs.has(song.id)}
                            className={`${
                              votedSongs.has(song.id)
                                ? 'bg-green-600 text-white cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                            }`}
                            size="lg"
                          >
                            {votedSongs.has(song.id) ? (
                              <>
                                <Heart className="h-5 w-5 mr-2 fill-current" />
                                Voted!
                              </>
                            ) : (
                              <>
                                <Heart className="h-5 w-5 mr-2" />
                                Vote
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'playlist' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-2xl text-center">Complete Playlist</CardTitle>
                  <CardDescription className="text-gray-300 text-center">
                    All songs in the event playlist
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {songs.map((song, index) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{song.title}</h4>
                            <p className="text-gray-400 text-sm">{song.artist}</p>
                          </div>
                          <div className="flex items-center text-yellow-400">
                            <Star className="h-4 w-4 mr-1 fill-current" />
                            <span className="font-semibold">{song.votes}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'request' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Plus className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-white text-2xl">Request a Song</CardTitle>
                  <CardDescription className="text-gray-300">
                    Suggest a song for the host to add to the playlist
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitSongRequest} className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Song Title</label>
                      <Input
                        value={newSong.title}
                        onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                        placeholder="Bohemian Rhapsody"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg py-3"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Artist</label>
                      <Input
                        value={newSong.artist}
                        onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                        placeholder="Queen"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-lg py-3"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 text-lg shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Submit Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
