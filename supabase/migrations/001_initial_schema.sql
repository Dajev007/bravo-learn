-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_count INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    language TEXT NOT NULL, -- e.g., 'python', 'javascript', 'java'
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    icon_url TEXT,
    color TEXT DEFAULT '#22c55e',
    is_published BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Units table (groups of lessons within a course)
CREATE TABLE IF NOT EXISTS public.units (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('theory', 'practice', 'challenge', 'review')),
    xp_reward INTEGER DEFAULT 10,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Exercises table (individual exercises within a lesson)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'fill_blank', 'code_completion', 'code_output', 'drag_drop', 'match_pairs')),
    question TEXT NOT NULL,
    instructions TEXT,
    code_snippet TEXT, -- For exercises that involve code
    options JSONB, -- For multiple choice, options array
    correct_answer JSONB NOT NULL, -- Can store string, array, or object depending on exercise type
    explanation TEXT, -- Explanation shown after answering
    hints JSONB, -- Array of hints
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User progress on lessons
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    score INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, lesson_id)
);

-- User answers to exercises (for tracking)
CREATE TABLE IF NOT EXISTS public.exercise_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    user_answer JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User course enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    current_lesson_id UUID REFERENCES public.lessons(id),
    progress_percentage INTEGER DEFAULT 0,
    UNIQUE(user_id, course_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('xp', 'streak', 'lessons_completed', 'course_completed', 'perfect_lesson')),
    requirement_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Leaderboard (materialized view for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.leaderboard AS
SELECT
    id,
    username,
    display_name,
    avatar_url,
    xp,
    level,
    streak_count,
    ROW_NUMBER() OVER (ORDER BY xp DESC) as rank
FROM public.profiles
ORDER BY xp DESC
LIMIT 100;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_units_course_id ON public.units(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_unit_id ON public.lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson_id ON public.exercises(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_id ON public.exercise_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses: Everyone can view published courses
CREATE POLICY "Published courses are viewable by everyone" ON public.courses FOR SELECT USING (is_published = true);

-- Units: Everyone can view units of published courses
CREATE POLICY "Units are viewable by everyone" ON public.units FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = units.course_id AND is_published = true)
);

-- Lessons: Everyone can view lessons
CREATE POLICY "Lessons are viewable by everyone" ON public.lessons FOR SELECT USING (true);

-- Exercises: Everyone can view exercises
CREATE POLICY "Exercises are viewable by everyone" ON public.exercises FOR SELECT USING (true);

-- Lesson Progress: Users can only see and modify their own progress
CREATE POLICY "Users can view own lesson progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lesson progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lesson progress" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- Exercise Attempts: Users can only see and create their own attempts
CREATE POLICY "Users can view own exercise attempts" ON public.exercise_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercise attempts" ON public.exercise_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Course Enrollments: Users can only see and modify their own enrollments
CREATE POLICY "Users can view own enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enrollments" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON public.course_enrollments FOR UPDATE USING (auth.uid() = user_id);

-- Achievements: Everyone can view achievements
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);

-- User Achievements: Users can view all achievements but only insert their own
CREATE POLICY "User achievements are viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate and update user level based on XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Level formula: level = floor(sqrt(xp / 100)) + 1
    RETURN FLOOR(SQRT(xp_amount::float / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    last_date DATE;
    current_streak INTEGER;
BEGIN
    SELECT last_activity_date, streak_count INTO last_date, current_streak
    FROM public.profiles
    WHERE id = user_uuid;

    IF last_date = CURRENT_DATE THEN
        -- Already logged activity today, no change
        RETURN;
    ELSIF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
        -- Consecutive day, increment streak
        UPDATE public.profiles
        SET streak_count = current_streak + 1,
            last_activity_date = CURRENT_DATE
        WHERE id = user_uuid;
    ELSE
        -- Streak broken, reset to 1
        UPDATE public.profiles
        SET streak_count = 1,
            last_activity_date = CURRENT_DATE
        WHERE id = user_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;
