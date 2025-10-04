"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Plus, Minus, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { createProduct, Product } from "@/lib/products"

export default function AddProductPage() {
  const router = useRouter()
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
    image_url: "",
  })

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const newProduct: Omit<Product, 'id'> = {
        name: formData.name,
        price: parseFloat(formData.price),
        size: formData.size,
        description: formData.description,
        howToUse: formData.howToUse.filter(step => step.trim() !== ""),
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ""),
        benefits: formData.benefits.filter(b => b.trim() !== ""),
        image: formData.image_url || '/placeholder.svg?height=400&width=400',
        slug: generateSlug(formData.name),
        inStock: formData.inStock,
        stock_quantity: parseInt(formData.stock_quantity),
      }

      const createdProduct = await createProduct(newProduct)

      if (createdProduct) {
        router.push("/admin/products")
      } else {
        alert("Failed to create product. Please try again.")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert("An error occurred while creating the product.")
    } finally {
      setSaving(false)
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

  // Benefits handlers
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" disabled={saving}>
            <Link href="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Add New Product</h1>
            <p className="text-muted-foreground">Create a new product for your store</p>
          </div>
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
                    placeholder="e.g., Mega Potent Hair Growth Oil"
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
                      placeholder="300"
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
                      placeholder="100ml"
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
                    placeholder="Describe your product..."
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
                <CardDescription>Upload product photo URL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://localhost/images/product.jpg"
                  />
                </div>

                {formData.image_url && (
                  <div className="border rounded-lg p-4">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E"
                      }}
                    />
                  </div>
                )}

                {!formData.image_url && (<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your image to server and paste URL above
                  </p>
                </div>)}
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
              <CardDescription>Highlight the product's benefits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="Benefit"
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}