export interface Product {
  id: string
  name: string
  price: number
  size: string
  description: string
  howToUse: string[]
  ingredients: string[]
  image: string
  slug: string
  inStock: boolean
}

export const products: Product[] = [
  {
    id: "1",
    name: "Mega Potent Hair Growth Oil",
    price: 300,
    size: "100ml",
    description:
      "Our signature hair growth oil formulated with premium natural ingredients to stimulate hair follicles and promote healthy hair growth. Perfect for those seeking to restore thickness and length to their hair naturally.",
    howToUse: [
      "Apply 3-5 drops to clean, damp hair",
      "Massage gently into scalp using circular motions",
      "Leave on for at least 30 minutes or overnight",
      "Rinse with gentle shampoo",
      "Use 2-3 times per week for best results",
    ],
    ingredients: [
      "Rosemary Essential Oil",
      "Peppermint Oil",
      "Castor Oil",
      "Jojoba Oil",
      "Vitamin E",
      "Biotin",
      "Saw Palmetto Extract",
    ],
    image: "/placeholder.svg?height=400&width=400",
    slug: "hair-growth-oil-100ml",
    inStock: true,
  },
  {
    id: "2",
    name: "Scalp Detox Oil",
    price: 260,
    size: "65ml",
    description:
      "A purifying scalp treatment that removes buildup, balances oil production, and creates the optimal environment for healthy hair growth. Infused with clarifying botanicals and nourishing oils.",
    howToUse: [
      "Part hair into sections",
      "Apply directly to scalp using the dropper",
      "Massage thoroughly for 2-3 minutes",
      "Leave on for 20-30 minutes",
      "Shampoo twice to remove completely",
      "Use once weekly for maintenance",
    ],
    ingredients: [
      "Tea Tree Oil",
      "Eucalyptus Oil",
      "Apple Cider Vinegar",
      "Argan Oil",
      "Charcoal Extract",
      "Lemon Essential Oil",
      "Witch Hazel",
    ],
    image: "/placeholder.svg?height=400&width=400",
    slug: "scalp-detox-oil-65ml",
    inStock: true,
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}
