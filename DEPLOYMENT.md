# 🚀 Quick Deployment Guide for Your Uncle

## Step 1: Set Up Supabase (Backend Database)

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with your email
3. **Create New Project**:
   - Click "New Project"
   - Choose your organization
   - Give it a name like "Wedding Music App"
   - Set a database password (save this!)
   - Choose a region close to you
   - Click "Create new project"

4. **Wait for setup** (takes 2-3 minutes)

5. **Get your API keys**:
   - Go to Settings → API
   - Copy the "Project URL" and "anon public" key

## Step 2: Set Up Database Tables

1. In Supabase, go to **SQL Editor**
2. Copy and paste this entire SQL code:

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

3. **Click "Run"** to execute the SQL

## Step 3: Set Up Environment Variables

1. **Create a file called `.env.local`** in your project folder
2. **Add these lines** (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Test Locally

1. **Open terminal/command prompt**
2. **Navigate to your project folder**
3. **Run these commands**:

```bash
npm install
npm run dev
```

4. **Open your browser** to `http://localhost:3000`

## Step 5: Deploy to Vercel (Make it Live on Internet)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** (use GitHub if you have it)
3. **Click "New Project"**
4. **Import your GitHub repository** (or drag & drop your project folder)
5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add the same ones from `.env.local`
6. **Click "Deploy"**

Your app will be live in 2-3 minutes!

## 🎯 How to Use the App

### For You (Event Host):
1. Go to your live website
2. Click "Host Dashboard"
3. Sign up with your email
4. Create a new event (wedding, party, etc.)
5. Add some songs to get started
6. Share the guest link with your guests

### For Your Guests:
1. They click the link you shared
2. They can see all the songs
3. They vote by clicking the heart ❤️
4. They can request new songs
5. You approve/reject their requests

## 🔧 If Something Goes Wrong

- **Database errors**: Check your Supabase SQL was run correctly
- **Can't connect**: Verify your environment variables are correct
- **Build fails**: Make sure you ran `npm install`
- **Real-time not working**: Check that the SQL policies were created

## 📱 QR Code Feature

The app automatically generates guest links. You can:
1. Print the link on cards
2. Use a QR code generator (like qr-code-generator.com)
3. Share via text/email

## 🎉 You're All Set!

Your song request app is now ready for your event! Guests can vote in real-time, and you'll see the most popular songs rise to the top.

**Need help?** Check the main README.md file for more detailed instructions.
