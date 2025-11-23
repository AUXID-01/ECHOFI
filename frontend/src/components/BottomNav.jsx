import { Link, useLocation } from 'react-router-dom'
import { Home, Send, FileText, Layers, User, Bell } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: <Home />, label: 'Home' },
  { to: '/money-transfer', icon: <Send />, label: 'Send' },
  { to: '/transactions', icon: <FileText />, label: 'Txns' },
  { to: '/loans-schemes', icon: <Layers />, label: 'Loans' },
  { to: '/profile', icon: <User />, label: 'Profile' },
  { to: '/offers-notifications', icon: <Bell />, label: 'Alerts' },
]

const BottomNav = () => {
  const location = useLocation()
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-50 flex justify-around items-center py-2 md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex flex-col items-center px-2 ${
            location.pathname === item.to ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default BottomNav
