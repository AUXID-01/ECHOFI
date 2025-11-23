// pages/Schemes.jsx
import { Percent, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const schemes = [
  { id: 1, name: 'Senior Citizen FD', rate: '7.5%' },
  { id: 2, name: 'Sukanya Samriddhi Yojana', rate: '8.1%' },
]

const Schemes = () => {
  const navigate = useNavigate()

  const handleExplore = (scheme) => alert(`Exploring scheme: ${scheme.name}`)

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 px-4 py-2 mb-6 rounded-xl bg-white shadow hover:shadow-md hover:scale-[1.02] transition-all text-blue-600 font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      {/* Page Title */}
      <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Bank Schemes
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="p-6 rounded-2xl border border-indigo-200 bg-indigo-50/60 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold">{scheme.name}</h4>
              <span className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-lg text-sm font-bold">
                {scheme.rate}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              High-return secure investment plan for long-term financial growth.
            </p>

            {/* Button */}
            <button
              onClick={() => handleExplore(scheme)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              Explore Scheme
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Schemes
