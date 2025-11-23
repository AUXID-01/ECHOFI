import { useState } from 'react'

const OTPVerification = ({
  onSuccess,
  onResend,
  hint = 'Enter the 4-digit OTP',
}) => {
  // Schema-compliant: use 'code' for OTP
  const [code, setCode] = useState('')

  const handleVerify = () => {
    // For production: call onSuccess(code)
    if (code === '1234' && onSuccess) onSuccess(code)
  }

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4">OTP Verification</h2>
      <input
        className="w-full border px-4 py-3 rounded text-center text-2xl tracking-widest"
        placeholder="••••"
        value={code}
        maxLength={4}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
      />
      <div className="mt-2 text-sm text-gray-500">{hint}</div>
      <button
        className="mt-4 w-full py-2 bg-blue-600 text-white rounded"
        onClick={handleVerify}
        disabled={code.length < 4}
      >
        Verify
      </button>
      <button className="mt-2 text-blue-600" onClick={onResend}>
        Resend OTP
      </button>
    </div>
  )
}

export default OTPVerification
