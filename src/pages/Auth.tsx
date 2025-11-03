import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DollarSign } from 'lucide-react'

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const response = await authAPI.login({
          username: formData.username,
          password: formData.password,
        })
        login(response)
        navigate('/dashboard')
      } else {
        const response = await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        })
        login(response.user)
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center p-4 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-xl md:text-3xl font-bold">Expense Tracker</h1>
          </div>
          <CardTitle className="text-xl md:text-2xl text-center">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-center">
            {isLogin
              ? 'Enter your credentials to access your account'
              : 'Enter your information to create an account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="username" className="text-sm">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="text-sm"
              />
            </div>

            {!isLogin && (
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
            )}

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="text-sm"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs md:text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full text-sm md:text-base" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-3 md:mt-4 text-center text-xs md:text-sm">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Auth

