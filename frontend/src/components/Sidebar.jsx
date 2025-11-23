import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  User,
  Settings,
  HelpCircle,
  Bell,
  Send,
  Banknote,
  Percent,
} from 'lucide-react'

const LINKS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-colors" />
    ),
  },
  {
    to: '/notifications',
    label: 'Notifications',
    icon: (
      <div className="relative">
        <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />

        {/* Animated Notification Bubble */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-70 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center shadow-sm">
            3
          </span>
        </span>
      </div>
    ),
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: (
      <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-colors" />
    ),
  },
  {
    to: '/money-transfer',
    label: 'Transfer Money',
    icon: (
      <Send className="w-5 h-5 text-green-600 dark:text-green-400 transition-colors" />
    ),
  },
  {
    to: '/loans',
    label: 'Loans',
    icon: (
      <Banknote className="w-5 h-5 text-yellow-600 dark:text-yellow-400 transition-colors" />
    ),
  },
  {
    to: '/schemes',
    label: 'Schemes',
    icon: (
      <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400 transition-colors" />
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <User className="w-5 h-5 text-pink-600 dark:text-pink-400 transition-colors" />
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-colors" />
    ),
  },
  {
    to: '/help',
    label: 'Help',
    icon: (
      <HelpCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-300 transition-colors" />
    ),
  },
]

const Sidebar = () => {
  const location = useLocation()

  return (
    <aside
      className="
        fixed 
        left-0 
        top-0 
        w-56 
        h-screen 
        bg-white 
        border-r 
        border-gray-200 
        shadow-xl 
        flex 
        flex-col 
        py-6 
        z-40
      "
    >
      {/* Brand Header */}
      <div className="px-4 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl text-center shadow">
          <span className="font-bold text-xl">EchoFi</span>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className="space-y-2 px-3 overflow-y-auto">
        {LINKS.map((link) => {
          const active = location.pathname === link.to
          return (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                  ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {link.icon}
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

export default Sidebar
