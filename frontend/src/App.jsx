import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Help from './pages/Help'
import MoneyTransfer from './pages/MoneyTransfer'
import BillPayment from './pages/BillPayment'
import UPIPayment from './pages/UPIPayment'
import PaymentConfirmation from './pages/PaymentConfirmation'

import Announcements from './pages/Announcements'
import SupportCenter from './pages/SupportCenter'
import OffersAndNotifications from './pages/OffersAndNotifications'
import SessionLock from './pages/SessionLock'
import OTPVerification from './components/OTPVerification'
import Notifications from './pages/Notifications'
import Sidebar from './components/Sidebar'
import VoiceOverlay from './components/VoiceOverlay'
import Loans from './pages/Loans'
import Schemes from './pages/Schemes'

// Layout for authenticated pages
const AppLayout = ({ children }) => (
  <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <Sidebar />
    <div className="flex-1 p-6 ml-56">
      {children}
    </div>
  </div>
)

function App() {
  return (
    <Router>

      {/* 🔥 GLOBAL — Never unmounts */}
      <VoiceOverlay />

      <Routes>
        {/* Public Pages (no layout) */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/session-lock" element={<SessionLock />} />
        <Route path="/otp-verification" element={<OTPVerification />} />

        {/* Authenticated/Internal Pages */}
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/notifications" element={<AppLayout><Notifications /></AppLayout>} />
        <Route path="/transactions" element={<AppLayout><Transactions /></AppLayout>} />
        <Route path="/money-transfer" element={<AppLayout><MoneyTransfer /></AppLayout>} />
        <Route path="/bill-payment" element={<AppLayout><BillPayment /></AppLayout>} />
        <Route path="/upi-payment" element={<AppLayout><UPIPayment /></AppLayout>} />
        <Route path="/payment-confirmation" element={<AppLayout><PaymentConfirmation /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
        <Route path="/loans" element={<AppLayout><Loans /></AppLayout>} />
        <Route path="/schemes" element={<AppLayout><Schemes /></AppLayout>} />
        <Route path="/announcements" element={<AppLayout><Announcements /></AppLayout>} />
        <Route path="/support" element={<AppLayout><SupportCenter /></AppLayout>} />
        <Route path="/offers-notifications" element={<AppLayout><OffersAndNotifications /></AppLayout>} />
        <Route path="/help" element={<AppLayout><Help /></AppLayout>} />

        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen">
              <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
            </div>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
