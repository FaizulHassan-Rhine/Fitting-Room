"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPaymentSession } from "@/lib/paymentGateway";

export default function StripeCheckoutPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const paymentId = searchParams?.get("payment_id");
    if (paymentId) {
      const session = getPaymentSession(paymentId);
      if (session) {
        setPaymentData(session);
      }
    }
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center" role="status" aria-label="Loading">
        <div className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin" aria-hidden />
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <p className="text-medium-gray mb-4">Payment session not found</p>
        </div>
      </div>
    );
  }

  // In production, this would be the actual Stripe Checkout
  // For demo, we'll show a simulated checkout
  const handlePayment = () => {
    // In production, this would redirect to Stripe Checkout
    // For demo, simulate successful payment
    const returnUrl = paymentData.returnUrl || "/payment/success";
    window.location.href = `${returnUrl}?payment_id=${paymentData.paymentId}`;
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Stripe Payment</h1>
            <p className="text-medium-gray">Complete your payment securely</p>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-medium-gray">Amount:</span>
                <span className="font-bold">${paymentData.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-medium-gray">Description:</span>
                <span className="font-semibold">{paymentData.description}</span>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>Demo Mode:</strong> In production, this would redirect to Stripe Checkout.
              For demo purposes, clicking "Pay Now" will simulate a successful payment.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePayment}
              className="flex-1 btn btn-primary"
            >
              Pay Now
            </button>
            <a
              href={paymentData.cancelUrl || "/payment/cancel"}
              className="flex-1 btn btn-secondary text-center"
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

