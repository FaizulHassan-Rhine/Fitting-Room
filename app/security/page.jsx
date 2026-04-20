"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function SecurityPage() {
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
        <h1 className="text-3xl font-bold mb-2">Login & Security</h1>
        <p className="text-medium-gray mb-8">Manage your account security and login settings</p>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="text-gray-900">{user.email || "—"}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <div className="text-gray-900 capitalize">{user.type || "consumer"}</div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Password</h2>
          <p className="text-medium-gray mb-4">Change your password to keep your account secure.</p>
          <button className="btn btn-secondary">
            Change Password
          </button>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Two-Factor Authentication</h2>
          <p className="text-medium-gray mb-4">Add an extra layer of security to your account.</p>
          <button className="btn btn-secondary">
            Enable 2FA
          </button>
        </div>

        <div className="mt-6">
          <Link href="/account" className="text-medium-gray hover:text-black text-sm">
            ← Back to Account
          </Link>
        </div>
      </div>
    </div>
  );
}

