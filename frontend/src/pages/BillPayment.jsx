import { useState, useEffect } from 'react'
import {
  CreditCard,
  Flashlight,
  Zap,
  Globe,
  ArrowRight,
  FileText,
} from 'lucide-react'

const UI_BILLERS = [
  {
    uiId: 1,
    name: 'Electricity',
    bill_type: 'electricity',
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    uiId: 2,
    name: 'Water',
    bill_type: 'water',
    icon: <Flashlight className="w-6 h-6 text-blue-500" />,
    color: 'from-blue-400 to-blue-600',
  },
  {
    uiId: 3,
    name: 'Internet',
    bill_type: 'internet',
    icon: <Globe className="w-6 h-6 text-purple-500" />,
    color: 'from-purple-400 to-purple-600',
  },
]

const BillPayment = () => {
  const [backendBills, setBackendBills] = useState([])
  const [selected, setSelected] = useState(UI_BILLERS[0].uiId)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('Electricity Bill')

  // ------------------------------------------------------
  // 1️⃣ Load actual bills from backend
  // ------------------------------------------------------
  useEffect(() => {
    const loadBills = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/v1/bill/me',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        )

        const data = await response.json()
        setBackendBills(data)

        // Set default amount from backend bill
        const ui = UI_BILLERS[0]
        const serverBill = data.find((b) => b.bill_type === ui.bill_type)
        if (serverBill) setAmount(serverBill.amount)
      } catch (err) {
        console.error('Failed to load bills', err)
      }
    }

    loadBills()
  }, [])

  // ------------------------------------------------------
  // 2️⃣ Handle biller selection
  // ------------------------------------------------------
  const handleChangeBiller = (e) => {
    const uiId = Number(e.target.value)
    const uiBiller = UI_BILLERS.find((b) => b.uiId === uiId)

    setSelected(uiId)
    setDescription(`${uiBiller.name} Bill`)

    const serverBill = backendBills.find(
      (b) => b.bill_type === uiBiller.bill_type
    )

    if (serverBill) setAmount(serverBill.amount)
  }

  // ------------------------------------------------------
  // 3️⃣ Pay Bill - CALL BACKEND API
  // ------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()

    const uiBiller = UI_BILLERS.find((b) => b.uiId === selected)
    const serverBill = backendBills.find(
      (b) => b.bill_type === uiBiller.bill_type
    )

    if (!serverBill) {
      alert('This bill does not exist for the user.')
      return
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/bill/pay/${serverBill.id}?otp_token=MOCK_OTP_SUCCESS`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )

      if (!res.ok) {
        const err = await res.json()
        alert('Payment failed: ' + err.detail)
        return
      }

      const result = await res.json()
      alert(
        `Payment Successful!\nTransaction ID: ${result.transaction_id}\nAmount: ₹${serverBill.amount}`
      )
    } catch (error) {
      alert('Something went wrong')
      console.error(error)
    }
  }

  const current = UI_BILLERS.find((b) => b.uiId === selected)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Gradient Header */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl text-white mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-10 blur-3xl"></div>
          <div className="relative flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Bill Payment</h1>
              <p className="opacity-80">
                Quick utility and recurring bill payments
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
          {/* Biller Selector */}
          <label className="block font-medium mb-2">Select Biller</label>
          <div className="relative mb-6">
            <select
              className="w-full px-4 py-3 border rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              value={selected}
              onChange={handleChangeBiller}
            >
              {UI_BILLERS.map((b) => (
                <option key={b.uiId} value={b.uiId}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Card */}
          <div className="p-5 rounded-2xl bg-white border shadow hover:shadow-xl transition-all mb-8 flex items-center justify-between">
            <div
              className={`p-4 rounded-xl bg-gradient-to-br ${current.color} shadow-lg`}
            >
              {current.icon}
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{current.name}</p>
              <p className="text-gray-500 text-sm">Amount: ₹{amount}</p>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium mb-1">Amount</label>
              <input
                type="number"
                className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white transition"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Description</label>
              <input
                type="text"
                className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white transition"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Pay Now Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white text-lg font-semibold rounded-xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Pay Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BillPayment
