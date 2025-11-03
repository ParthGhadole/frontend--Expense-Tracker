import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { summaryAPI, Summary } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D']

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
  })

  const fetchSummary = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await summaryAPI.get(user.user_id, filters)
      setSummary(data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [user])

  const handleFilter = () => {
    fetchSummary()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  const pieData = summary.category_breakdown.map((cat) => ({
    name: cat.category_name,
    value: cat.total,
    percentage: cat.percentage,
  }))

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm md:text-base text-muted-foreground">Your financial overview</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Filter by Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-end">
            <div className="flex-1">
              <Label htmlFor="start_date" className="text-sm">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="text-sm"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end_date" className="text-sm">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="text-sm"
              />
            </div>
            <div className="flex gap-2 md:gap-4">
              <Button onClick={handleFilter} className="flex-1 md:flex-none text-sm">Apply Filter</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({ start_date: '', end_date: '' })
                  setTimeout(fetchSummary, 0)
                }}
                className="flex-1 md:flex-none text-sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.total_income)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.total_expense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            {summary.net_balance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.net_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.net_balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Spending by Category</CardTitle>
            <CardDescription className="text-xs md:text-sm">Distribution of your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={window.innerWidth < 768 ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend 
                    wrapperStyle={{ fontSize: window.innerWidth < 768 ? '12px' : '14px' }}
                    formatter={(value, entry: any) => `${value} (${entry.payload.percentage.toFixed(1)}%)`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] md:h-[300px]">
                <p className="text-sm text-muted-foreground">No expense data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Category Details</CardTitle>
            <CardDescription className="text-xs md:text-sm">Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {summary.category_breakdown.length > 0 ? (
                summary.category_breakdown.map((cat, index) => (
                  <div key={cat.category_id} className="flex items-center">
                    <div 
                      className="w-3 h-3 md:w-4 md:h-4 rounded-full mr-2 md:mr-3 flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{cat.category_name}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{cat.percentage.toFixed(1)}%</p>
                    </div>
                    <div className="text-xs md:text-sm font-medium ml-2">{formatCurrency(cat.total)}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center">No categories with expenses</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold">{summary.transaction_count}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Categories Used</p>
              <p className="text-2xl font-bold">{summary.category_breakdown.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

