"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { getPaymentSession, clearPaymentSession } from "@/lib/paymentGateway";
import { updateTransactionStatus, getWallet } from "@/lib/walletStorage";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      const paymentId = searchParams?.get("payment_id");
      if (!paymentId || !user) {
        router.push("/");
        return;
      }

      const session = getPaymentSession(paymentId);
      if (!session) {
        router.push("/");
        return;
      }

      // In production, you would verify the payment with the gateway API here
      // For demo, we'll simulate successful payment
      
      // Update transaction status to completed
      updateTransactionStatus(
        session.userId,
        session.userType,
        paymentId,
        "completed"
      );

      // Update old credits system for backward compatibility (brands)
      if (session.userType === "brand") {
        const wallet = getWallet(session.userId, "brand");
        localStorage.setItem("brand_credits", wallet.balance.toString());
        window.dispatchEvent(new Event("creditsUpdated"));
      }

      setPaymentData(session);
      clearPaymentSession(paymentId);
      setIsProcessing(false);
    };

    processPayment();
  }, [searchParams, user, router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mb-4"></div>
          <p className="text-medium-gray">Processing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-medium-gray">
              Your payment has been processed successfully
            </p>
          </div>

          {paymentData && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-medium-gray">Amount:</span>
                  <span className="font-semibold">${paymentData.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-medium-gray">Payment Gateway:</span>
                  <span className="font-semibold capitalize">{paymentData.gateway}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Link
              href={user?.type === "brand" ? "/dashboard/brand?tab=credits" : "/dashboard/user/wallet"}
              className="flex-1 btn btn-primary"
            >
              View Wallet
            </Link>
            <Link
              href={user?.type === "brand" ? "/dashboard/brand" : "/browse"}
              className="flex-1 btn btn-secondary"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

