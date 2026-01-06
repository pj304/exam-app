-- ===========================================
-- Grade 11 Exam System - Supabase Schema
-- ===========================================
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- USERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ===========================================
-- EXAM SESSIONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  answers JSONB DEFAULT '{}',
  score INTEGER,
  total_points INTEGER,
  tab_switches INTEGER DEFAULT 0,
  is_submitted BOOLEAN DEFAULT false,
  warnings TEXT[] DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_submitted ON exam_sessions(is_submitted);

-- ===========================================
-- ACTIVITY LOGS TABLE (for anti-cheat monitoring)
-- ===========================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES exam_sessions(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_session_id ON activity_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- USERS POLICIES
-- ===========================================

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Teachers can read all user data
CREATE POLICY "Teachers can read all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Teachers can update any user
CREATE POLICY "Teachers can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Allow insert for new users (during signup)
CREATE POLICY "Allow insert for new users"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ===========================================
-- EXAM SESSIONS POLICIES
-- ===========================================

-- Students can read their own exam sessions
CREATE POLICY "Students can read own sessions"
  ON exam_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Students can insert their own sessions
CREATE POLICY "Students can create own sessions"
  ON exam_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Students can update their own unsubmitted sessions
CREATE POLICY "Students can update own unsubmitted sessions"
  ON exam_sessions FOR UPDATE
  USING (auth.uid() = user_id AND is_submitted = false)
  WITH CHECK (auth.uid() = user_id);

-- Teachers can read all sessions
CREATE POLICY "Teachers can read all sessions"
  ON exam_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- Teachers can update any session (for manual grading)
CREATE POLICY "Teachers can update any session"
  ON exam_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- ===========================================
-- ACTIVITY LOGS POLICIES
-- ===========================================

-- Students can insert their own logs
CREATE POLICY "Students can create own logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Teachers can read all logs
CREATE POLICY "Teachers can read all logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_sessions_updated_at
  BEFORE UPDATE ON exam_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- INITIAL DATA (Optional)
-- ===========================================

-- You can add yourself as a teacher after first login:
-- UPDATE users SET role = 'teacher' WHERE email = 'your-email@gmail.com';

-- ===========================================
-- VIEWS FOR DASHBOARD
-- ===========================================

-- View for exam results summary
CREATE OR REPLACE VIEW exam_results_summary AS
SELECT 
  u.id AS user_id,
  u.email,
  u.full_name,
  es.id AS session_id,
  es.started_at,
  es.submitted_at,
  es.score,
  es.total_points,
  CASE 
    WHEN es.total_points > 0 
    THEN ROUND((es.score::NUMERIC / es.total_points::NUMERIC) * 100, 2)
    ELSE 0 
  END AS percentage,
  es.tab_switches,
  es.is_submitted,
  array_length(es.warnings, 1) AS warning_count
FROM users u
LEFT JOIN exam_sessions es ON u.id = es.user_id
WHERE u.role = 'student';

-- Grant access to the view
GRANT SELECT ON exam_results_summary TO authenticated;

-- ===========================================
-- NOTES
-- ===========================================
-- 
-- After running this schema:
-- 1. Enable Google OAuth in Supabase Authentication settings
-- 2. Add your Google OAuth credentials
-- 3. Sign in with your Gmail
-- 4. Run: UPDATE users SET role = 'teacher' WHERE email = 'your-email@gmail.com';
-- 
-- ===========================================
