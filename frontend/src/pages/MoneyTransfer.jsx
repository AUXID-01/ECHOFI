import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send,
  User,
  CreditCard,
  ArrowRight,
  FileText,
  ArrowLeft,
} from 'lucide-react'

const MoneyTransfer = () => {
  const [recipient_account, setRecipientAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const source_account = '1286842430453'
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    navigate('/payment-confirmation', {
      state: {
        source_account,
        recipient_account,
        amount,
        description,
        status: 'success',
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all font-semibold text-blue-600"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* HEADER */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-indigo-600 to-blue-600 shadow-2xl text-white mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-10 blur-3xl"></div>
          <div className="relative flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl shadow-lg">
              <Send className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Send Money</h1>
              <p className="opacity-80">Secure and fast fund transfers</p>
            </div>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Recipient Account */}
            <div>
              <label className="font-medium mb-1 block">
                Recipient Account
              </label>
              <div className="flex items-center border rounded-xl px-4 py-3 bg-gray-50 focus-within:bg-white transition">
                <User className="w-5 h-5 text-gray-500 mr-3" />
                <input
                  className="w-full outline-none bg-transparent"
                  placeholder="Enter account number"
                  value={recipient_account}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="font-medium mb-1 block">Amount</label>
              <div className="flex items-center border rounded-xl px-4 py-3 bg-gray-50 focus-within:bg-white transition">
                <CreditCard className="w-5 h-5 text-gray-500 mr-3" />
                <input
                  type="number"
                  className="w-full outline-none bg-transparent"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-medium mb-1 block">Description</label>
              <div className="flex items-center border rounded-xl px-4 py-3 bg-gray-50 focus-within:bg-white transition">
                <FileText className="w-5 h-5 text-gray-500 mr-3" />
                <input
                  className="w-full outline-none bg-transparent"
                  placeholder="Optional note"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MoneyTransfer
