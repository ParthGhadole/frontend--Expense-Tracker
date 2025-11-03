import React, { useState } from 'react'
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Receipt, Tag, Download, LogOut, DollarSign, Menu, X } from 'lucide-react'

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Categories', path: '/categories', icon: Tag },
    { name: 'Export', path: '/export', icon: Download },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleNavClick = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 md:h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mr-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <h1 className="text-lg md:text-xl font-bold">Expense Tracker</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-sm hidden sm:block">
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground hidden md:block">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs md:text-sm">
              <LogOut className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container flex relative px-0 md:px-4">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 border-r bg-background
          transform transition-transform duration-200 ease-in-out
          md:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]
          p-4
        `}>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
        <div className="flex justify-around items-center h-16">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </button>
            )
          })}
        </div>
      </nav>
      
      {/* Add padding to bottom on mobile to account for bottom nav */}
      <div className="md:hidden h-16" />
    </div>
  )
}

export default Layout

