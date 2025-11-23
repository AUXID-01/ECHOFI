import { useState } from 'react'
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  Globe,
  Shield,
  Palette,
  Zap,
  Check,
} from 'lucide-react'

const ToggleSwitch = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={onChange}
    />
    <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-600 transition-all duration-300 shadow-inner"></div>
    <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-all duration-300 peer-checked:left-8 peer-checked:shadow-lg"></div>
  </label>
)

const SettingCard = ({
  icon,
  title,
  description,
  children,
  color,
  darkMode,
}) => {
  const Icon = icon
  return (
    <div
      className={`group ${
        darkMode
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
          : 'bg-white border-gray-200 hover:border-blue-300'
      } border-2 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3
              className={`font-bold text-lg mb-1 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              {title}
            </h3>
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {description}
            </p>
          </div>
        </div>
        <div className="ml-4">{children}</div>
      </div>
    </div>
  )
}

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [language, setLanguage] = useState('English')
  const [saved, setSaved] = useState(false)

  const handleBack = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // In real app, handle navigation here: useNavigate()
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      } transition-all duration-500 px-4 py-8`}
    >
      <div className="max-w-3xl mx-auto">
        {saved && (
          <div className="fixed top-8 right-8 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce z-50">
            <Check className="w-5 h-5" />
            <span className="font-semibold">Settings saved!</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 ${
              darkMode
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-blue-600 hover:text-blue-700'
            } font-semibold mb-6 transition-all duration-300 hover:gap-3 group`}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div
            className={`rounded-3xl shadow-2xl p-8 border-2 ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-4 mb-2">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1
                  className={`text-4xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Settings
                </h1>
                <p
                  className={`text-lg mt-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Customize your experience
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Setting Cards */}
        <div className="space-y-4">
          <SettingCard
            icon={darkMode ? Moon : Sun}
            title="Theme"
            description={`${
              darkMode ? 'Dark' : 'Light'
            } mode is currently active`}
            color="from-indigo-500 to-purple-600"
            darkMode={darkMode}
          >
            <ToggleSwitch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
          </SettingCard>

          <SettingCard
            icon={Bell}
            title="Notifications"
            description="Receive updates and alerts"
            color="from-blue-500 to-cyan-600"
            darkMode={darkMode}
          >
            <ToggleSwitch
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
          </SettingCard>

          <SettingCard
            icon={Zap}
            title="Auto Save"
            description="Automatically save your progress"
            color="from-yellow-500 to-orange-600"
            darkMode={darkMode}
          >
            <ToggleSwitch
              checked={autoSave}
              onChange={() => setAutoSave(!autoSave)}
            />
          </SettingCard>

          {/* Language */}
          <div
            className={`${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                : 'bg-white border-gray-200 hover:border-blue-300'
            } border-2 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group`}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3
                  className={`font-bold text-lg mb-1 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Language
                </h3>
                <p
                  className={`text-sm mb-3 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Choose your preferred language
                </p>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border-2 font-medium transition-all duration-300 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-gray-50 border-gray-300 text-gray-800 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                  <option>Bengali</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div
            className={`${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            } border-2 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group`}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3
                  className={`font-bold text-lg mb-1 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  Privacy & Security
                </h3>
                <p
                  className={`text-sm mb-3 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Manage your privacy settings
                </p>
                <button
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    darkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  View Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={handleBack}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700"
          >
            Save & Return to Dashboard
          </button>
        </div>

        {/* Footer */}
        <div
          className={`mt-6 p-6 rounded-2xl text-center ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'
          } shadow-lg border-2 ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <p className="text-sm font-medium">
            🎨 More customization options coming soon
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings
