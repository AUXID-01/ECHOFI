import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const SessionLock = () => {
  const [pin, setPin] = useState('')
  const navigate = useNavigate()

  const handleUnlock = () => {
    if (pin === '1234') navigate('/dashboard')
    // You can expand with biometric/MFA later
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Session Locked</h2>
        <input
          className="w-full border px-4 py-3 rounded text-center text-2xl tracking-widest"
          placeholder="Enter PIN (1234)"
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          maxLength={4}
        />
        <button
          className="mt-6 w-full py-3 bg-blue-600 text-white rounded font-semibold"
          onClick={handleUnlock}
          disabled={pin.length < 4}
        >
          Unlock
        </button>
        <div className="mt-2 text-gray-500 text-center text-sm">
          This session is protected for security.
        </div>
      </div>
    </div>
  )
}

export default SessionLock
