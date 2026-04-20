"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-medium-gray mb-8">Manage your billing information and subscriptions</p>

        {user.type === "brand" ? (
          <>
            <div className="card mb-6">
              <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
              <div className="space-y-2">
                <div className="text-2xl font-bold">Free Plan</div>
                <p className="text-medium-gray">Basic features with limited credits</p>
              </div>
            </div>

            <div className="card mb-6">
              <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
              <p className="text-medium-gray mb-4">No payment methods on file.</p>
              <button className="btn btn-secondary">
                Add Payment Method
              </button>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Billing History</h2>
              <p className="text-medium-gray">No billing history available.</p>
            </div>
          </>
        ) : (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Consumer Account</h2>
            <p className="text-medium-gray">
              All consumer features are completely free. You don&apos;t need any payment methods or subscriptions.
            </p>
          </div>
        )}

        <div className="mt-6">
          <Link href="/account" className="text-medium-gray hover:text-black text-sm">
            ← Back to Account
          </Link>
        </div>
      </div>
    </div>
  );
}

