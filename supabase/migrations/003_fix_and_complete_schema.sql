-- This migration can be run safely even if previous migrations partially succeeded
-- It will only create what's missing

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies (we'll recreate them)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Units are viewable by everyone" ON public.units;
DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;
DROP POLICY IF EXISTS "Exercises are viewable by everyone" ON public.exercises;
DROP POLICY IF EXISTS "Users can view own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can insert own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can view own exercise attempts" ON public.exercise_attempts;
DROP POLICY IF EXISTS "Users can insert own exercise attempts" ON public.exercise_attempts;
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;
DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;

-- Recreate RLS Policies
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

-- Verify all sample data exists
DO $$
BEGIN
    -- Only insert courses if they don't exist
    IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11') THEN
        INSERT INTO public.courses (id, title, description, language, difficulty, color, is_published, order_index) VALUES
        ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Python Fundamentals', 'Learn the basics of Python programming from scratch', 'python', 'beginner', '#3776AB', true, 1);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12') THEN
        INSERT INTO public.courses (id, title, description, language, difficulty, color, is_published, order_index) VALUES
        ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'JavaScript Essentials', 'Master JavaScript fundamentals for web development', 'javascript', 'beginner', '#F7DF1E', true, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13') THEN
        INSERT INTO public.courses (id, title, description, language, difficulty, color, is_published, order_index) VALUES
        ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Advanced Python', 'Deep dive into advanced Python concepts', 'python', 'advanced', '#3776AB', true, 3);
    END IF;
END $$;

-- Check if we have units, if not create them
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.units LIMIT 1) THEN
        -- Python Fundamentals Units
        INSERT INTO public.units (id, course_id, title, description, order_index) VALUES
        ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Getting Started', 'Introduction to Python and basic syntax', 1),
        ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Variables and Data Types', 'Learn about different data types in Python', 2),
        ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Control Flow', 'Master if statements, loops, and logic', 3);

        -- JavaScript Units
        INSERT INTO public.units (id, course_id, title, description, order_index) VALUES
        ('a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'JavaScript Basics', 'Introduction to JavaScript fundamentals', 1),
        ('b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Functions and Scope', 'Understanding functions in JavaScript', 2);
    END IF;
END $$;

-- Check if we have lessons, if not create them
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.lessons LIMIT 1) THEN
        -- Python Lessons - Getting Started Unit
        INSERT INTO public.lessons (id, unit_id, title, description, type, xp_reward, order_index) VALUES
        ('c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Hello Python', 'Your first Python program', 'theory', 10, 1),
        ('d9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Print Statements', 'Learn how to output text', 'practice', 15, 2),
        ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Comments', 'Understanding code comments', 'practice', 10, 3);

        -- Python Lessons - Variables Unit
        INSERT INTO public.lessons (id, unit_id, title, description, type, xp_reward, order_index) VALUES
        ('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Variables', 'Creating and using variables', 'theory', 15, 1),
        ('a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Numbers', 'Working with integers and floats', 'practice', 15, 2),
        ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Strings', 'Manipulating text in Python', 'practice', 20, 3);

        -- JavaScript Lessons
        INSERT INTO public.lessons (id, unit_id, title, description, type, xp_reward, order_index) VALUES
        ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Hello JavaScript', 'Your first JavaScript program', 'theory', 10, 1),
        ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Variables in JS', 'let, const, and var', 'practice', 15, 2);
    END IF;
END $$;

