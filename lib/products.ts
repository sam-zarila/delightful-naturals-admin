export interface Product {
  id: string
  name: string
  price: number
  size: string
  description: string
  howToUse: string[]
  benefits: string[]
  ingredients: string[]
  image: string
  slug: string
  inStock: boolean
  stock_quantity: number
}

// API Configuration
// const API_BASE_URL = 'http://localhost/delightful/'
const API_BASE_URL = 'http://api.delightfulnaturals.co.za/'



// API Response interfaces
interface ApiProduct {
  id: string
  name: string
  slug: string
  description: string | null
  price: string
  volume: string
  stock_quantity: number
  ingredients: string | null
  usage_instructions: string | null
  benefits: string | null
  image_url: string | null
  is_active: number
  created_at: string
  updated_at: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  total?: number
  limit?: number
  offset?: number
  error?: string
}

// Transform API product to frontend Product format
function transformProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: parseFloat(apiProduct.price),
    size: apiProduct.volume,
    description: apiProduct.description || '',
    howToUse: apiProduct.usage_instructions
      ? JSON.parse(apiProduct.usage_instructions)
      : [],
    ingredients: apiProduct.ingredients
      ? JSON.parse(apiProduct.ingredients)
      : [],
    benefits: apiProduct.benefits ? JSON.parse(apiProduct.benefits) : [],
    image: apiProduct.image_url || '/placeholder.svg?height=400&width=400',
    slug: apiProduct.slug,
    stock_quantity: apiProduct.stock_quantity,
    inStock: ((apiProduct.stock_quantity > 0) && (apiProduct.is_active == 1)),
  }
}



// Fetch all products
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php?limit=10&offset=0`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<ApiProduct[]> = await response.json()
    
    if (result.success && result.data) {
      return result.data.map(transformProduct)
    }
    
    throw new Error(result.error || 'Failed to fetch products')
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// Fetch product by slug
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php?search=${encodeURIComponent(slug)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<ApiProduct[]> = await response.json()
    
    if (result.success && result.data && result.data.length > 0) {
      const product = result.data.find(p => p.slug === slug)
      return product ? transformProduct(product) : undefined
    }
    
    return undefined
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return undefined
  }
}

// Fetch product by ID
export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php/${id}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<ApiProduct> = await response.json()
    
    if (result.success && result.data) {
      return transformProduct(result.data)
    }
    
    return undefined
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    return undefined
  }
}

// Create a new product (admin function)
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    const apiProduct = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toString(),
      volume: product.size,
      stock_quantity: product.stock_quantity,
      ingredients: JSON.stringify(product.ingredients),
      usage_instructions: JSON.stringify(product.howToUse),
      benefits: JSON.stringify(product.benefits),
      image_url: product.image !== '/placeholder.svg?height=400&width=400' ? product.image : null,
      is_active: 1,
    }
    
    // console.log('Creating product with data:', JSON.stringify(apiProduct))
    const response = await fetch(`${API_BASE_URL}/products.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiProduct),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<ApiProduct> = await response.json()
    
    if (result.success && result.data) {
      return transformProduct(result.data)
    }
    
    return null
  } catch (error) {
    console.error('Error creating product:', error)
    return null
  }
}

// Update a product (admin function)
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const apiUpdates: any = {}

    if (updates.name) apiUpdates.name = updates.name
    if (updates.slug) apiUpdates.slug = updates.slug
    if (updates.description) apiUpdates.description = updates.description
    if (updates.price) apiUpdates.price = updates.price.toString()
    if (updates.size) apiUpdates.volume = updates.size
    if (updates.inStock !== undefined) {
      apiUpdates.is_active = updates.inStock ? 1 : 0
    }
    if (updates.ingredients) {
      apiUpdates.ingredients = Array.isArray(updates.ingredients)
        ? JSON.stringify(updates.ingredients)
        : updates.ingredients
    }
    if (updates.howToUse) {
      apiUpdates.usage_instructions = Array.isArray(updates.howToUse)
        ? JSON.stringify(updates.howToUse)
        : updates.howToUse
    }
    if (updates.benefits) {
      apiUpdates.benefits = Array.isArray(updates.benefits)
        ? JSON.stringify(updates.benefits)
        : updates.benefits
    }
    if (updates.stock_quantity !== undefined) {
      apiUpdates.stock_quantity = updates.stock_quantity
    }
    if (updates.image && updates.image !== '/placeholder.svg?height=400&width=400') {
      apiUpdates.image_url = updates.image
    }

    const response = await fetch(`${API_BASE_URL}/products.php/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiUpdates),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse<ApiProduct> = await response.json()

    if (result.success && result.data) {
      return transformProduct(result.data)
    }

    return null
  } catch (error) {
    console.error('Error updating product:', error)
    return null
  }
}

// Delete a product (admin function)
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<null> = await response.json()
    return result.success
  } catch (error) {
    console.error('Error deleting product:', error)
    return false
  }
}

// Legacy export for backward compatibility - now fetches from API
export let products: Product[] = []

// Initialize products on module load (for SSR/initial load)
// You may want to call this from your app initialization
export async function initializeProducts(): Promise<void> {
  products = await getProducts()
}