import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { exportAPI, categoryAPI, Category } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, FileText } from 'lucide-react'

const Export: React.FC = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    start_date: '',
    end_date: '',
  })

  const fetchCategories = async () => {
    if (!user) return
    
    try {
      const data = await categoryAPI.getAll(user.user_id)
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [user])

  const handleExport = async () => {
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const filterParams: any = {}
      if (filters.category) filterParams.category = filters.category
      if (filters.type) filterParams.type = filters.type
      if (filters.start_date) filterParams.start_date = filters.start_date
      if (filters.end_date) filterParams.end_date = filters.end_date

      await exportAPI.download(user.user_id, filterParams)
      setSuccess('Transactions exported successfully!')
    } catch (err: any) {
      setError('Failed to export transactions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Export Data</h2>
        <p className="text-sm md:text-base text-muted-foreground">Download your transactions as CSV</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs md:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <AlertDescription className="text-xs md:text-sm">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <FileText className="h-4 w-4 md:h-5 md:w-5" />
            Export Transactions
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Select filters to export specific transactions or leave empty to export all
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="export_category" className="text-sm">Category</Label>
              <Select
                id="export_category"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="export_type" className="text-sm">Type</Label>
              <Select
                id="export_type"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="text-sm"
              >
                <option value="">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </Select>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="export_start" className="text-sm">Start Date</Label>
              <Input
                id="export_start"
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="export_end" className="text-sm">End Date</Label>
              <Input
                id="export_end"
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleExport} disabled={loading} className="gap-2 text-sm flex-1 sm:flex-none">
              <Download className="h-3 w-3 md:h-4 md:w-4" />
              {loading ? 'Exporting...' : 'Export to CSV'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilters({ category: '', type: '', start_date: '', end_date: '' })}
              className="text-sm flex-1 sm:flex-none"
            >
              Clear Filters
            </Button>
          </div>

          <div className="bg-muted p-3 md:p-4 rounded-lg">
            <h4 className="text-sm md:text-base font-medium mb-2">Export Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• The CSV file will contain: Date, Category, Type, Amount, and Notes</li>
              <li>• All amounts are in INR currency</li>
              <li>• Transactions are sorted by date (newest first)</li>
              <li>• You can open CSV files in Excel, Google Sheets, or any spreadsheet application</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Export Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Common Export Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Monthly Expenses</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Export all expenses for a specific month
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const now = new Date()
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                  setFilters({
                    category: '',
                    type: 'Expense',
                    start_date: firstDay.toISOString().split('T')[0],
                    end_date: lastDay.toISOString().split('T')[0],
                  })
                }}
              >
                Apply This Month
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Annual Summary</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Export all transactions for the current year
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const now = new Date()
                  setFilters({
                    category: '',
                    type: '',
                    start_date: `${now.getFullYear()}-01-01`,
                    end_date: `${now.getFullYear()}-12-31`,
                  })
                }}
              >
                Apply This Year
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Income Only</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Export all income transactions
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFilters({
                    category: '',
                    type: 'Income',
                    start_date: '',
                    end_date: '',
                  })
                }}
              >
                Apply Filter
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Category Report</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Export transactions for a specific category
              </p>
              <p className="text-xs text-muted-foreground">
                Select a category above and click export
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Export

