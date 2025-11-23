import { useEffect } from 'react'

const Toast = ({ message, type = 'info', onClose, duration = 2500 }) => {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [onClose, duration])

  const bg =
    type === 'error'
      ? 'bg-red-600'
      : type === 'success'
      ? 'bg-green-600'
      : 'bg-blue-600'

  return (
    <div
      className={`fixed bottom-12 right-6 z-50 px-6 py-3 rounded shadow-xl text-white ${bg}`}
    >
      {message}
    </div>
  )
}

export default Toast
