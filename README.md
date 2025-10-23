# BravoLearn - Learn Programming Like Duolingo

A Duolingo-style interactive learning platform for programming languages built with React, Vite, and Supabase.

## Features

- **Interactive Lessons**: Learn Python, JavaScript, and other programming languages through bite-sized lessons
- **Multiple Exercise Types**:
  - Multiple choice questions
  - Fill-in-the-blank exercises
  - Code completion challenges
  - Code output prediction
- **Gamification**:
  - XP points and leveling system
  - Daily streak tracking
  - Achievements and badges
  - Global leaderboard
- **Progress Tracking**: Track your learning progress across courses and lessons
- **PWA Support**: Install as an app on mobile and desktop devices
- **Responsive Design**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### 1. Clone and Install

```bash
cd bravo-learn
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up the Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`

This will create all necessary tables, set up Row Level Security policies, and populate the database with sample Python and JavaScript courses.

### 4. Configure Supabase MCP (Optional)

The project includes a `.mcp.json` file for Supabase MCP server integration. This allows Claude Code to interact with your Supabase database directly.

To use it:
1. Restart Claude Code after creating the `.mcp.json` file
2. Approve the MCP server when prompted
3. You can now use Claude Code to query and manage your database

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production

```bash
npm run build
npm run preview  # Preview the production build
```

## Project Structure

```
bravo-learn/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── auth/       # Authentication components
│   │   ├── course/     # Course-related components
│   │   ├── lesson/     # Lesson and exercise components
│   │   └── layout/     # Layout components
│   ├── contexts/       # React contexts (Auth)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and config (Supabase client)
│   ├── pages/          # Page components
│   │   ├── Dashboard.jsx
│   │   ├── CoursePage.jsx
│   │   ├── LessonPage.jsx
│   │   └── ProfilePage.jsx
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # App entry point
│   └── index.css       # Global styles with Tailwind
├── supabase/
│   └── migrations/     # Database migration files
├── .mcp.json           # MCP server configuration
└── vite.config.js      # Vite and PWA configuration
```

## Database Schema

### Main Tables

- **profiles**: User profiles with XP, level, and streak data
- **courses**: Available programming courses
- **units**: Groups of lessons within courses
- **lessons**: Individual lessons with exercises
- **exercises**: Questions and challenges within lessons
- **lesson_progress**: User progress tracking
- **exercise_attempts**: Individual exercise attempt history
- **course_enrollments**: User course enrollments
- **achievements**: Available achievements
- **user_achievements**: Unlocked user achievements

## Adding New Courses

To add a new course:

1. Insert into the `courses` table
2. Add units for the course in the `units` table
3. Add lessons for each unit in the `lessons` table
4. Add exercises for each lesson in the `exercises` table

Example:

```sql
-- Add a new course
INSERT INTO courses (title, description, language, difficulty, color, is_published)
VALUES ('Java Basics', 'Learn Java programming', 'java', 'beginner', '#007396', true);

-- Add units, lessons, and exercises following the same pattern
```

## Exercise Types

### Supported Exercise Types:

1. **multiple_choice**: Select one answer from options
2. **fill_blank**: Fill in missing code or text
3. **code_completion**: Write complete code solutions
4. **code_output**: Predict code output
5. **drag_drop**: Arrange items in order
6. **match_pairs**: Match related items

### Exercise Format:

```json
{
  "type": "multiple_choice",
  "question": "What function prints output in Python?",
  "options": ["print()", "console.log()", "echo()"],
  "correct_answer": "print()",
  "explanation": "print() is Python's output function",
  "hints": ["It's similar to 'printing' on paper"]
}
```

## Gamification Features

### XP and Leveling
- Earn XP by completing lessons
- Level up as you accumulate XP
- Formula: `level = floor(sqrt(xp / 100)) + 1`

### Streaks
- Maintain daily learning streaks
- Automatically tracked when completing lessons
- Breaks if you miss a day

### Achievements
- Unlock achievements for milestones
- Types: XP milestones, streak goals, lesson completion, perfect scores

### Leaderboard
- Global top 10 rankings
- Sorted by total XP
- Real-time updates

## PWA Features

The app is installable as a Progressive Web App:

- **Offline Support**: Service worker caches assets and API responses
- **Install Prompt**: Users can install on mobile/desktop
- **App Shortcuts**: Quick access to Dashboard and Profile
- **Background Sync**: Syncs data when connection is restored

## Authentication

Uses Supabase Auth with:
- Email/password authentication
- Automatic profile creation on signup
- Row Level Security for data protection
- Protected routes for authenticated content

## Customization

### Colors

Update the theme colors in `tailwind.config.js`:

```js
colors: {
  primary: { ... },  // Main brand color
  secondary: { ... } // Secondary brand color
}
```

### Course Icons

Add course-specific emojis or icons in `Dashboard.jsx` and `CoursePage.jsx`.

## Deployment

### Recommended Platforms:

1. **Vercel** (Recommended)
   ```bash
   npm run build
   # Deploy the dist/ folder
   ```

2. **Netlify**
   ```bash
   npm run build
   # Deploy the dist/ folder
   ```

3. **Cloudflare Pages**
   - Build command: `npm run build`
   - Build output directory: `dist`

### Environment Variables

Make sure to set these in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for learning or production.

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/yourusername/bravo-learn/issues)
- Review the Supabase documentation
- Check the React and Vite documentation

## Roadmap

Future enhancements:
- [ ] Code execution in the browser (Python, JavaScript)
- [ ] AI-powered hints and explanations
- [ ] Social features (friends, challenges)
- [ ] More programming languages (Ruby, Go, Rust)
- [ ] Mobile apps (React Native)
- [ ] Voice interactions
- [ ] Dark mode

## Acknowledgments

- Inspired by [Duolingo](https://www.duolingo.com)
- Built with [Supabase](https://supabase.com)
- Icons by [Lucide](https://lucide.dev)
