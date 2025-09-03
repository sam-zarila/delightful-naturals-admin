import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/products"
import { Star, Leaf, Shield, Heart, ArrowRight } from "lucide-react"

export default function HomePage() {
  const featuredProducts = products.slice(0, 2)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-muted/50 to-background py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge className="w-fit">Premium Natural Hair Care</Badge>
                <h1 className="font-heading text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Transform Your Hair with <span className="text-primary">Nature's Power</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Discover Sister Lesley's carefully crafted natural hair oils that nourish, strengthen, and promote
                  healthy hair growth using only the finest botanical ingredients.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="text-lg px-8" asChild>
                    <Link href="/products">
                      Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
                    <Link href="/about">Learn Our Story</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=600&width=600"
                  alt="Delightful Naturals Hair Care Products"
                  width={600}
                  height={600}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Our Signature Products
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Two powerful formulations designed to address your hair's unique needs and unlock its natural potential.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Why Choose Natural Hair Care?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the difference that pure, natural ingredients can make for your hair health and growth.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3">100% Natural</h3>
                  <p className="text-muted-foreground">
                    No harsh chemicals, sulfates, or synthetic additives. Only pure botanical ingredients that nature
                    intended.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3">Proven Results</h3>
                  <p className="text-muted-foreground">
                    Formulated with scientifically-backed ingredients known for their hair growth and scalp health
                    benefits.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3">Made with Love</h3>
                  <p className="text-muted-foreground">
                    Each bottle is carefully crafted by Sister Lesley with passion and dedication to hair health.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Preview */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="Sister Lesley - Founder of Delightful Naturals"
                  width={500}
                  height={500}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="space-y-6">
                <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">Meet Sister Lesley</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The passionate founder behind Delightful Naturals, Sister Lesley discovered the power of natural
                  ingredients through her own hair journey. After years of struggling with hair damage from chemical
                  treatments, she turned to nature's remedies and experienced remarkable transformation.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, she shares her knowledge and carefully crafted formulations to help others achieve healthy,
                  beautiful hair naturally. Every product is made with the same care and attention she would give to her
                  own family.
                </p>
                <Button className="text-lg px-8" asChild>
                  <Link href="/about">
                    Read Our Full Story <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
                What Our Customers Say
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Real results from real people who have transformed their hair with Delightful Naturals.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "The Hair Growth Oil has completely transformed my hair! I've seen noticeable growth in just 6
                    weeks. Sister Lesley's products are truly magical."
                  </p>
                  <div className="font-medium">- Thandiwe M.</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "My scalp feels so much healthier after using the Scalp Detox Oil. No more itchiness or flakes. I'm
                    a customer for life!"
                  </p>
                  <div className="font-medium">- Nomsa K.</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Natural ingredients that actually work! My hair is stronger, shinier, and growing faster than ever
                    before. Highly recommend!"
                  </p>
                  <div className="font-medium">- Lerato S.</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">Ready to Transform Your Hair?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of satisfied customers who have discovered the power of natural hair care. Start your
              journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <Link href="/products">Shop Products</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
