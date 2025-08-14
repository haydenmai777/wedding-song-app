# Song Request & Live Voting Web App

A real-time web application where event hosts can create playlists and guests can vote for their favorite songs. Perfect for weddings, parties, and events!

## 🚀 Features

- **Host Dashboard**: Create events, manage playlists, approve song requests
- **Guest Voting**: Real-time voting with live leaderboard updates
- **Song Requests**: Guests can suggest new songs for host approval
- **QR Code Access**: Easy event access via QR codes or short links
- **Real-time Updates**: Live leaderboard using Supabase Realtime

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd song-request-app
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Set up Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create events table
CREATE TABLE public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create songs table
CREATE TABLE public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT FALSE,
    submitted_by TEXT
);

-- Create votes table (for tracking individual votes)
CREATE TABLE public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    voter_ip TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Users can view all events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Users can delete their own events" ON public.events
    FOR DELETE USING (auth.uid() = host_id);

-- Songs policies
CREATE POLICY "Anyone can view approved songs" ON public.songs
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Hosts can view all songs for their events" ON public.songs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = songs.event_id 
            AND events.host_id = auth.uid()
        )
    );

CREATE POLICY "Hosts can insert songs for their events" ON public.songs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = songs.event_id 
            AND events.host_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert song requests" ON public.songs
    FOR INSERT WITH CHECK (is_approved = false);

CREATE POLICY "Hosts can update songs for their events" ON public.songs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = songs.event_id 
            AND events.host_id = auth.uid()
        )
    );

CREATE POLICY "Hosts can delete songs for their events" ON public.songs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = songs.event_id 
            AND events.host_id = auth.uid()
        )
    );

-- Votes policies
CREATE POLICY "Anyone can view votes" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert votes" ON public.votes
    FOR INSERT WITH CHECK (true);

-- Enable realtime for songs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.songs;
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`

## 📱 How to Use

### For Event Hosts:

1. **Sign Up/Login**: Create an account at `/host/login`
2. **Create Event**: Add event details, date, and description
3. **Add Songs**: Manually add songs to the playlist
4. **Share Link**: Share the generated event link with guests
5. **Manage Requests**: Approve/reject guest song suggestions

### For Guests:

1. **Join Event**: Use the event link or scan QR code
2. **View Playlist**: See all approved songs
3. **Vote**: Click the heart icon to vote for favorite songs
4. **Request Songs**: Suggest new songs for the host to consider

## 🔧 Customization

- **Colors**: Modify the CSS variables in `app/globals.css`
- **Components**: Edit UI components in `components/ui/`
- **Styling**: Update Tailwind classes throughout the app

## 🐛 Troubleshooting

- **Database Connection**: Verify your Supabase credentials in `.env.local`
- **Real-time Issues**: Check that RLS policies are correctly set up
- **Build Errors**: Ensure all dependencies are installed with `npm install`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Happy Event Planning! 🎉🎵**
