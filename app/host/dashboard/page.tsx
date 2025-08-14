'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Music, Plus, LogOut, Calendar, Star, TrendingUp, Settings, BarChart3 } from 'lucide-react'
import { generateEventId, formatDate } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  created_at: string
  is_active: boolean
}

interface Song {
  id: string
  title: string
  artist: string
  votes: number
  is_approved: boolean
  submitted_by: string | null
}

export default function HostDashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showAddSong, setShowAddSong] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [newEvent, setNewEvent] = useState({ title: '', description: '', event_date: '' })
  const [newSong, setNewSong] = useState({ title: '', artist: '' })
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    if (!supabase) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/host/login')
    }
  }, [router])

  const fetchEvents = useCallback(async () => {
    if (!supabase) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setEvents(data)
      if (data.length > 0) {
        setSelectedEvent(data[0])
        fetchSongs(data[0].id)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
    fetchEvents()
  }, [checkAuth, fetchEvents])

  const fetchSongs = async (eventId: string) => {
    if (!supabase) return
    
    const { data } = await supabase
      .from('songs')
      .select('*')
      .eq('event_id', eventId)
      .order('votes', { ascending: false })

    if (data) {
      setSongs(data)
    }
  }

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const eventId = generateEventId()
    const { error } = await supabase
      .from('events')
      .insert({
        id: eventId,
        title: newEvent.title,
        description: newEvent.description || null,
        event_date: newEvent.event_date,
        host_id: user.id,
        is_active: true
      })

    if (!error) {
      setNewEvent({ title: '', description: '', event_date: '' })
      setShowCreateEvent(false)
      fetchEvents()
    }
  }

  const addSong = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !selectedEvent) return

    const { error } = await supabase
      .from('songs')
      .insert({
        event_id: selectedEvent.id,
        title: newSong.title,
        artist: newSong.artist,
        votes: 0,
        is_approved: true,
        submitted_by: null
      })

    if (!error) {
      setNewSong({ title: '', artist: '' })
      setShowAddSong(false)
      fetchSongs(selectedEvent.id)
    }
  }

  const approveSong = async (songId: string) => {
    if (!supabase) return
    
    const { error } = await supabase
      .from('songs')
      .update({ is_approved: true })
      .eq('id', songId)

    if (!error && selectedEvent) {
      fetchSongs(selectedEvent.id)
    }
  }

  const deleteSong = async (songId: string) => {
    if (!supabase) return
    
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)

    if (!error && selectedEvent) {
      fetchSongs(selectedEvent.id)
    }
  }

  const resetVotes = async () => {
    if (!supabase || !selectedEvent) return

    const { error } = await supabase
      .from('songs')
      .update({ votes: 0 })
      .eq('event_id', selectedEvent.id)

    if (!error) {
      fetchSongs(selectedEvent.id)
    }
  }

  const signOut = async () => {
    if (!supabase) return
    
    await supabase.auth.signOut()
    router.push('/')
  }

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
          <p className="text-gray-300 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const totalVotes = songs.reduce((sum, song) => sum + song.votes, 0)
  const approvedSongs = songs.filter(s => s.is_approved)
  const pendingSongs = songs.filter(s => !s.is_approved)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.div 
        className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Music className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Host Dashboard</h1>
            </motion.div>
            <Button onClick={signOut} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'events', label: 'Events', icon: Calendar },
                    { id: 'songs', label: 'Songs', icon: Music },
                    { id: 'settings', label: 'Settings', icon: Settings }
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id 
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30' 
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Events</span>
                    <span className="text-white font-semibold">{events.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Songs</span>
                    <span className="text-white font-semibold">{songs.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Votes</span>
                    <span className="text-white font-semibold">{totalVotes}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="border-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
                            <Calendar className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <p className="text-gray-300 text-sm">Active Events</p>
                            <p className="text-white text-2xl font-bold">{events.filter(e => e.is_active).length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="border-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg">
                            <Music className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <p className="text-gray-300 text-sm">Approved Songs</p>
                            <p className="text-white text-2xl font-bold">{approvedSongs.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="border-0 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-lg">
                            <TrendingUp className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <p className="text-gray-300 text-sm">Pending Songs</p>
                            <p className="text-white text-2xl font-bold">{pendingSongs.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Recent Activity */}
                <Card className="border-0 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {events.slice(0, 3).map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{event.title}</h4>
                              <p className="text-gray-400 text-sm">{formatDate(new Date(event.created_at))}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => setSelectedEvent(event)}
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            View
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Your Events</h2>
                  <Button 
                    onClick={() => setShowCreateEvent(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                  </Button>
                </div>

                <div className="grid gap-6">
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <Card className={`border-0 backdrop-blur-xl border transition-all duration-300 ${
                        selectedEvent?.id === event.id
                          ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-purple-500/50 shadow-2xl'
                          : 'bg-black/20 border-white/10 hover:bg-white/5'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                                <Calendar className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-white font-semibold text-lg">{event.title}</h3>
                                <p className="text-gray-400">{event.description}</p>
                                <div className="flex items-center text-sm text-gray-500 mt-2">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {formatDate(new Date(event.event_date))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400 mb-2">Status</div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                event.is_active 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {event.is_active ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'songs' && selectedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Playlist: {selectedEvent.title}</h2>
                    <p className="text-gray-400">{approvedSongs.length} songs • {totalVotes} total votes</p>
                  </div>
                  <div className="space-x-3">
                    <Button 
                      onClick={() => setShowAddSong(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Song
                    </Button>
                    <Button 
                      onClick={resetVotes}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Reset Votes
                    </Button>
                  </div>
                </div>

                {/* Approved Songs */}
                <Card className="border-0 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Approved Songs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {approvedSongs.map((song, index) => (
                        <motion.div
                          key={song.id}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                              index === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                              'bg-gradient-to-r from-purple-500 to-blue-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{song.title}</h4>
                              <p className="text-gray-400 text-sm">{song.artist}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-lg font-semibold text-yellow-400">
                              <Star className="h-5 w-5 mr-2 fill-current" />
                              {song.votes}
                            </div>
                            <Button
                              onClick={() => deleteSong(song.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                            >
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Songs */}
                {pendingSongs.length > 0 && (
                  <Card className="border-0 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-white text-xl">Pending Approval</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pendingSongs.map((song, index) => (
                          <motion.div
                            key={song.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div>
                              <h4 className="text-white font-medium">{song.title}</h4>
                              <p className="text-gray-400 text-sm">{song.artist}</p>
                              <p className="text-gray-500 text-xs">Submitted by: {song.submitted_by || 'Guest'}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => approveSong(song.id)}
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => deleteSong(song.id)}
                                variant="outline"
                                size="sm"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                              >
                                Reject
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Card className="w-full max-w-md border-0 bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Create New Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createEvent} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Event Title</label>
                      <Input
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Wedding Reception"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
                      <Input
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Celebrate with us!"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Event Date & Time</label>
                      <Input
                        type="datetime-local"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Create Event
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCreateEvent(false)}
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Song Modal */}
      <AnimatePresence>
        {showAddSong && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Card className="w-full max-w-md border-0 bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Add Song to Playlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={addSong} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Song Title</label>
                      <Input
                        value={newSong.title}
                        onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                        placeholder="Bohemian Rhapsody"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Artist</label>
                      <Input
                        value={newSong.artist}
                        onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                        placeholder="Queen"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                        Add Song
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddSong(false)}
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
