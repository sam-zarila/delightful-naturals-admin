"use client"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutSteps } from "@/components/checkout-steps"
import { CustomerInfoForm } from "@/components/checkout-forms/customer-info-form"
import { ShippingForm } from "@/components/checkout-forms/shipping-form"
import { PaymentForm } from "@/components/checkout-forms/payment-form"
import { OrderReview } from "@/components/checkout-forms/order-review"
import { CheckoutProvider, useCheckout } from "@/contexts/checkout-context"
import { useCart } from "@/contexts/cart-context"

function CheckoutContent() {
  const router = useRouter()
  const { state, setCurrentStep } = useCheckout()
  const { clearCart } = useCart()

  const handleNext = () => {
    setCurrentStep(state.currentStep + 1)
  }

  const handleBack = () => {
    setCurrentStep(state.currentStep - 1)
  }

  const handlePlaceOrder = () => {
    // Generate order ID
    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase()

    // Clear cart
    clearCart()

    // Redirect to confirmation
    router.push(`/order-confirmation/${orderId}`)
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <CustomerInfoForm onNext={handleNext} />
      case 2:
        return <ShippingForm onNext={handleNext} onBack={handleBack} />
      case 3:
        return <PaymentForm onNext={handleNext} onBack={handleBack} />
      case 4:
        return <OrderReview onBack={handleBack} onPlaceOrder={handlePlaceOrder} />
      default:
        return <CustomerInfoForm onNext={handleNext} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Checkout</h1>
          <CheckoutSteps currentStep={state.currentStep} />
          <div className="max-w-2xl mx-auto">{renderStep()}</div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  )
}
