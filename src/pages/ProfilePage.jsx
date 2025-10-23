import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Trophy, Flame, Star, Award, TrendingUp, ArrowLeft } from 'lucide-react'

export default function ProfilePage() {
  const { profile } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [userAchievements, setUserAchievements] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    coursesEnrolled: 0,
    averageScore: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      fetchData()
    }
  }, [profile])

  const fetchData = async () => {
    try {
      // Fetch all achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value')

      setAchievements(achievementsData || [])

      // Fetch user's achievements
      const { data: userAchievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', profile.id)

      setUserAchievements(userAchievementsData || [])

      // Fetch user stats
      const { data: lessonsData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'completed')

      const { data: enrollmentsData } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', profile.id)

      const avgScore = lessonsData?.length
        ? lessonsData.reduce((sum, l) => sum + (l.score || 0), 0) / lessonsData.length
        : 0

      setStats({
        lessonsCompleted: lessonsData?.length || 0,
        coursesEnrolled: enrollmentsData?.length || 0,
        averageScore: Math.round(avgScore),
      })

      // Fetch leaderboard
      const { data: leaderboardData } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(10)

      setLeaderboard(leaderboardData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasAchievement = (achievementId) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId)
  }

  const xpToNextLevel = () => {
    const currentLevel = profile.level
    const xpForNextLevel = Math.pow(currentLevel, 2) * 100
    const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100
    const progress = profile.xp - xpForCurrentLevel
    const required = xpForNextLevel - xpForCurrentLevel
    return { progress, required, percentage: (progress / required) * 100 }
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const levelProgress = xpToNextLevel()
  const userRank = leaderboard.findIndex(u => u.id === profile.id) + 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-4xl text-white font-bold">
              {profile.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.display_name}</h1>
              <p className="text-gray-600">@{profile.username}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2 mb-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">Level {profile.level}</span>
              </div>
              {userRank > 0 && (
                <p className="text-sm text-gray-600">Rank #{userRank}</p>
              )}
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {levelProgress.progress} / {levelProgress.required} XP to Level {profile.level + 1}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(levelProgress.percentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${levelProgress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{profile.xp}</p>
                <p className="text-sm text-gray-600">Total XP</p>
              </div>
              <div className="card text-center">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{profile.streak_count}</p>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
              <div className="card text-center">
                <Trophy className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{stats.lessonsCompleted}</p>
                <p className="text-sm text-gray-600">Lessons</p>
              </div>
              <div className="card text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </div>

            {/* Achievements */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => {
                  const earned = hasAchievement(achievement.id)
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        earned
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50 opacity-50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{achievement.icon || '🏆'}</div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{achievement.title}</h3>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      {earned && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                            Unlocked
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Leaderboard</h2>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      user.id === profile.id ? 'bg-primary-50 border-2 border-primary-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">{user.display_name}</p>
                      <p className="text-xs text-gray-600">Level {user.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{user.xp}</p>
                      <p className="text-xs text-gray-600">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
