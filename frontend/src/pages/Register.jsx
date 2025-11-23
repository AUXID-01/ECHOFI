// Register.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, Eye, EyeOff, User, Smartphone, Mail, Lock } from 'lucide-react'

const API = "http://localhost:8000/api/v1"

const Register = () => {
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const validateFields = () => {
    let tempErrors = {}
    if (!username.trim()) tempErrors.username = 'Name is required'
    if (!phone.trim()) tempErrors.phone = 'Phone is required'
    if (!/^\+?\d{10,}$/.test(phone.trim()))
      tempErrors.phone = 'Enter a valid phone number'
    if (!email.trim()) tempErrors.email = 'Email is required'
    if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Enter a valid email'
    if (!password.trim()) tempErrors.password = 'Password is required'
    if (password.length && password.length < 6)
      tempErrors.password = 'At least 6 characters'

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validateFields()) return

    setIsLoading(true)

    try {
      const safePassword = password.slice(0, 72)

      const payload = {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: "customer",
        password: safePassword,
      }

      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 422) {
          setServerError('Invalid data provided. Please check your fields.')
        } else if (data.detail) {
          setServerError(data.detail)
        } else {
          setServerError('Registration failed. Please try again.')
        }
        setIsLoading(false)
        return
      }

      // 🔥 AUTO LOGIN AFTER SUCCESSFUL REGISTRATION
      try {
        const loginRes = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: email,   // login using email
            password: safePassword,
          })
        })

        const loginData = await loginRes.json()

        if (loginRes.ok) {
          localStorage.setItem("token", loginData.access_token)
          navigate("/dashboard") // 🚀 redirect to dashboard
          return
        }
      } catch (err) {
        console.error("Auto login failed:", err)
      }

      // fallback if auto-login fails
      navigate('/login')

    } catch (err) {
      console.error('Register error:', err)
      setServerError('Network error. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const goToLogin = () => navigate('/login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-3xl shadow-2xl mb-4">
            <Mic className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 text-center drop-shadow-lg">
            Create your EchoFi Account
          </h1>
          <p className="text-lg text-gray-600 text-center">
            Bank hands-free, securely, with AI-powered voice assistance.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-md border border-white/50 shadow-2xl rounded-3xl px-8 pt-8 pb-7 space-y-5"
        >
          {serverError && (
            <div className="text-red-600 text-sm mb-2 text-center font-semibold">
              {serverError}
            </div>
          )}

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              className="w-full border border-blue-100 px-10 py-3 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              placeholder="Full Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            {errors.username && (
              <div className="text-red-500 text-sm mt-1">{errors.username}</div>
            )}
          </div>

          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              className="w-full border border-blue-100 px-10 py-3 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              placeholder="Phone (e.g. +9199... or 999...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              type="tel"
            />
            {errors.phone && (
              <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
            )}
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              className="w-full border border-blue-100 px-10 py-3 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && (
              <div className="text-red-500 text-sm mt-1">{errors.email}</div>
            )}
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              className="w-full border border-blue-100 px-10 py-3 rounded-xl bg-white/80 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-blue-500"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors.password && (
              <div className="text-red-500 text-sm mt-1">{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:scale-105 transition text-lg disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="mt-7 flex flex-col items-center">
          <span className="text-sm text-gray-600 mb-2">Already have an account?</span>
          <button
            type="button"
            onClick={goToLogin}
            className="w-full py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-semibold shadow hover:scale-105 transition-all"
          >
            Login to EchoFi
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register
