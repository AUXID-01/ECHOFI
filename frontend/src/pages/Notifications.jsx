import { useState } from 'react'
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  AlertTriangle,
  Star,
  CreditCard,
  Shield,
  Gift,
  Trash2,
  Check,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Notifications = () => {
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(false)

  const categories = ['All', 'Payments', 'Security', 'Offers', 'System']
  const [activeTab, setActiveTab] = useState('All')

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'Payments',
      icon: CreditCard,
      title: 'Payment of ₹450 successful',
      message: 'Your payment to Starbucks has been processed.',
      time: '5 min ago',
      unread: true,
    },
    {
      id: 2,
      type: 'Security',
      icon: Shield,
      title: 'New login detected',
      message: 'A new login was detected from Chrome Windows.',
      time: '30 min ago',
      unread: true,
    },
    {
      id: 3,
      type: 'Offers',
      icon: Gift,
      title: 'Special FD Offer 8.1%',
      message: 'Limited-time FD interest rate available now!',
      time: '1 day ago',
      unread: false,
    },
    {
      id: 4,
      type: 'System',
      icon: AlertTriangle,
      title: 'Scheduled maintenance',
      message: 'Services will be unavailable on 22 Nov, 2AM–4AM.',
      time: '2 days ago',
      unread: false,
    },
  ])

  const filtered =
    activeTab === 'All'
      ? notifications
      : notifications.filter((n) => n.type === activeTab)

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              unread: false,
            }
          : n
      )
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <div
      className={`min-h-screen pb-20 transition-all duration-500 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className={`
    flex items-center gap-2 px-5 py-2 rounded-xl font-semibold 
    transition-all hover:scale-105 
    shadow-md
    ${
      darkMode
        ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
    }
  `}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl transition hover:scale-110 ${
              darkMode ? 'bg-yellow-400 text-white' : 'bg-indigo-600 text-white'
            }`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* PAGE TITLE */}
        <h1
          className={`text-4xl font-extrabold mb-6 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}
        >
          Notifications
        </h1>

        {/* TABS */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${
                activeTab === cat
                  ? darkMode
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-indigo-600 text-white shadow-lg'
                  : darkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CLEAR ALL */}
        {notifications.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={clearAll}
              className="text-sm font-semibold flex items-center gap-1 px-4 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}

        {/* NOTIFICATION LIST */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div
              className={`text-center py-20 rounded-3xl ${
                darkMode
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-white text-gray-500'
              }`}
            >
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              No notifications in this category.
            </div>
          )}

          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`
      relative flex items-start gap-4 p-5 rounded-2xl cursor-pointer
      transition-all hover:scale-[1.01] backdrop-blur-xl border
      ${
        darkMode
          ? n.unread
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-800/60 border-gray-700/50 opacity-90'
          : n.unread
          ? 'bg-white border-gray-200 shadow-md'
          : 'bg-white/70 border-gray-100 opacity-90'
      }
    `}
            >
              {/* Icon Container */}
              <div
                className={`p-3 rounded-xl transition-all ${
                  n.unread
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <n.icon className="w-5 h-5" />
              </div>

              {/* Message Area */}
              <div className="flex-1">
                <p
                  className={`font-bold mb-1 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {n.title}
                </p>
                <p
                  className={`text-sm mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {n.message}
                </p>
                <p
                  className={`text-xs ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {n.time}
                </p>
              </div>

              {/* Status Indicator */}
              {n.unread ? (
                <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500 opacity-80" />
              )}

              {/* Smooth highlight flash when marked read */}
              {!n.unread && (
                <div className="absolute inset-0 bg-green-500/10 rounded-2xl pointer-events-none animate-[fadeout_0.5s_ease-out]" />
              )}
            </div>
          ))}
          <style>{`
  @keyframes fadeout {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }
`}</style>
        </div>
      </div>
    </div>
  )
}

export default Notifications
