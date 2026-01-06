# 🎓 Grade 11 C Programming Summative Exam System

A modern, secure, and cheat-proof online examination system built with Next.js and Supabase for your Grade 11 Computer Programming 2 students.

## ✨ Features

### Security & Anti-Cheating
- 🔐 **Google OAuth Authentication** - Students must sign in with their Gmail
- 🚫 **Tab Switch Detection** - Detects when students leave the exam tab
- 📱 **Visibility API** - Monitors if the browser window loses focus
- 🖱️ **Right-Click Disabled** - Prevents context menu access
- ⌨️ **Keyboard Shortcuts Blocked** - Ctrl+C, Ctrl+V, F12, etc.
- 📋 **Copy Prevention** - CSS user-select disabled on all content
- 📸 **Screenshot Warning** - Print screen detection (limited browser support)
- ⏱️ **Time Limits** - Configurable exam duration with auto-submit
- 🔄 **Connection Tolerance** - Graceful handling of slow/unstable internet
- 📊 **Activity Logging** - All suspicious activities are recorded

### For Teachers
- 📋 **Dashboard** - View all student submissions
- ✅ **Auto-Grading** - Automatic scoring for multiple choice & identification
- 📈 **Score Analytics** - View individual and class performance
- 🔒 **Answer Protection** - Students can't see correct answers after submission
- 👥 **Student Management** - Approve/restrict student access

### For Students
- 🎯 **Clean Interface** - Distraction-free exam environment
- 💾 **Auto-Save** - Answers saved every 30 seconds
- ⏰ **Timer Display** - Shows remaining time
- 📊 **Instant Scoring** - See score immediately (without correct answers)
- 📱 **Responsive** - Works on desktop and tablets

## 🚀 Quick Setup Guide

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and fill in:
   - **Name**: `grade11-exam`
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to Philippines (Singapore)
3. Wait for project to initialize (~2 minutes)

### Step 2: Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase/schema.sql` and run it
3. This creates all necessary tables and security policies

### Step 3: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add Authorized redirect URIs:
   - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)
7. Copy the **Client ID** and **Client Secret**

8. In Supabase dashboard:
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Paste your Client ID and Client Secret

### Step 4: Deploy to Vercel

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Deploy!

### Step 5: Add Yourself as Admin

1. Sign in to the app with your Gmail
2. In Supabase dashboard, go to **Table Editor** → **users**
3. Find your email and change `role` to `teacher`

## 📁 Project Structure

```
exam-system/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login page
│   ├── exam/page.tsx         # Exam interface
│   ├── results/page.tsx      # Student results
│   ├── dashboard/page.tsx    # Teacher dashboard
│   └── api/                   # API routes
├── components/
│   ├── ExamInterface.tsx     # Main exam component
│   ├── AntiCheat.tsx         # Anti-cheat wrapper
│   ├── Timer.tsx             # Countdown timer
│   └── ...
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── questions.ts          # Exam questions
│   └── utils.ts              # Utility functions
├── supabase/
│   └── schema.sql            # Database schema
└── public/
    └── ...                    # Static assets
```

## 📝 Customizing Questions

Edit `lib/questions.ts` to modify exam questions. Each question has:
- `id`: Unique identifier
- `type`: 'multiple_choice' | 'identification'
- `question`: The question text
- `options`: Array of choices (for multiple choice)
- `correctAnswer`: The correct answer
- `points`: Points value

## ⚙️ Configuration

In `lib/config.ts`:
- `EXAM_DURATION_MINUTES`: Default 60 minutes
- `MAX_TAB_SWITCHES`: Allowed tab switches before lockout (default: 3)
- `AUTO_SAVE_INTERVAL`: Auto-save frequency in ms (default: 30000)
- `ALLOWED_DOMAINS`: Restrict to specific email domains

## 🔒 Security Notes

1. **Email Domain Restriction**: You can restrict signups to specific email domains (e.g., only @school.edu.ph)
2. **Exam Tokens**: Each exam session has a unique token to prevent sharing
3. **Rate Limiting**: Built-in protection against spam submissions
4. **Row Level Security**: Database policies ensure students can only see their own data

## 📊 Grading

- **Multiple Choice**: Automatically graded
- **Identification**: Automatically graded (case-insensitive, trims whitespace)
- **Manual Override**: Teachers can adjust scores if needed

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase connection in dashboard
3. Ensure Google OAuth is properly configured
4. Check that RLS policies are enabled

## 📄 License

MIT License - Feel free to modify for your educational needs.

---

Built with ❤️ for Grade 11 Computer Programming 2 Students
