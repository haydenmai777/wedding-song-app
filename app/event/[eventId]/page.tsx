'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Music, Star, Plus, Heart, TrendingUp, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  is_active: boolean
}

interface Song {
  id: string
  title: string
  artist: string
  votes: number
  is_approved: boolean
}

export default function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [newSong, setNewSong] = useState({ title: '', artist: '', submittedBy: '' })
  const [votedSongs, setVotedSongs] = useState<Set<string>>(new Set())
  const [eventId, setEventId] = useState('')

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

  const loadVotedSongs = (id: string) => {
    const voted = localStorage.getItem(`voted_${id}`)
    if (voted) {
      setVotedSongs(new Set(JSON.parse(voted)))
    }
  }

  const saveVotedSongs = (songIds: Set<string>) => {
    localStorage.setItem(`voted_${eventId}`, JSON.stringify(Array.from(songIds)))
  }

  const voteForSong = async (songId: string) => {
    if (!supabase) return
    
    if (votedSongs.has(songId)) {
      // Remove vote
      const newVotedSongs = new Set(votedSongs)
      newVotedSongs.delete(songId)
      setVotedSongs(newVotedSongs)
      saveVotedSongs(newVotedSongs)

      // Decrease vote count
      const { error } = await supabase
        .from('songs')
        .update({ votes: Math.max(0, songs.find(s => s.id === songId)?.votes || 0 - 1) })
        .eq('id', songId)

      if (!error) {
        fetchSongs(eventId)
      }
    } else {
      // Add vote
      const newVotedSongs = new Set(votedSongs)
      newVotedSongs.add(songId)
      setVotedSongs(newVotedSongs)
      saveVotedSongs(newVotedSongs)

      // Increase vote count
      const { error } = await supabase
        .from('songs')
        .update({ votes: (songs.find(s => s.id === songId)?.votes || 0) + 1 })
        .eq('id', songId)

      if (!error) {
        fetchSongs(eventId)
      }
    }
  }

  const submitSongRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase) return
    
    const { error } = await supabase
      .from('songs')
      .insert({
        event_id: eventId,
        title: newSong.title,
        artist: newSong.artist,
        votes: 0,
        is_approved: false,
        submitted_by: newSong.submittedBy || 'Guest'
      })

    if (!error) {
      setNewSong({ title: '', artist: '', submittedBy: '' })
      setShowRequestForm(false)
      // Show success message
      alert('Song request submitted! The host will review it.')
    }
  }

  // Set up real-time subscription for live updates
  useEffect(() => {
    if (!eventId || !supabase) return
    
    const channel = supabase
      .channel(`songs_${eventId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'songs',
          filter: `event_id=eq.${eventId}`
        }, 
        () => {
          fetchSongs(eventId)
        }
      )
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [eventId])

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-4">Supabase is not configured. Please check your environment variables.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-blue-600 hover:text-blue-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                {event.description && (
                  <p className="text-gray-600">{event.description}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(new Date(event.event_date))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Leaderboard */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <CardTitle className="text-2xl">Live Leaderboard</CardTitle>
                  </div>
                  <Button 
                    onClick={() => setShowRequestForm(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Request Song
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {songs.length > 0 ? (
                  <div className="space-y-3">
                    {songs.map((song, index) => (
                      <div 
                        key={song.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                          index === 0 ? 'bg-yellow-50 border-yellow-200' :
                          index === 1 ? 'bg-gray-50 border-gray-200' :
                          index === 2 ? 'bg-orange-50 border-orange-200' :
                          'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-500 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{song.title}</h3>
                            <p className="text-sm text-gray-600">{song.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center text-lg font-semibold text-gray-700">
                            <Star className="h-5 w-5 text-yellow-500 mr-2" />
                            {song.votes}
                          </div>
                          <Button
                            onClick={() => voteForSong(song.id)}
                            variant={votedSongs.has(song.id) ? "default" : "outline"}
                            className={`${
                              votedSongs.has(song.id) 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'hover:bg-red-50 hover:text-red-600'
                            }`}
                            size="sm"
                          >
                            <Heart className={`h-4 w-4 ${votedSongs.has(song.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Songs Yet</h3>
                    <p className="text-gray-600">Be the first to request a song!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Event Info & Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Event Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Music className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {songs.length} song{songs.length !== 1 ? 's' : ''} in playlist
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(new Date(event.event_date))}
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={() => setShowRequestForm(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Request New Song
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Song Request Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Request a Song</CardTitle>
              <CardDescription>
                Suggest a song for the host to add to the playlist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitSongRequest} className="space-y-4">
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
                <div>
                  <label className="text-sm font-medium">Your Name (Optional)</label>
                  <Input
                    value={newSong.submittedBy}
                    onChange={(e) => setNewSong({ ...newSong, submittedBy: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Submit Request
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowRequestForm(false)}
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