-- Check if we have exercises, if not create them
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.exercises LIMIT 1) THEN
        -- Exercises for "Print Statements" lesson
        INSERT INTO public.exercises (lesson_id, type, question, instructions, code_snippet, options, correct_answer, explanation, order_index) VALUES
        ('d9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'multiple_choice', 'What function is used to display text in Python?', 'Select the correct answer', NULL, '["print()", "console.log()", "echo()", "display()"]', '"print()"', 'In Python, print() is the built-in function used to output text to the console.', 1),
        ('d9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'fill_blank', 'Complete the code to print "Hello World"', 'Fill in the blank', 'print(___)', NULL, '"Hello World"', 'The text inside the parentheses should be in quotes.', 2),
        ('d9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'code_completion', 'Write a print statement that displays your name', 'Write the complete code', NULL, NULL, '"print(\\"My Name\\")"', 'You need to use the print() function with text in quotes.', 3);

        -- Exercises for "Variables" lesson
        INSERT INTO public.exercises (lesson_id, type, question, instructions, code_snippet, options, correct_answer, explanation, order_index) VALUES
        ('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'multiple_choice', 'How do you create a variable in Python?', 'Select the correct syntax', NULL, '["var x = 5", "x = 5", "let x = 5", "int x = 5"]', '"x = 5"', 'Python uses simple assignment with the equals sign.', 1),
        ('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'fill_blank', 'Complete the code to create a variable named age with value 25', 'Fill in the blanks', '___ = ___', NULL, '{"var1": "age", "var2": "25"}'::jsonb, 'Variable name on the left, value on the right.', 2),
        ('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'code_output', 'What will this code output?', 'Select the output', 'x = 10\ny = 5\nprint(x + y)', '["15", "10", "5", "105"]', '"15"', 'The plus operator adds the two numbers together.', 3);

        -- Exercises for "Numbers" lesson
        INSERT INTO public.exercises (lesson_id, type, question, instructions, code_snippet, options, correct_answer, explanation, order_index) VALUES
        ('a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'multiple_choice', 'Which of these is a float?', 'Select the floating point number', NULL, '["10", "3.14", "\"5\"", "True"]', '"3.14"', 'A float is a number with a decimal point.', 1),
        ('a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'code_output', 'What is the result?', 'Calculate the output', 'result = 10 / 3\nprint(result)', '["3", "3.33", "3.333333333333333", "Error"]', '"3.333333333333333"', 'Division in Python 3 returns a float with full precision.', 2);

        -- Exercises for "Strings" lesson
        INSERT INTO public.exercises (lesson_id, type, question, instructions, code_snippet, options, correct_answer, explanation, order_index) VALUES
        ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'multiple_choice', 'How do you create a string in Python?', 'Select all valid ways', NULL, '["\"Hello\"", "''Hello''", "Hello", "str(Hello)"]', '"\"Hello\""', 'Strings must be enclosed in quotes (single or double).', 1),
        ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'code_output', 'What will this print?', 'Predict the output', 'name = "Alice"\nprint("Hello " + name)', '["Hello Alice", "Hello + name", "Hello name", "Error"]', '"Hello Alice"', 'The plus operator concatenates (joins) strings together.', 2),
        ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'fill_blank', 'Complete the code to create a greeting', 'Fill in the blank', 'message = "Welcome, " + ___\nprint(message)', NULL, '"name"', 'Use the variable name to concatenate with the greeting.', 3);
    END IF;
END $$;

-- Check if we have achievements, if not create them
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.achievements LIMIT 1) THEN
        INSERT INTO public.achievements (title, description, icon, requirement_type, requirement_value) VALUES
        ('First Steps', 'Complete your first lesson', '🎯', 'lessons_completed', 1),
        ('Quick Learner', 'Earn 100 XP', '⭐', 'xp', 100),
        ('Dedicated', 'Maintain a 7-day streak', '🔥', 'streak', 7),
        ('Course Master', 'Complete an entire course', '🏆', 'course_completed', 1),
        ('Perfectionist', 'Complete a lesson with 100% accuracy', '💯', 'perfect_lesson', 1),
        ('XP Hunter', 'Earn 1000 XP', '🌟', 'xp', 1000),
        ('Streak Master', 'Maintain a 30-day streak', '🔥', 'streak', 30);
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! Database is ready.';
END $$;
