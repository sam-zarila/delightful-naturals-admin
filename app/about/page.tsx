import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Heart, Shield, Award, Users, Sparkles } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-muted/50 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4">Our Story</Badge>
              <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground mb-6">Meet Sister Lesley</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                The passionate founder behind Delightful Naturals, dedicated to transforming hair care through the power
                of nature's finest ingredients.
              </p>
            </div>
          </div>
        </section>

        {/* Sister Lesley's Story */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Image
                  src="/placeholder.svg?height=600&width=500"
                  alt="Sister Lesley - Founder of Delightful Naturals"
                  width={500}
                  height={600}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="space-y-6">
                <h2 className="font-heading text-3xl font-bold text-foreground">A Journey of Discovery</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Sister Lesley's journey into natural hair care began with her own struggles. After years of using
                  chemical-laden products that left her hair damaged and brittle, she turned to her grandmother's
                  traditional remedies and ancient botanical wisdom.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  What started as a personal quest for healthier hair became a passion for helping others. Through
                  extensive research and experimentation with natural ingredients, Sister Lesley discovered powerful
                  combinations that not only restored her hair but transformed it completely.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, she shares these carefully crafted formulations with women across South Africa, helping them
                  achieve the healthy, beautiful hair they've always dreamed of - naturally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">Our Mission & Vision</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Empowering women to embrace their natural beauty through premium, effective hair care solutions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-heading text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To provide premium natural hair care products that nourish, strengthen, and promote healthy hair
                    growth while honoring traditional botanical wisdom and modern scientific understanding.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-heading text-2xl font-bold mb-4">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To become the leading natural hair care brand in South Africa, empowering women to embrace their
                    natural beauty and achieve their hair goals through safe, effective, and sustainable products.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why We Started */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Why Delightful Naturals?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  We believe every woman deserves to feel confident and beautiful in her own skin, starting with
                  healthy, vibrant hair.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3">Natural Ingredients</h3>
                  <p className="text-muted-foreground text-sm">
                    We source only the finest natural ingredients, free from harsh chemicals and synthetic additives.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3">Proven Results</h3>
                  <p className="text-muted-foreground text-sm">
                    Our formulations are backed by traditional wisdom and modern research for guaranteed effectiveness.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3">Community Focus</h3>
                  <p className="text-muted-foreground text-sm">
                    We're committed to supporting and empowering women in our community through education and quality
                    products.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quality Assurance */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="font-heading text-3xl font-bold text-foreground">Our Quality Promise</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Every bottle of Delightful Naturals is crafted with meticulous attention to detail and the highest
                  quality standards. We believe in transparency and excellence in everything we do.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Award className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Premium Sourcing</h4>
                      <p className="text-sm text-muted-foreground">
                        We carefully select and source our ingredients from trusted suppliers who share our commitment
                        to quality.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Safety Testing</h4>
                      <p className="text-sm text-muted-foreground">
                        All products undergo rigorous testing to ensure they meet our high safety and efficacy
                        standards.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Heart className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Handcrafted with Care</h4>
                      <p className="text-sm text-muted-foreground">
                        Each batch is personally overseen by Sister Lesley to ensure consistency and quality.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="Quality ingredients and natural hair care products"
                  width={500}
                  height={500}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">Ready to Start Your Hair Journey?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Join the Delightful Naturals family and discover the transformative power of natural hair care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium bg-primary-foreground text-primary rounded-md hover:bg-primary-foreground/90 transition-colors"
              >
                Shop Products
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium border border-primary-foreground text-primary-foreground rounded-md hover:bg-primary-foreground hover:text-primary transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
