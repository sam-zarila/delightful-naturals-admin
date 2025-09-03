"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutStepsProps {
  currentStep: number
}

const steps = [
  { id: 1, name: "Customer Info", description: "Your details" },
  { id: 2, name: "Shipping", description: "Delivery address" },
  { id: 3, name: "Payment", description: "Payment method" },
  { id: 4, name: "Review", description: "Confirm order" },
]

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="mb-8">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className={cn("relative", stepIdx !== steps.length - 1 && "flex-1")}>
              <div className="flex items-center">
                <div className="relative flex items-center justify-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2",
                      step.id < currentStep
                        ? "bg-primary border-primary text-primary-foreground"
                        : step.id === currentStep
                          ? "border-primary text-primary"
                          : "border-muted-foreground text-muted-foreground",
                    )}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.id <= currentStep ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {stepIdx !== steps.length - 1 && (
                <div className="absolute top-5 left-10 w-full h-0.5 bg-muted-foreground/20" />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
