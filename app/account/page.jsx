"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  const getDashboardLink = () => {
    if (!user) return "/browse";
    switch (user.type) {
      case "brand":
        return "/dashboard/brand";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/browse";
    }
  };

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
        <h1 className="text-3xl font-bold mb-2">Account</h1>
        <p className="text-medium-gray mb-8">Manage your profile and settings</p>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-medium">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <div className="text-lg font-semibold">{user.name || "User"}</div>
              <div className="text-medium-gray">{user.email}</div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link href="/security" className="block p-3 rounded-lg hover:bg-light-gray transition-colors">
              <div className="font-medium">Login & Security</div>
              <div className="text-sm text-medium-gray">Manage password and security settings</div>
            </Link>
            <Link href="/billing" className="block p-3 rounded-lg hover:bg-light-gray transition-colors">
              <div className="font-medium">Billing & Subscription</div>
              <div className="text-sm text-medium-gray">Manage payment methods and subscriptions</div>
            </Link>
            <Link href="/notifications" className="block p-3 rounded-lg hover:bg-light-gray transition-colors">
              <div className="font-medium">Notifications</div>
              <div className="text-sm text-medium-gray">Manage notification preferences</div>
            </Link>
            <Link href={getDashboardLink()} className="block p-3 rounded-lg hover:bg-light-gray transition-colors">
              <div className="font-medium">Dashboard</div>
              <div className="text-sm text-medium-gray">Go to your dashboard</div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Account Type</h2>
          <div className="text-medium-gray capitalize">{user.type || "consumer"}</div>
        </div>
      </div>
    </div>
  );
}

