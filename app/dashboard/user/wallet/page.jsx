"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getWallet, addTransaction, Wallet, Transaction } from "@/lib/walletStorage";
import { initializePayment, detectPaymentGateway, PaymentGateway } from "@/lib/paymentGateway";

// Credit conversion rate: $1 = 1 credit (adjust as needed)
const CREDIT_RATE = 1;

export default function UserWalletPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [dollarAmount, setDollarAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState("stripe");

  useEffect(() => {
    if (user) {
      const userWallet = getWallet(user.email, "user");
      setWallet(userWallet);
      setSelectedGateway(detectPaymentGateway());
    }
  }, [user]);

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  const handleAmountChange = (value) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('') 
      : numericValue;
    
    setDollarAmount(formattedValue);
    
    const numValue = parseFloat(formattedValue);
    if (numValue && presetAmounts.includes(numValue)) {
      setSelectedAmount(numValue);
    } else {
      setSelectedAmount(null);
    }
  };

  const handlePresetSelect = (amount) => {
    setDollarAmount(amount.toString());
    setSelectedAmount(amount);
  };

  const handleTopUp = async () => {
    if (!user || !wallet) return;
    
    const amount = parseFloat(dollarAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (amount < 1) {
      alert("Minimum top-up amount is $1");
      return;
    }

    setIsProcessing(true);

    try {
      const credits = Math.floor(amount * CREDIT_RATE);
      
      // Create pending transaction
      addTransaction(user.email, "user", {
        type: "topup",
        amount: credits,
        currency: wallet.currency,
        status: "pending",
        paymentGateway: selectedGateway,
        description: `Top-up of $${amount.toFixed(2)} (${credits} credits)`,
      });

      // Initialize payment
      const paymentResponse = await initializePayment({
        amount,
        currency: wallet.currency,
        userId: user.email,
        userType: "user",
        description: `Wallet Top-up - ${credits} credits`,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      }, selectedGateway);

      if (paymentResponse.success && paymentResponse.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = paymentResponse.paymentUrl;
      } else {
        alert(paymentResponse.error || "Failed to initialize payment");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <p className="text-medium-gray mb-4">Please log in to access your wallet</p>
          <Link href="/auth/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center" role="status" aria-label="Loading">
        <div className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin" aria-hidden />
      </div>
    );
  }

  const dollarValue = parseFloat(dollarAmount) || 0;
  const creditsToAdd = Math.floor(dollarValue * CREDIT_RATE);

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/browse" className="text-medium-gray hover:text-black mb-4 inline-block transition-colors">
            ← Back to Browse
          </Link>
          <h1 className="text-4xl font-bold mb-2">My Wallet</h1>
          <p className="text-medium-gray">Manage your wallet balance and top-up</p>
        </div>

        {/* Wallet Balance Card */}
        <div className="card mb-6">
          <div className="text-center">
            <p className="text-medium-gray text-sm mb-2">Current Balance</p>
            <p className="text-5xl font-bold mb-2">{wallet.balance.toLocaleString()}</p>
            <p className="text-medium-gray text-sm">Credits</p>
          </div>
        </div>

        {/* Top-Up Section */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Top-Up Wallet</h2>
          
          {/* Payment Gateway Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Payment Gateway</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedGateway("stripe")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedGateway === "stripe"
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="font-semibold mb-1">Stripe</div>
                <div className="text-xs opacity-80">International</div>
              </button>
              <button
                onClick={() => setSelectedGateway("sslcommerz")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedGateway === "sslcommerz"
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="font-semibold mb-1">SSLCommerz</div>
                <div className="text-xs opacity-80">Bangladesh & Region</div>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Enter Amount (USD)
            </label>
            <input
              type="text"
              id="amount"
              value={dollarAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="input text-2xl font-bold text-center"
            />
          </div>

          {/* Preset Amounts */}
          <div className="mb-6">
            <p className="text-sm text-medium-gray mb-3">Quick Select</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handlePresetSelect(amount)}
                  className={`py-3 rounded-lg font-medium transition-all ${
                    selectedAmount === amount
                      ? "bg-black text-white scale-105"
                      : "bg-light-gray text-medium-gray hover:bg-medium-gray hover:text-white"
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Credits Preview */}
          {dollarValue > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-medium-gray">You will receive:</span>
                <span className="text-2xl font-bold">{creditsToAdd.toLocaleString()} Credits</span>
              </div>
              <div className="mt-2 text-xs text-medium-gray">
                Rate: ${CREDIT_RATE} = {CREDIT_RATE} Credit
              </div>
            </div>
          )}

          {/* Top-Up Button */}
          <button
            onClick={handleTopUp}
            disabled={isProcessing || dollarValue <= 0}
            className="btn btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : `Top-Up ${dollarValue > 0 ? `$${dollarValue.toFixed(2)}` : ""}`}
          </button>
        </div>

        {/* Transaction History */}
        <div className="card mt-6">
          <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
          {wallet.transactions.length === 0 ? (
            <p className="text-medium-gray text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {wallet.transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-light-gray rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{transaction.description}</p>
                    <p className="text-sm text-medium-gray">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === "topup" || transaction.type === "refund"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      {transaction.type === "topup" || transaction.type === "refund" ? "+" : "-"}
                      {transaction.amount.toLocaleString()} {transaction.currency}
                    </p>
                    <p className={`text-xs ${
                      transaction.status === "completed"
                        ? "text-green-600"
                        : transaction.status === "failed"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

