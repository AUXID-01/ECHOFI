import { useState } from 'react'

// Demo source account, in real app get from user/account state:
const source_account = '1286842430453'

const UPIPayment = () => {
  const [recipient_account, setRecipientAccount] = useState('') // UPI ID as recipient_account
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('UPI Payment')

  const handlePay = () => {
    // Backend schema payload
    const payload = {
      source_account,
      recipient_account,
      amount,
      description,
    }
    alert('Paid! (Demo) \n' + JSON.stringify(payload, null, 2))
    // For actual, do: POST /upi-payment { source_account, recipient_account, amount, description }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">UPI/QR Payment</h2>
      <div className="space-y-4">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="UPI ID"
          value={recipient_account}
          onChange={(e) => setRecipientAccount(e.target.value)}
        />
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          className="w-full py-2 bg-purple-600 text-white rounded shadow"
          onClick={handlePay}
        >
          Pay
        </button>
      </div>
    </div>
  )
}

export default UPIPayment
