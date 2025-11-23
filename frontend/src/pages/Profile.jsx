import { useState, useRef, useEffect } from 'react'
import {
  Smartphone,
  User,
  Mail,
  ArrowLeft,
  CreditCard,
  Globe,
  Eye,
  EyeOff,
  Check,
  Edit3,
  Lock,
  Shield,
  Sparkles,
  Save,
  Camera,
  Bell,
  Moon,
  Sun,
  X,
  Unlock,
  AlertCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const initialProfile = {
  name: 'Tuhin',
  phone: '+91 91234 56789',
  email: 'tuhin@email.com',
  account_number: '4532 9810 2301 7856',
  ifsc: 'SBIN0001234',
  bank: 'State Bank of India',
  pin: '1234',
  language: 'English',
}

const Profile = () => {
  const [profile, setProfile] = useState(initialProfile)
  const [darkMode, setDarkMode] = useState(false)
  const [edit, setEdit] = useState(false)
  const [editBank, setEditBank] = useState(false)
  const [editPin, setEditPin] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [notification, setNotification] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [pinInput, setPinInput] = useState(['', '', '', ''])
  const [pinError, setPinError] = useState(false)
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const navigate = useNavigate()
  useEffect(() => {
    if (showUnlockModal && pinRefs[0].current) {
      pinRefs[0].current.focus()
    }
  }, [showUnlockModal])

  const handleInput = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3000)
  }

  const handleSaveProfile = () => {
    setEdit(false)
    showNotification('Profile updated successfully!')
  }

  const handleSaveBank = () => {
    setEditBank(false)
    showNotification('Bank details updated!')
  }

  const handleSavePin = () => {
    setEditPin(false)
    setShowPin(false)
    showNotification('PIN changed successfully!')
  }

  const handleBack = () => navigate('/dashboard')

  const handlePinChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    if (!/^\d*$/.test(value)) return

    const newPin = [...pinInput]
    newPin[index] = value
    setPinInput(newPin)

    if (value && index < 3) {
      pinRefs[index + 1].current?.focus()
    }
  }

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinInput[index] && index > 0) {
      pinRefs[index - 1].current?.focus()
    }
  }

  const handleUnlock = () => {
    const enteredPin = pinInput.join('')
    if (enteredPin === profile.pin) {
      setIsUnlocked(true)
      setShowUnlockModal(false)
      setPinInput(['', '', '', ''])
      setPinError(false)
      showNotification('Sensitive information unlocked!')
    } else {
      setPinError(true)
      setTimeout(() => setPinError(false), 500)
      showNotification('Incorrect PIN. Try again.')
    }
  }

  const handleLock = () => {
    setIsUnlocked(false)
    setEditBank(false)
    setEditPin(false)
    showNotification('Sensitive information locked!')
  }

  const closeUnlockModal = () => {
    setShowUnlockModal(false)
    setPinInput(['', '', '', ''])
    setPinError(false)
  }

  const maskAccountNumber = (number) => {
    const parts = number.split(' ')
    return parts
      .map((part, i) => (i === parts.length - 1 ? part : '••••'))
      .join(' ')
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}
    >
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-pulse">
          <div
            className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
          >
            <Check className="w-5 h-5 text-green-500" />
            <span className={darkMode ? 'text-white' : 'text-gray-800'}>
              {notification}
            </span>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`relative w-full max-w-md rounded-3xl shadow-2xl p-8 transition-all duration-300 ${
              pinError ? 'animate-shake' : ''
            } ${
              darkMode
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700'
                : 'bg-white'
            }`}
          >
            <button
              onClick={closeUnlockModal}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
                  pinError
                    ? 'bg-red-100'
                    : darkMode
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}
              >
                {pinError ? (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <Lock className="w-8 h-8 text-white" />
                )}
              </div>

              <h3
                className={`text-2xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                Enter Your PIN
              </h3>
              <p
                className={`text-sm mb-8 text-center ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Please enter your 4-digit PIN to unlock sensitive information
              </p>

              {/* PIN Input Boxes */}
              <div className="flex gap-4 mb-8">
                {pinInput.map((digit, index) => (
                  <input
                    key={index}
                    ref={pinRefs[index]}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className={`w-14 h-14 text-center text-2xl font-bold rounded-xl transition-all ${
                      pinError
                        ? 'border-2 border-red-500 bg-red-50'
                        : darkMode
                        ? 'bg-gray-700 border-2 border-gray-600 text-white focus:border-indigo-500'
                        : 'bg-gray-50 border-2 border-gray-200 text-gray-800 focus:border-blue-500'
                    } focus:outline-none`}
                  />
                ))}
              </div>

              {pinError && (
                <p className="text-red-600 text-sm mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Incorrect PIN. Please try again.
                </p>
              )}

              <button
                onClick={handleUnlock}
                disabled={pinInput.some((d) => !d)}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  pinInput.some((d) => !d)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                }`}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="
    flex items-center gap-2 px-5 py-2 rounded-xl font-semibold 
    bg-gradient-to-r from-blue-600 to-indigo-600 
    text-white shadow-lg 
    transition-all duration-300 hover:scale-105
  "
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <button
            onClick={() => {
              setDarkMode(!darkMode)
              showNotification(`${darkMode ? 'Light' : 'Dark'} mode activated`)
            }}
            className={`p-3 rounded-xl shadow-lg hover:scale-110 transition-all duration-300 ${
              darkMode
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
            }`}
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Profile Header Card */}
        <div
          className={`rounded-3xl shadow-2xl p-8 mb-6 transition-all duration-500 border-2 backdrop-blur-xl ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50'
              : 'bg-white/80 border-white/70'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                <User className="w-14 h-14 text-white" />
              </div>
              <button
                onClick={() => showNotification('Photo upload coming soon!')}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-all"
              >
                <Camera className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1
                className={`text-4xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                {profile.name}
              </h1>
              <p
                className={`flex items-center justify-center md:justify-start gap-2 mb-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Shield className="w-4 h-4" />
                {isUnlocked
                  ? `Account ${profile.account_number.split(' ').slice(-1)}`
                  : 'Account ••••'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Premium
                </span>
                {isUnlocked && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Unlocked
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Personal Information */}
          <div
            className={`rounded-3xl shadow-2xl p-6 transition-all duration-500 border-2 backdrop-blur-xl ${
              darkMode
                ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50'
                : 'bg-white/80 border-white/70'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-bold flex items-center gap-2 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                <User className="w-5 h-5 text-blue-500" />
                Personal Info
              </h2>
              {!edit && (
                <button
                  onClick={() => setEdit(true)}
                  className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all"
                >
                  <Edit3 className="w-4 h-4 text-blue-500" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div
                className={`p-4 rounded-xl transition-all ${
                  darkMode ? 'bg-gray-700/50' : 'bg-blue-50'
                }`}
              >
                <label
                  className={`text-xs font-semibold mb-1 block ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Full Name
                </label>
                {edit ? (
                  <input
                    className={`w-full text-lg font-semibold px-3 py-2 rounded-lg transition-all ${
                      darkMode
                        ? 'bg-gray-800 text-white border border-gray-600'
                        : 'bg-white text-gray-800 border border-blue-200'
                    }`}
                    name="name"
                    value={profile.name}
                    onChange={handleInput}
                  />
                ) : (
                  <p
                    className={`text-lg font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {profile.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div
                className={`p-4 rounded-xl transition-all ${
                  darkMode ? 'bg-gray-700/50' : 'bg-blue-50'
                }`}
              >
                <label
                  className={`text-xs font-semibold mb-1 block ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <Smartphone className="w-3 h-3 inline mr-1" />
                  Phone Number
                </label>
                {edit ? (
                  <input
                    className={`w-full text-lg font-semibold px-3 py-2 rounded-lg transition-all ${
                      darkMode
                        ? 'bg-gray-800 text-white border border-gray-600'
                        : 'bg-white text-gray-800 border border-blue-200'
                    }`}
                    name="phone"
                    value={profile.phone}
                    onChange={handleInput}
                  />
                ) : (
                  <p
                    className={`text-lg font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {profile.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div
                className={`p-4 rounded-xl transition-all ${
                  darkMode ? 'bg-gray-700/50' : 'bg-blue-50'
                }`}
              >
                <label
                  className={`text-xs font-semibold mb-1 block ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <Mail className="w-3 h-3 inline mr-1" />
                  Email Address
                </label>
                {edit ? (
                  <input
                    className={`w-full text-lg font-semibold px-3 py-2 rounded-lg transition-all ${
                      darkMode
                        ? 'bg-gray-800 text-white border border-gray-600'
                        : 'bg-white text-gray-800 border border-blue-200'
                    }`}
                    name="email"
                    value={profile.email}
                    onChange={handleInput}
                  />
                ) : (
                  <p
                    className={`text-lg font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {profile.email}
                  </p>
                )}
              </div>

              {edit && (
                <button
                  onClick={handleSaveProfile}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              )}
            </div>
          </div>

          {/* Bank Details */}
          <div
            className={`rounded-3xl shadow-2xl p-6 transition-all duration-500 border-2 backdrop-blur-xl ${
              darkMode
                ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50'
                : 'bg-white/80 border-white/70'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-bold flex items-center gap-2 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                <CreditCard className="w-5 h-5 text-yellow-500" />
                Bank Details
              </h2>
              {isUnlocked && !editBank && (
                <button
                  onClick={() => setEditBank(true)}
                  className="p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition-all"
                >
                  <Edit3 className="w-4 h-4 text-yellow-500" />
                </button>
              )}
            </div>

            {!isUnlocked ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6 shadow-xl">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h3
                  className={`text-xl font-bold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Sensitive Information
                </h3>
                <p
                  className={`text-sm text-center mb-6 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Your bank details are protected. Unlock to view and edit.
                </p>
                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Unlock className="w-5 h-5" />
                  Unlock Sensitive Info
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Account Number */}
                <div
                  className={`p-4 rounded-xl transition-all ${
                    darkMode ? 'bg-gray-700/50' : 'bg-yellow-50'
                  }`}
                >
                  <label
                    className={`text-xs font-semibold mb-1 block ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Account Number
                  </label>
                  {editBank ? (
                    <input
                      className={`w-full text-lg font-semibold px-3 py-2 rounded-lg transition-all ${
                        darkMode
                          ? 'bg-gray-800 text-white border border-gray-600'
                          : 'bg-white text-gray-800 border border-yellow-200'
                      }`}
                      name="account_number"
                      value={profile.account_number}
                      onChange={handleInput}
                    />
                  ) : (
                    <p
                      className={`text-lg font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {profile.account_number}
                    </p>
                  )}
                </div>

                {/* IFSC */}
                <div
                  className={`p-4 rounded-xl transition-all ${
                    darkMode ? 'bg-gray-700/50' : 'bg-yellow-50'
                  }`}
                >
                  <label
                    className={`text-xs font-semibold mb-1 block ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    IFSC Code
                  </label>
                  {editBank ? (
                    <input
                      className={`w-full text-lg font-semibold px-3 py-2 rounded-lg transition-all ${
                        darkMode
                          ? 'bg-gray-800 text-white border border-gray-600'
                          : 'bg-white text-gray-800 border border-yellow-200'
                      }`}
                      name="ifsc"
                      value={profile.ifsc}
                      onChange={handleInput}
                    />
                  ) : (
                    <p
                      className={`text-lg font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {profile.ifsc}
                    </p>
                  )}
                </div>

                {/* Bank Name */}
                <div
                  className={`p-4 rounded-xl transition-all ${
                    darkMode ? 'bg-gray-700/50' : 'bg-yellow-50'
                  }`}
                >
                  <label
                    className={`text-xs font-semibold mb-1 block ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Bank Name
                  </label>
                  {editBank ? (
                    <input
                      className={`w-full text-lg font-semibold px-3 py-2 rounded-lg transition-all ${
                        darkMode
                          ? 'bg-gray-800 text-white border border-gray-600'
                          : 'bg-white text-gray-800 border border-yellow-200'
                      }`}
                      name="bank"
                      value={profile.bank}
                      onChange={handleInput}
                    />
                  ) : (
                    <p
                      className={`text-lg font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {profile.bank}
                    </p>
                  )}
                </div>

                {editBank && (
                  <button
                    onClick={handleSaveBank}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Bank Details
                  </button>
                )}

                <button
                  onClick={handleLock}
                  className={`w-full py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Lock Sensitive Info
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div
          className={`rounded-3xl shadow-2xl p-6 mb-6 transition-all duration-500 border-2 backdrop-blur-xl ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50'
              : 'bg-white/80 border-white/70'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-xl font-bold flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              <Lock className="w-5 h-5 text-pink-500" />
              Security
            </h2>
            {isUnlocked && !editPin && (
              <button
                onClick={() => setEditPin(true)}
                className="p-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 transition-all"
              >
                <Edit3 className="w-4 h-4 text-pink-500" />
              </button>
            )}
          </div>

          {!isUnlocked ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4 shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <p
                className={`text-sm text-center ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Unlock to view and change your PIN
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl transition-all ${
                  darkMode ? 'bg-gray-700/50' : 'bg-pink-50'
                }`}
              >
                <label
                  className={`text-xs font-semibold mb-1 block ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Bank PIN
                </label>
                <div className="flex items-center gap-2">
                  {editPin ? (
                    <input
                      className={`flex-1 text-lg font-semibold px-3 py-2 rounded-lg transition-all ${
                        darkMode
                          ? 'bg-gray-800 text-white border border-gray-600'
                          : 'bg-white text-gray-800 border border-pink-200'
                      }`}
                      name="pin"
                      value={profile.pin}
                      type={showPin ? 'text' : 'password'}
                      onChange={handleInput}
                      maxLength={4}
                    />
                  ) : (
                    <p
                      className={`flex-1 text-lg font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {showPin ? profile.pin : '••••'}
                    </p>
                  )}
                  <button
                    onClick={() => setShowPin(!showPin)}
                    className={`p-2 rounded-lg transition-all ${
                      darkMode
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {showPin ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              {editPin && (
                <button
                  onClick={handleSavePin}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Change PIN
                </button>
              )}
            </div>
          )}
        </div>

        {/* Preferences */}
        <div
          className={`rounded-3xl shadow-2xl p-6 mb-6 transition-all duration-500 border-2 backdrop-blur-xl ${
            darkMode
              ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50'
              : 'bg-white/80 border-white/70'
          }`}
        >
          <h2
            className={`text-xl font-bold flex items-center gap-2 mb-6 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            <Globe className="w-5 h-5 text-purple-500" />
            Preferences
          </h2>
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl transition-all ${
                darkMode ? 'bg-gray-700/50' : 'bg-purple-50'
              }`}
            >
              <label
                className={`text-xs font-semibold mb-2 block ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Language
              </label>
              <select
                name="language"
                value={profile.language}
                onChange={(e) => {
                  handleInput(e)
                  showNotification(`Language changed to ${e.target.value}`)
                }}
                className={`w-full text-lg font-semibold px-3 py-2 rounded-lg transition-all ${
                  darkMode
                    ? 'bg-gray-800 text-white border border-gray-600'
                    : 'bg-white text-gray-800 border border-purple-200'
                }`}
              >
                <option value="English">English</option>
                <option value="Hindi">हिंदी</option>
                <option value="Marathi">मराठी</option>
                <option value="Bengali">বাংলা</option>
              </select>
            </div>
            <div
              className={`p-4 rounded-xl transition-all ${
                darkMode ? 'bg-gray-700/50' : 'bg-purple-50'
              }`}
            >
              <label
                className={`text-xs font-semibold mb-2 flex items-center gap-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Bell className="w-3 h-3" /> Notifications
              </label>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Push Notifications
                </span>
                <button
                  onClick={() => {
                    setNotificationsEnabled(!notificationsEnabled)
                    showNotification(
                      `Notifications ${
                        !notificationsEnabled ? 'enabled' : 'disabled'
                      }`
                    )
                  }}
                  className="relative inline-flex items-center cursor-pointer"
                >
                  <div
                    className={`w-11 h-6 rounded-full transition-all ${
                      notificationsEnabled
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${
                        notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div>
          <button
            onClick={handleBack}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-10px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(10px);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  )
}

export default Profile
