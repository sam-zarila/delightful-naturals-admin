"use client"

import React, { use } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Plus, Minus, Upload, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { getProductById, updateProduct, deleteProduct, Product } from "@/lib/products"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()

  // Unwrap the params Promise
  const { id } = use(params)

  const [product, setProduct] = useState<Product | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    size: "",
    description: "",
    howToUse: [""],
    ingredients: [""],
    benefits: [""], // <-- Add this line
    stock_quantity: "",
    inStock: true,
  })

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      const fetchedProduct = await getProductById(id)
      setProduct(fetchedProduct)

      if (fetchedProduct) {
        setFormData({
          name: fetchedProduct.name,
          price: fetchedProduct.price.toString(),
          size: fetchedProduct.size,
          description: fetchedProduct.description,
          howToUse: fetchedProduct.howToUse.length > 0 ? fetchedProduct.howToUse : [""],
          ingredients: fetchedProduct.ingredients.length > 0 ? fetchedProduct.ingredients : [""],
          benefits: fetchedProduct.benefits.length > 0 ? fetchedProduct.benefits : [""], // <-- Add this line
          inStock: fetchedProduct.inStock,
          stock_quantity: fetchedProduct.inStock ? fetchedProduct.stock_quantity.toString() : "0",
        })
      }
      setLoading(false)
    }

    fetchProduct()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updates: Partial<Product> = {
        name: formData.name,
        price: parseFloat(formData.price),
        size: formData.size,
        description: formData.description,
        howToUse: formData.howToUse.filter(step => step.trim() !== ""),
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ""),
        benefits: formData.benefits.filter(ben => ben.trim() !== ""),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        inStock: formData.inStock,
      }

      const updatedProduct = await updateProduct(id, updates)

      if (updatedProduct) {
        router.push("/admin/products")
      } else {
        alert("Failed to update product. Please try again.")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("An error occurred while updating the product.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        const success = await deleteProduct(id)

        if (success) {
          router.push("/admin/products")
        } else {
          alert("Failed to delete product. Please try again.")
        }
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("An error occurred while deleting the product.")
      }
    }
  }

  const addHowToUseStep = () => {
    setFormData({
      ...formData,
      howToUse: [...formData.howToUse, ""],
    })
  }

  const removeHowToUseStep = (index: number) => {
    setFormData({
      ...formData,
      howToUse: formData.howToUse.filter((_, i) => i !== index),
    })
  }

  const updateHowToUseStep = (index: number, value: string) => {
    const updated = [...formData.howToUse]
    updated[index] = value
    setFormData({ ...formData, howToUse: updated })
  }

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ""],
    })
  }

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    })
  }

  const updateIngredient = (index: number, value: string) => {
    const updated = [...formData.ingredients]
    updated[index] = value
    setFormData({ ...formData, ingredients: updated })
  }

  const addBenefit = () => {
    setFormData({
      ...formData,
      benefits: [...formData.benefits, ""],
    })
  }

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    })
  }

  const updateBenefit = (index: number, value: string) => {
    const updated = [...formData.benefits]
    updated[index] = value
    setFormData({ ...formData, benefits: updated })
  }



  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <Alert>
          <AlertDescription>Product not found.</AlertDescription>
        </Alert>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-charcoal">Edit Product</h1>
              <p className="text-muted-foreground">Update product information</p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleDelete} disabled={saving}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Product
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential product details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (R)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center space-x-2">

                  <div className="space-y-2 flex-1">
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => {
                        const qty = e.target.value;
                        setFormData({
                          ...formData,
                          stock_quantity: qty,
                          inStock: parseInt(qty) > 0 ? true : false
                        })
                      }}
                      required
                      disabled={saving}
                      onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()} // Prevent scroll changes
                    />
                  </div>
                  {/* In Stock Switch */}
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                    disabled={saving}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </CardContent>
            </Card>

            {/* Product Image */}
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
                <CardDescription>Update product photos</CardDescription>
              </CardHeader>
              <CardContent>
                {product.image && product.image !== '/placeholder.svg?height=400&width=400' && (
                  <div className="mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                {/* <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your image here, or click to browse
                  </p>
                  <Button type="button" variant="outline" size="sm" disabled={saving}>
                    Choose File
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* How to Use */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
              <CardDescription>Step-by-step usage instructions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.howToUse.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={step}
                      onChange={(e) => updateHowToUseStep(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      disabled={saving}
                    />
                  </div>
                  {formData.howToUse.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeHowToUseStep(index)}
                      disabled={saving}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHowToUseStep}
                disabled={saving}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>List all product ingredients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder="Ingredient name"
                      disabled={saving}
                    />
                  </div>
                  {formData.ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      disabled={saving}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
                disabled={saving}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredient
              </Button>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
              <CardDescription>Highlight product benefits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="Benefit description"
                      disabled={saving}
                    />
                  </div>
                  {formData.benefits.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBenefit(index)}
                      disabled={saving}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBenefit}
                disabled={saving}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Benefit
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="flex-1 bg-transparent"
              disabled={saving}
            >
              <Link href="/admin/products">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}