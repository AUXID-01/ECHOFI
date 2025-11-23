import { useState } from 'react'
import {
  ArrowLeft,
  Mic,
  Send,
  User,
  Moon,
  CreditCard,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Info,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Help = () => {
  const [expandedFaq, setExpandedFaq] = useState(null)
  const navigate = useNavigate()

  const handleBack = () => navigate('/dashboard')

  const voiceCommands = [
    {
      icon: <CreditCard className="w-5 h-5" />,
      command: 'Check balance',
      description: 'View your current account balance and available funds',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Send className="w-5 h-5" />,
      command: 'Transfer money',
      description: 'Initiate a fund transfer to another account',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      command: 'Show transactions',
      description: 'View your recent transaction history',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <User className="w-5 h-5" />,
      command: 'Open profile',
      description: 'Access and update your account details',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      command: 'Pay bills',
      description: 'Pay bills like electricity, water, and more',
      color: 'from-yellow-500 to-orange-600',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      command: 'Privacy settings',
      description: 'Adjust your privacy and notification preferences',
      color: 'from-pink-500 to-red-600',
    },
  ]

  const faqs = [
    {
      question: 'How do I activate voice commands?',
      answer:
        'Click the microphone button on your dashboard and allow microphone access when prompted. Then simply speak your command clearly.',
    },
    {
      question: 'Is voice banking secure?',
      answer:
        'Yes! We use bank-grade encryption and voice authentication to ensure all your transactions are secure. Your voice commands are processed securely and never stored.',
    },
    {
      question: "What if voice recognition doesn't work?",
      answer:
        "Ensure you're in a quiet environment and speaking clearly. You can also use the traditional button-based navigation as a backup.",
    },
    {
      question: 'Can I use voice commands in dark mode?',
      answer:
        'Absolutely! Dark mode is available in settings and works seamlessly with all voice commands for comfortable night-time banking.',
    },
    {
      question: 'How do I update my profile information?',
      answer:
        'Navigate to the Profile page from your dashboard, or simply say "Open profile" using voice commands to update your details.',
    },
    {
      question: 'How can I contact support?',
      answer:
        'We’re available 24/7 by phone, email, or live chat right from this page below.',
    },
  ]

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Help & Support
          </h1>
          <p className="text-gray-600">
            Everything you need to know about EchoFi Voice Banking
          </p>
        </div>

        {/* Voice Commands Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl mr-3">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Voice Commands
              </h2>
              <p className="text-gray-600 text-sm">
                Quick reference for hands-free banking
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {voiceCommands.map((cmd, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start">
                  <div
                    className={`bg-gradient-to-r ${cmd.color} text-white p-2 rounded-lg mr-3 mt-1`}
                  >
                    {cmd.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">
                      "{cmd.command}"
                    </p>
                    <p className="text-sm text-gray-600">{cmd.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center">
            <Info className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              <strong>Pro Tip:</strong> Speak naturally and clearly. Our AI
              understands many ways to say the same thing!
            </span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">
                    {faq.question}
                  </span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-gray-600 bg-gray-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Tips</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start p-4 bg-purple-50 rounded-xl">
              <User className="w-5 h-5 text-purple-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 mb-1">
                  Update Your Profile
                </p>
                <p className="text-sm text-gray-600">
                  Keep your contact information current for security alerts
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-indigo-50 rounded-xl">
              <Moon className="w-5 h-5 text-indigo-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 mb-1">
                  Try Dark Mode
                </p>
                <p className="text-sm text-gray-600">
                  Enable dark mode in settings for comfortable night viewing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
          <p className="mb-6 text-blue-100">
            Our support team is here to assist you 24/7
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all duration-300">
              <Phone className="w-5 h-5 mr-2" />
              <span className="font-semibold">Call Us</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all duration-300">
              <Mail className="w-5 h-5 mr-2" />
              <span className="font-semibold">Email</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all duration-300">
              <MessageCircle className="w-5 h-5 mr-2" />
              <span className="font-semibold">Live Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
