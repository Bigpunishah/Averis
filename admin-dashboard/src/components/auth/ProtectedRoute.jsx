import { useAuth } from '../../hooks/useAuth'
import { LoginForm } from './LoginForm'

export const ProtectedRoute = ({ children }) => {
  const { user, loading, signIn } = useAuth()

  const handleLogin = async (email, password) => {
    const { error } = await signIn(email, password)
    if (error) {
      console.error('Login error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} loading={loading} />
  }

  return children
}