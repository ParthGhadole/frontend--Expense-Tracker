import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { categoryAPI, Category } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'

const Categories: React.FC = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
  })

  const fetchCategories = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await categoryAPI.getAll(user.user_id)
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [user])

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name })
    } else {
      setEditingCategory(null)
      setFormData({ name: '' })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!user) return

    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory.category_id, { name: formData.name })
        setSuccess('Category updated successfully')
      } else {
        await categoryAPI.create({ user: user.user_id, name: formData.name })
        setSuccess('Category created successfully')
      }

      setDialogOpen(false)
      fetchCategories()
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? Transactions with this category will have it set to null.')) return

    try {
      await categoryAPI.delete(id)
      setSuccess('Category deleted successfully')
      fetchCategories()
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred')
    }
  }

  const defaultCategories = categories.filter(cat => cat.is_default)
  const customCategories = categories.filter(cat => !cat.is_default)

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-sm md:text-base text-muted-foreground">Manage your transaction categories</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto text-sm">
          <Plus className="mr-2 h-3 w-3 md:h-4 md:w-4" /> Add Category
        </Button>
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

      {/* Default Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Tag className="h-4 w-4 md:h-5 md:w-5" />
            Default Categories
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Pre-defined categories available to all users</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Loading categories...</p>
          ) : (
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {defaultCategories.map((category) => (
                <div
                  key={category.category_id}
                  className="flex items-center justify-between p-3 md:p-4 border rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Tag className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm md:text-base font-medium truncate">{category.name}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">Default</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Custom Categories</CardTitle>
          <CardDescription className="text-xs md:text-sm">Categories you've created</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Loading categories...</p>
          ) : customCategories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No custom categories yet</p>
          ) : (
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {customCategories.map((category) => (
                <div
                  key={category.category_id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-accent transition-colors gap-3"
                >
                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Tag className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm md:text-base font-medium truncate">{category.name}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">Custom</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(category)}
                      className="flex-1 sm:flex-none text-xs"
                    >
                      <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(category.category_id)}
                      className="flex-1 sm:flex-none text-xs"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g., Groceries, Rent, Subscriptions"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingCategory ? 'Update' : 'Create'}
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

export default Categories

