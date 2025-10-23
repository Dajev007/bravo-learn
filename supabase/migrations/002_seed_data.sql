-- Seed sample courses
INSERT INTO public.courses (id, title, description, language, difficulty, color, is_published, order_index) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Python Fundamentals', 'Learn the basics of Python programming from scratch', 'python', 'beginner', '#3776AB', true, 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'JavaScript Essentials', 'Master JavaScript fundamentals for web development', 'javascript', 'beginner', '#F7DF1E', true, 2),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Advanced Python', 'Deep dive into advanced Python concepts', 'python', 'advanced', '#3776AB', true, 3);

-- Python Fundamentals Units
INSERT INTO public.units (id, course_id, title, description, order_index) VALUES
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Getting Started', 'Introduction to Python and basic syntax', 1),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Variables and Data Types', 'Learn about different data types in Python', 2),
('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Control Flow', 'Master if statements, loops, and logic', 3);

-- JavaScript Units
INSERT INTO public.units (id, course_id, title, description, order_index) VALUES
('a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'JavaScript Basics', 'Introduction to JavaScript fundamentals', 1),
('b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Functions and Scope', 'Understanding functions in JavaScript', 2);

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

-- Achievements
INSERT INTO public.achievements (title, description, icon, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first lesson', '🎯', 'lessons_completed', 1),
('Quick Learner', 'Earn 100 XP', '⭐', 'xp', 100),
('Dedicated', 'Maintain a 7-day streak', '🔥', 'streak', 7),
('Course Master', 'Complete an entire course', '🏆', 'course_completed', 1),
('Perfectionist', 'Complete a lesson with 100% accuracy', '💯', 'perfect_lesson', 1),
('XP Hunter', 'Earn 1000 XP', '🌟', 'xp', 1000),
('Streak Master', 'Maintain a 30-day streak', '🔥', 'streak', 30);
