import { useLocation, useNavigate } from 'react-router-dom'

const PaymentConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const info = location.state || {}

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Payment Confirmation</h2>

      <div className="mb-3">
        <strong>Recipient Account:</strong> {info.recipient_account || '—'}
      </div>
      <div className="mb-3">
        <strong>Amount:</strong> {info.amount ? `₹${info.amount}` : '—'}
      </div>
      {info.description && (
        <div className="mb-3">
          <strong>Description:</strong> {info.description}
        </div>
      )}
      {/* Optional: Transaction type display (if sent from MoneyTransfer or backend) */}
      {info.transaction_type && (
        <div className="mb-3">
          <strong>Transaction Type:</strong> {info.transaction_type}
        </div>
      )}
      <div className="mb-6">
        <strong>Status:</strong>{' '}
        <span
          className={`font-semibold ${
            info.status === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {info.status === 'success' ? 'Success' : 'Failed'}
        </span>
      </div>
      <button
        onClick={() => navigate('/dashboard')}
        className="w-full py-2 bg-blue-600 text-white rounded"
      >
        Back to Dashboard
      </button>
    </div>
  )
}

export default PaymentConfirmation
