import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { transactionAPI, categoryAPI, Transaction, Category } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Edit, Trash2, Filter } from 'lucide-react'

const Transactions: React.FC = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    start_date: '',
    end_date: '',
  })

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    type: 'Expense' as 'Income' | 'Expense',
    notes: '',
  })

  const fetchTransactions = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const filterParams: any = {}
      if (filters.category) filterParams.category = filters.category
      if (filters.type) filterParams.type = filters.type
      if (filters.start_date) filterParams.start_date = filters.start_date
      if (filters.end_date) filterParams.end_date = filters.end_date
      
      const data = await transactionAPI.getAll(user.user_id, filterParams)
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

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
    fetchTransactions()
    fetchCategories()
  }, [user])

  const handleOpenDialog = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction)
      setFormData({
        date: transaction.date,
        amount: transaction.amount.toString(),
        category: transaction.category.toString(),
        type: transaction.type,
        notes: transaction.notes || '',
      })
    } else {
      setEditingTransaction(null)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        type: 'Expense',
        notes: '',
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!user) return

    try {
      const transactionData: Transaction = {
        user: user.user_id,
        category: parseInt(formData.category),
        date: formData.date,
        amount: parseFloat(formData.amount),
        type: formData.type,
        notes: formData.notes,
      }

      if (editingTransaction) {
        await transactionAPI.update(editingTransaction.transaction_id!, transactionData)
        setSuccess('Transaction updated successfully')
      } else {
        await transactionAPI.create(transactionData)
        setSuccess('Transaction created successfully')
      }

      setDialogOpen(false)
      fetchTransactions()
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      await transactionAPI.delete(id)
      setSuccess('Transaction deleted successfully')
      fetchTransactions()
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred')
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-sm md:text-base text-muted-foreground">Manage your income and expenses</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto text-sm">
          <Plus className="mr-2 h-3 w-3 md:h-4 md:w-4" /> Add Transaction
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Label htmlFor="filter_category" className="text-sm">Category</Label>
              <Select
                id="filter_category"
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
            <div>
              <Label htmlFor="filter_type" className="text-sm">Type</Label>
              <Select
                id="filter_type"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="text-sm"
              >
                <option value="">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter_start" className="text-sm">Start Date</Label>
              <Input
                id="filter_start"
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="filter_end" className="text-sm">End Date</Label>
              <Input
                id="filter_end"
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3 md:mt-4">
            <Button onClick={fetchTransactions} className="flex-1 sm:flex-none text-sm">Apply Filters</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({ category: '', type: '', start_date: '', end_date: '' })
                setTimeout(fetchTransactions, 0)
              }}
              className="flex-1 sm:flex-none text-sm"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table/Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">All Transactions</CardTitle>
          <CardDescription className="text-xs md:text-sm">A list of all your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No transactions found</p>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {transactions.map((transaction) => (
                  <Card key={transaction.transaction_id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              transaction.type === 'Income' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(transaction.date)}</span>
                          </div>
                          <p className="text-sm font-medium">{transaction.category_name}</p>
                          {transaction.notes && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{transaction.notes}</p>
                          )}
                        </div>
                        <div className={`text-base font-bold ml-2 ${
                          transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(transaction)}
                          className="flex-1 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(transaction.transaction_id!)}
                          className="flex-1 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.transaction_id}>
                        <TableCell className="text-sm">{formatDate(transaction.date)}</TableCell>
                        <TableCell className="text-sm">{transaction.category_name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'Income' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </TableCell>
                        <TableCell className={`text-sm ${transaction.type === 'Income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{transaction.notes || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDialog(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(transaction.transaction_id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Income' | 'Expense' })}
                required
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add any notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingTransaction ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Transactions

