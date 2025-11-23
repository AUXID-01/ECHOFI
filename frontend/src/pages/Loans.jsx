import { Calendar, Banknote, ArrowRight, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const loans = [
  {
    id: 1,
    type: 'Home Loan',
    emi: '₹15,000',
    balance: '₹5,00,000',
    due: '2025-12-01',
  },
  {
    id: 2,
    type: 'Education Loan',
    emi: '₹6,000',
    balance: '₹90,000',
    due: '2025-12-05',
  },
]

const Loans = () => {
  const navigate = useNavigate()

  const handlePayEMI = (loan) => alert(`Paying EMI for ${loan.type}`)
  const handleViewLoan = (loan) => alert(`Viewing details for ${loan.type}`)

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
        Active Loans
      </h2>

      <div className="grid gap-6">
        {loans.map((loan) => (
          <div
            key={loan.id}
            className="p-6 rounded-2xl border border-gray-200 bg-white shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all"
          >
            {/* Loan Title */}
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-2xl font-bold">{loan.type}</h4>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold">
                Due: {loan.due}
              </span>
            </div>

            {/* Loan info */}
            <div className="grid grid-cols-2 gap-4 text-gray-700 mb-6">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-green-600" />
                <span>EMI: {loan.emi}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Balance: {loan.balance}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handlePayEMI(loan)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                Pay EMI
              </button>

              <button
                onClick={() => handleViewLoan(loan)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-1"
              >
                View Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Apply Button */}
      <div className="text-center mt-10">
        <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all text-lg font-bold">
          Apply for a New Loan
        </button>
      </div>
    </div>
  )
}

export default Loans
