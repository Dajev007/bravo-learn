# Quick Setup Guide for BravoLearn

## Step-by-Step Setup

### 1. Configure Environment Variables

Edit `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to find these:**
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to Settings > API
4. Copy "Project URL" and "anon public" key

### 2. Set Up the Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste `supabase/migrations/001_initial_schema.sql`
4. Click **Run**
5. Repeat for `supabase/migrations/002_seed_data.sql`

This creates:
- All tables (users, courses, lessons, etc.)
- Security policies
- Sample Python and JavaScript courses

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

### 5. Create Your First Account

1. Click "Sign Up"
2. Enter email, username, and password
3. Check your email for verification (if email is configured)
4. Start learning!

## Testing the App

### Without Authentication (Guest Mode):
- ✅ View dashboard
- ✅ Browse courses
- ❌ Cannot start lessons (must sign up)

### With Authentication:
- ✅ Enroll in courses
- ✅ Complete lessons
- ✅ Earn XP and achievements
- ✅ Track streaks
- ✅ View leaderboard

## Default Sample Data

After running migrations, you'll have:

### Courses:
1. **Python Fundamentals** (Beginner)
   - 3 Units: Getting Started, Variables, Control Flow
   - 6+ Lessons with exercises

2. **JavaScript Essentials** (Beginner)
   - 2 Units: Basics, Functions
   - Multiple lessons

3. **Advanced Python** (Advanced)
   - Empty template for you to fill

### Sample Exercises:
- Multiple choice questions
- Fill-in-the-blank code
- Code completion challenges
- Code output predictions

## Common Issues

### Database Errors

**Error: "permission denied for table profiles"**
- Solution: Run the migration files again, they include RLS policies

**Error: "relation does not exist"**
- Solution: Make sure you ran `001_initial_schema.sql` first

### Authentication Issues

**Can't sign up**
- Check: Is your Supabase project active?
- Check: Are the env variables correct?
- Check: Did you enable email auth in Supabase dashboard?

**Email verification not working**
- Go to Supabase Dashboard > Authentication > Providers
- Enable email provider and configure SMTP (or disable email confirmation for testing)

### MCP Server Issues

**MCP server not showing up**
- Restart Claude Code
- Check that `.mcp.json` exists in the project root
- Approve the server when prompted

## Next Steps

1. **Test the app**: Sign up and complete a lesson
2. **Customize**: Add your own courses and content
3. **Deploy**: Follow deployment guide in README.md
4. **Extend**: Add new exercise types or features

## Quick Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Need Help?

- Check main README.md for detailed documentation
- Review Supabase logs in dashboard
- Check browser console for errors
- Ensure all migrations ran successfully
