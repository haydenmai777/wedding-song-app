'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Music, Users, Star, QrCode } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [eventId, setEventId] = useState('')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 p-3 rounded-full">
            <Music className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Song Request & Live Voting
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create wedding playlists and let your guests vote for their favorite songs in real-time!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Host Section */}
        <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
          <CardHeader className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-blue-900">Event Host</CardTitle>
            <CardDescription>
              Create a new playlist and manage song requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Perfect for weddings, parties, and events where you want crowd-sourced music!
            </p>
            <Link href="/host/login" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Host Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Guest Section */}
        <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
          <CardHeader className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-900">Join Event</CardTitle>
            <CardDescription>
              Enter event code or scan QR code to vote
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter Event Code"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="text-center"
              />
              <Link href={`/event/${eventId}`} className="block">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!eventId.trim()}
                >
                  Join Event
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Or scan the QR code provided by your host
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Features
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Easy Access</h3>
            <p className="text-gray-600 text-sm">
              Guests join via QR code or short link - no app download needed
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Live Voting</h3>
            <p className="text-gray-600 text-sm">
              Real-time leaderboard updates as guests vote for songs
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Music className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Song Requests</h3>
            <p className="text-gray-600 text-sm">
              Guests can suggest new songs for host approval
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
