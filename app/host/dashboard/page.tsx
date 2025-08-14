'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Music, Plus, LogOut, Calendar, Star } from 'lucide-react'
import { generateEventId, formatDate } from '@/lib/utils'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-4">Supabase is not configured. Please check your environment variables.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Music className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Host Dashboard</h1>
            </div>
            <Button onClick={signOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Events</CardTitle>
                  <Button 
                    onClick={() => setShowCreateEvent(true)} 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedEvent?.id === event.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedEvent(event)
                        fetchSongs(event.id)
                      }}
                    >
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(new Date(event.event_date))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Details & Songs */}
          <div className="lg:col-span-2">
            {selectedEvent ? (
              <div className="space-y-6">
                {/* Event Info */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">{selectedEvent.title}</CardTitle>
                        <CardDescription>{selectedEvent.description}</CardDescription>
                        <div className="flex items-center text-sm text-gray-600 mt-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(new Date(selectedEvent.event_date))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-2">Guest Link:</div>
                        <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                          {`${window.location.origin}/event/${selectedEvent.id}`}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Songs Management */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Playlist Songs</CardTitle>
                      <div className="space-x-2">
                        <Button 
                          onClick={() => setShowAddSong(true)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Song
                        </Button>
                        <Button 
                          onClick={resetVotes}
                          variant="outline"
                          size="sm"
                        >
                          Reset Votes
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {songs.filter(s => s.is_approved).map((song) => (
                        <div key={song.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{song.title}</h4>
                            <p className="text-sm text-gray-600">{song.artist}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              {song.votes}
                            </div>
                            <Button
                              onClick={() => deleteSong(song.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pending Songs */}
                    {songs.filter(s => !s.is_approved).length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-3">Pending Approval</h4>
                        <div className="space-y-3">
                          {songs.filter(s => !s.is_approved).map((song) => (
                            <div key={song.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div>
                                <h4 className="font-medium">{song.title}</h4>
                                <p className="text-sm text-gray-600">{song.artist}</p>
                                <p className="text-xs text-gray-500">Submitted by: {song.submitted_by || 'Guest'}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => approveSong(song.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => deleteSong(song.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Event Selected</h3>
                  <p className="text-gray-600">Select an event from the list or create a new one to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createEvent} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Event Title</label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Wedding Reception"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Input
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Celebrate with us!"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Event Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Create Event
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateEvent(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Song Modal */}
      {showAddSong && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Song to Playlist</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addSong} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Song Title</label>
                  <Input
                    value={newSong.title}
                    onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                    placeholder="Bohemian Rhapsody"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Artist</label>
                  <Input
                    value={newSong.artist}
                    onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                    placeholder="Queen"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    Add Song
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddSong(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
