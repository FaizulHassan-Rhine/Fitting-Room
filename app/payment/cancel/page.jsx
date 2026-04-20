"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { getPaymentSession, clearPaymentSession } from "@/lib/paymentGateway";
import { updateTransactionStatus } from "@/lib/walletStorage";

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const paymentId = searchParams?.get("payment_id");
    if (paymentId) {
      const session = getPaymentSession(paymentId);
      if (session && user) {
        // Update transaction status to cancelled
        updateTransactionStatus(
          session.userId,
          session.userType,
          paymentId,
          "cancelled"
        );
        clearPaymentSession(paymentId);
      }
    }
  }, [searchParams, user, router]);

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-medium-gray">
              Your payment was cancelled. No charges were made.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href={user?.type === "brand" ? "/dashboard/brand/credits/topup" : "/dashboard/user/wallet"}
              className="flex-1 btn btn-primary"
            >
              Try Again
            </Link>
            <Link
              href={user?.type === "brand" ? "/dashboard/brand" : "/browse"}
              className="flex-1 btn btn-secondary"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

