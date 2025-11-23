import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic,
  Shield,
  Zap,
  Smartphone,
  User,
  Globe,
  CreditCard,
  ChevronRight,
  Info,
} from 'lucide-react'

const Landing = () => {
  const [isHovering, setIsHovering] = useState(false)
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/register')
  }

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'Voice Commands',
      description: 'Control your banking with natural voice interactions.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Safe',
      description: 'Bank-grade encryption keeps your data protected.',
      color: 'from-green-500 to-teal-600',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Complete transactions in seconds, hands-free.',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: <User className="w-6 h-6" />,
      title: 'Personalized Experience',
      description: 'Adaptive dashboard and multilingual UI for every user.',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Multiple Payments',
      description: 'UPI, bills, loans, direct banking—all accessible by voice.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Access Anywhere',
      description: 'Mobile-first responsive design. Works on any device.',
      color: 'from-blue-400 to-cyan-400',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Main Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Icon */}
          <div className="mb-8 inline-block">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-3xl shadow-2xl">
              <Mic className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            EchoFi Voice Banking
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-4 font-medium">
            Bank hands-free with AI-powered voice assistance
          </p>

          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Experience the future of banking—every transaction, balance check,
            and transfer is just a voice command away.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleGetStarted}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 inline-flex items-center"
          >
            <span>Get Started</span>
            <ChevronRight
              className={`ml-2 w-5 h-5 transition-transform duration-300 ${
                isHovering ? 'translate-x-1' : ''
              }`}
            />
          </button>

          <p className="mt-4 text-sm text-gray-500">
            No credit card required &bull; Free to start
          </p>

          {/* Features Grid - expanded */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-start"
              >
                <div
                  className={`bg-gradient-to-r ${feature.color} text-white p-4 rounded-xl inline-block mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Animated trust/UX indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <span className="text-sm">Works on Any Device</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Instant Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm">Multi-language</span>
            </div>
          </div>

          {/* Onboarding/FAQ Blurb */}
          <div className="mt-12 max-w-xl mx-auto p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-blue-800">
              Need help or a demo? Visit our{' '}
              <button
                className="underline text-blue-600"
                onClick={() => navigate('/help')}
              >
                Help Center
              </button>
              . Choose your language and theme after login!
            </span>
          </div>
        </div>
      </div>

      {/* Animated Bottom Decoration */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none opacity-25">
        <svg viewBox="0 0 1440 320" className="w-full">
          <path
            fill="url(#gradient)"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

export default Landing
