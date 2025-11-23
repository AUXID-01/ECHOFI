// Dashboard.jsx
import { useState, useEffect } from 'react'
import {
  CreditCard,
  Send,
  FileText,
  Layers,
  User,
  Settings as SettingsIcon,
  HelpCircle,
  Mic,
  TrendingUp,
  Eye,
  EyeOff,
  ChevronRight,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Bell,
  Star,
  Sparkles,
  X,
  Check,
  Percent,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BACKEND_API } from "../api/backend";


/**
 * Dashboard.jsx
 * - Reads `token` and `user` from localStorage
 * - If `user` missing, calls GET /auth/me to fetch profile (requires backend endpoint)
 * - Calls GET /bank/balance and GET /bank/history using the token
 *
 * NOTE: Ensure backend exposes /auth/me returning user's profile:
 * { id, username, email, phone, role }
 */



const getAuthHeaders = () => ({
  "Authorization": `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

// Helper to check the "user not found" error
const isUserMissingError = async (res) => {
  if (!res || res.status !== 404) return false;
  try {
    const j = await res.clone().json();
    return j?.detail === "User associated with token not found";
  } catch {
    return false;
  }
};


const QuickActionCard = ({ icon: Icon, title, subtitle, onClick, gradient, iconBg, darkMode }) => (
  <button onClick={onClick} className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:-translate-y-1 ${darkMode ? 'bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/50 hover:border-gray-500' : `bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/60 hover:border-white shadow-lg hover:shadow-2xl`}`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${iconBg} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
    <div className="relative flex flex-col items-center">
      <div className={`mb-4 p-4 rounded-2xl bg-gradient-to-br ${iconBg} shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <span className={`font-bold text-base mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{title}</span>
      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</span>
    </div>
    <ChevronRight className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
  </button>
)

const TransactionItem = ({ transaction, darkMode }) => {
  const type = transaction.transaction_type || transaction.type || 'debit'
  const amount = transaction.amount ?? 0
  const description = transaction.description || transaction.name || '-'
  const date = transaction.initiated_at || transaction.date || ''

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-xl ${type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          {type === 'credit' ? <ArrowDownRight className="w-5 h-5 text-green-600 dark:text-green-400" /> : <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />}
        </div>
        <div>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{description}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{date ? new Date(date).toLocaleString() : ''}</p>
        </div>
      </div>
      <p className={`font-bold ${type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {type === 'credit' ? '+' : '-'}₹{Math.abs(amount).toLocaleString()}
      </p>
    </div>
  )
}

const VoiceModal = ({ isOpen, onClose, darkMode, transcript, setTranscript }) => {
  const [listening, setListening] = useState(false)
  const [ripples, setRipples] = useState([])

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.continuous = false

    recognition.onstart = () => setListening(true)
    recognition.onresult = (event) => {
      const t = event.results[0][0].transcript
      setTranscript(t)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognition.start()
    setRipples([Date.now()])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`relative w-full max-w-md mx-4 rounded-3xl p-8 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <X className="w-5 h-5" />
        </button>

        <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>Voice Command</h2>

        <div className="flex justify-center mb-6">
          <div className="relative">
            {ripples.map((time) => (
              <div key={time} className="absolute inset-0 -m-2 rounded-full border-2 border-blue-500/20 animate-ping" />
            ))}
            <button onClick={startListening} disabled={listening} className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${listening ? 'bg-gradient-to-br from-red-500 to-pink-600 animate-pulse' : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:scale-110'}`}>
              <Mic className="w-10 h-10 text-white" />
            </button>
          </div>
        </div>

        <div className={`text-center mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{listening ? '🎙️ Listening...' : 'Tap to speak'}</div>

        {transcript && <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}><p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{transcript}</p></div>}
      </div>
    </div>
  )
}

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [notification, setNotification] = useState(null)

  const [balanceInfo, setBalanceInfo] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [transcript, setTranscript] = useState('')

  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // user profile state (from localStorage or fetched)
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })
useEffect(() => {
  if (!token) {
    navigate("/login");
    return;
  }

  const controller = new AbortController();

  // Fetch user profile only once, do NOT retry twice
  const fetchProfileIfNeeded = async () => {
    if (user) return;

    let res = await fetch(`${BACKEND_API}/auth/me`, {
      headers: getAuthHeaders(),
      signal: controller.signal,
    });

    // invalid token → logout
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    // user missing in DB (deleted, or stale token)
    if (await isUserMissingError(res)) {
      console.warn("User missing. Clearing stale user.");
      localStorage.removeItem("user");
      setUser(null);
      return; // do NOT retry - token is stale
    }

    if (!res.ok) {
      console.warn("Failed to load profile");
      return;
    }

    const profile = await res.json();
    setUser(profile);
    localStorage.setItem("user", JSON.stringify(profile));
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      await fetchProfileIfNeeded();

      // --- BALANCE ---
      const balanceRes = await fetch(`${BACKEND_API}/bank/balance`, {
        headers: getAuthHeaders(),
        signal: controller.signal,
      });

      if (balanceRes.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const balJson = await balanceRes.json();
      setBalanceInfo({
        balance: balJson.balance,
        account_type: balJson.account_type || "savings",
        user_name: user?.username || balJson.user_name || "Customer",
        account_last4: String(balJson.account_number || "").slice(-4),
      });

      // --- TRANSACTIONS ---
      const txRes = await fetch(`${BACKEND_API}/bank/history`, {
        headers: getAuthHeaders(),
        signal: controller.signal,
      });

      if (txRes.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const txJson = await txRes.json();
      const txList =
        txJson.transactions ||
        txJson.data?.transactions ||
        (Array.isArray(txJson) ? txJson : []);

      setTransactions(txList);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchData();

  return () => controller.abort();
}, [token]); // <-- ONLY DEPENDS ON TOKEN (fixed)



  const showNotification = (message) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleNavigation = (page) => {
    navigate(`/${page}`)
  }

  const handleVoiceCommand = () => {
    setVoiceModalOpen(true)
  }

  // prepare display values
  const displayName = user?.username ?? balanceInfo?.user_name ?? 'Customer'
  const acctLast4 = balanceInfo?.account_last4 ?? '----'
  const displayBalance = balanceInfo?.balance ?? null
  const displayAccountType = balanceInfo?.account_type ?? 'savings'

  return (
    <div className={`min-h-screen pb-10 transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <Check className="w-5 h-5 text-green-500" />
            <span className={darkMode ? 'text-white' : 'text-gray-800'}>{notification}</span>
          </div>
        </div>
      )}

      <VoiceModal isOpen={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} darkMode={darkMode} transcript={transcript} setTranscript={setTranscript} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className={`rounded-3xl shadow-2xl p-8 mb-6 transition-all duration-500 border-2 backdrop-blur-xl ${darkMode ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50' : 'bg-white/80 border-white/70'}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Welcome back, {displayName}! 👋
              </h1>
              <p className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <DollarSign className="w-4 h-4" /> Account • •••• {acctLast4}
                <span className="mx-2">•</span>
                <span className="text-xs text-gray-400">Type: {displayAccountType}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/notifications')} className={`relative p-3 rounded-xl shadow-lg hover:scale-110 transition-all duration-300 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
              </button>
              <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-xl shadow-lg hover:scale-110 transition-all duration-300 ${darkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'}`}>{darkMode ? '☀️' : '🌙'}</button>
              <button onClick={handleVoiceCommand} className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-3 rounded-xl shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 group">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                <Mic className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* BALANCE CARD */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24 animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-blue-200 text-sm mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Current Balance</p>
                  <p className="text-5xl font-bold mb-1">{loading ? 'Loading...' : (displayBalance !== null ? `₹${Number(displayBalance).toLocaleString()}` : '₹--,--')}</p>
                  <p className="text-blue-200 text-xs flex items-center gap-1"><Sparkles className="w-3 h-3" /> Available to spend</p>
                </div>
                <button onClick={() => setShowBalance(!showBalance)} className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm hover:scale-110">
                  {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex gap-4 mt-6">
                <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm hover:bg-white/20 transition-all">
                  <p className="text-xs text-blue-200 mb-1">Income</p>
                  <p className="text-lg font-bold">+₹8,450</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm hover:bg-white/20 transition-all">
                  <p className="text-xs text-blue-200 mb-1">Expenses</p>
                  <p className="text-lg font-bold">₹12,340</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className={`rounded-3xl shadow-2xl p-8 mb-6 transition-all duration-500 border-2 backdrop-blur-xl ${darkMode ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50' : 'bg-white/80 border-white/70'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}><Zap className="w-6 h-6 text-yellow-500" /> Quick Actions</h2>
            <Star className="w-6 h-6 text-yellow-500 animate-bounce" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <QuickActionCard icon={CreditCard} title="Transactions" subtitle="View History" onClick={() => handleNavigation('transactions')} gradient="from-blue-50 to-blue-100" iconBg="from-blue-500 to-blue-700" darkMode={darkMode} />
            <QuickActionCard icon={Send} title="Transfer" subtitle="Send Money" onClick={() => handleNavigation('money-transfer')} gradient="from-green-50 to-green-100" iconBg="from-green-500 to-green-700" darkMode={darkMode} />
            <QuickActionCard icon={FileText} title="Pay Bills" subtitle="Utilities" onClick={() => handleNavigation('bill-payment')} gradient="from-yellow-50 to-yellow-100" iconBg="from-yellow-400 to-yellow-600" darkMode={darkMode} />
            <QuickActionCard icon={Layers} title="Loans" subtitle="Apply Now" onClick={() => handleNavigation('loans')} gradient="from-purple-50 to-purple-100" iconBg="from-purple-500 to-purple-700" darkMode={darkMode} />
            <QuickActionCard icon={Percent} title="Schemes" subtitle="Explore Now" onClick={() => handleNavigation('schemes')} gradient="from-purple-50 to-purple-100" iconBg="from-purple-500 to-purple-700" darkMode={darkMode} />
            <QuickActionCard icon={User} title="Profile" subtitle="Your Account" onClick={() => handleNavigation('profile')} gradient="from-pink-50 to-pink-100" iconBg="from-pink-400 to-pink-600" darkMode={darkMode} />
            <QuickActionCard icon={SettingsIcon} title="Settings" subtitle="Configure" onClick={() => handleNavigation('settings')} gradient="from-gray-50 to-gray-100" iconBg="from-gray-600 to-gray-800" darkMode={darkMode} />
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className={`rounded-3xl shadow-2xl p-8 mb-6 transition-all duration-500 border-2 backdrop-blur-xl ${darkMode ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50' : 'bg-white/80 border-white/70'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Transactions</h2>
            <button onClick={() => handleNavigation('transactions')} className={`text-sm font-semibold flex items-center gap-1 transition-all hover:gap-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>View All <ChevronRight className="w-4 h-4" /></button>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading transactions...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No recent transactions</div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 6).map((t) => <TransactionItem key={t.id ?? Math.random()} transaction={t} darkMode={darkMode} />)}
            </div>
          )}
        </div>

        {/* ANNOUNCEMENTS */}
        <div className={`rounded-3xl shadow-2xl p-6 mb-6 transition-all duration-500 border-2 backdrop-blur-xl ${darkMode ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50' : 'bg-white/80 border-white/70'}`}>
          <button onClick={() => handleNavigation('announcements')} className={`flex items-center justify-center w-full p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${darkMode ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30' : 'bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border border-yellow-200'}`}>
            <Sparkles className={`w-6 h-6 mr-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <span className={`font-bold text-lg ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>Latest Offers & Announcements</span>
            <ChevronRight className={`w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`} />
          </button>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-8">
          <p className={`text-sm font-medium flex items-center justify-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Star className="w-4 h-4 text-yellow-500" /> Pro Tip: Use voice commands for hands-free banking
          </p>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
