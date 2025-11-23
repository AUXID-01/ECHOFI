import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  User,
  Settings,
  HelpCircle,
} from 'lucide-react'

const NAV_LINKS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: <Receipt className="w-4 h-4" />,
  },
  { to: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  {
    to: '/settings',
    label: 'Settings',
    icon: <Settings className="w-4 h-4" />,
  },
  { to: '/help', label: 'Help', icon: <HelpCircle className="w-4 h-4" /> },
]

const Navbar = () => {
  const location = useLocation()

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex items-center justify-between border-b border-gray-200">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-xl shadow">
          <span className="font-bold text-lg">EchoFi</span>
        </div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-4">
        {NAV_LINKS.map((link) => {
          const active = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {link.icon}
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Navbar
