import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Receipt,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Mic,
  Search,
  Calendar,
} from 'lucide-react'

const allTransactions = [
  {
    id: 1,
    transaction_type: 'debit',
    amount: 500,
    recipient_account: 'RAHUL1234',
    status: 'completed',
    description: 'Transfer to Rahul',
    initiated_at: '2025-11-10T09:15:00Z',
  },
  {
    id: 2,
    transaction_type: 'credit',
    amount: 22000,
    recipient_account: '',
    status: 'completed',
    description: 'Salary credited',
    initiated_at: '2025-11-05T10:00:00Z',
  },
  {
    id: 3,
    transaction_type: 'debit',
    amount: 1200,
    recipient_account: 'ELEC6789',
    status: 'completed',
    description: 'Paid electricity bill',
    initiated_at: '2025-11-02T14:25:00Z',
  },
  {
    id: 4,
    transaction_type: 'debit',
    amount: 431,
    recipient_account: 'ZOMATO123',
    status: 'completed',
    description: 'UPI: Zomato',
    initiated_at: '2025-11-01T12:15:00Z',
  },
  {
    id: 5,
    transaction_type: 'credit',
    amount: 1000,
    recipient_account: 'ARYAN9988',
    status: 'completed',
    description: 'UPI: Received from Aryan',
    initiated_at: '2025-10-30T18:35:00Z',
  },
]

const Transactions = () => {
  const navigate = useNavigate()

  const [type, setType] = useState('all')
  const [date, setDate] = useState('')
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState(allTransactions)

  const handleBack = () => navigate('/dashboard')

  const handleFilter = (e) => {
    e.preventDefault()
    let data = [...allTransactions]

    if (type !== 'all') data = data.filter((t) => t.transaction_type === type)
    if (date) data = data.filter((t) => t.initiated_at.slice(0, 10) === date)
    if (search)
      data = data.filter((t) =>
        t.description.toLowerCase().includes(search.toLowerCase())
      )

    setFiltered(data)
  }

  const isCredit = (tx) => tx.transaction_type === 'credit'

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="
    flex items-center gap-2 px-5 py-2 mb-6
    rounded-xl font-semibold 
    bg-gradient-to-r from-blue-600 to-indigo-600 
    text-white shadow-lg
    transition-all hover:scale-105
  "
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl text-white mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-10 blur-3xl"></div>
          <div className="relative flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl shadow-lg">
              <Receipt className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Transactions</h1>
              <p className="opacity-80">Your payments, credits and history</p>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <form
          onSubmit={handleFilter}
          className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-gray-100"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Transaction Type */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>

            {/* Date */}
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full outline-none"
              />
            </div>

            {/* Search */}
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Search className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl shadow-lg transition-all"
          >
            Apply Filters
          </button>
        </form>

        {/* Voice Search Banner */}
        <div className="flex items-center gap-3 bg-blue-50/70 border border-blue-100 p-4 rounded-xl shadow mb-8">
          <Mic className="w-6 h-6 text-blue-600" />
          <p className="text-blue-800 text-sm">
            Try saying:{' '}
            <span className="font-semibold">
              “Show transactions above 2000”
            </span>
          </p>
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No transactions found.
            </p>
          )}

          {filtered.map((tx) => (
            <div
              key={tx.id}
              className={`p-5 rounded-2xl shadow-xl border backdrop-blur-lg transition-all hover:scale-[1.01] flex justify-between items-center ${
                isCredit(tx)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div>
                <p className="text-sm text-gray-500">
                  {formatDate(tx.initiated_at)}
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {tx.description}
                </p>
                {tx.recipient_account && (
                  <p className="text-xs text-gray-500">
                    To/From: {tx.recipient_account}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isCredit(tx) ? (
                  <TrendingUp className="w-7 h-7 text-green-600" />
                ) : (
                  <TrendingDown className="w-7 h-7 text-red-600" />
                )}

                <p
                  className={`text-xl font-bold ${
                    isCredit(tx) ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isCredit(tx)
                    ? `+₹${tx.amount.toLocaleString()}`
                    : `-₹${tx.amount.toLocaleString()}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Summary */}
        <div className="mt-8 p-4 text-center bg-white rounded-xl shadow border border-gray-100 text-gray-700">
          Showing {filtered.length} of {allTransactions.length} transactions
        </div>

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-xl hover:scale-105 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default Transactions
