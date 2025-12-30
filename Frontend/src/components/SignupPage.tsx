import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface SignupFormData {
  username: string
  email: string
  phone_number?: string
  password: string
  password_confirm: string
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState<SignupFormData>({
    username: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.password_confirm
    ) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.password_confirm,
        formData.phone_number || undefined
      )

      navigate('/login', {
        state: { message: 'Account created successfully. Please sign in.' },
      })
    } catch {
      setError('Registration failed. Please check your information.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>Create Account</h2>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone_number"
          placeholder="Phone number (optional)"
          value={formData.phone_number}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password_confirm"
          placeholder="Confirm password"
          value={formData.password_confirm}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}

export default SignupPage
