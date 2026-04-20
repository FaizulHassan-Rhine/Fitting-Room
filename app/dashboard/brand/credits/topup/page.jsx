"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getWallet, addTransaction, Wallet } from "@/lib/walletStorage";
import { initializePayment, detectPaymentGateway, PaymentGateway } from "@/lib/paymentGateway";

// Credit conversion rate: $1 = 1 credit (adjust as needed)
const CREDIT_RATE = 1;


function ErrorModal({ isOpen, onClose, message }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-sm max-w-md w-full p-8 fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">Invalid Amount</h2>
        <p className="text-medium-gray text-center mb-6">{message}</p>
        <button
          onClick={onClose}
          className="btn btn-primary w-full"
        >
          OK
        </button>
      </div>
    </div>
  );
}

function PaymentConfirmationModal({ isOpen, onClose, onConfirm, amount, credits, newBalance }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-sm max-w-md w-full p-8 fade-in">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center">Credits Updated Instantly!</h2>
        
        <div className="space-y-4 my-6">
          <div className="p-4 bg-light-gray rounded-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-medium-gray">Amount:</span>
              <span className="text-xl font-bold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-medium-gray">Credits added:</span>
              <span className="text-xl font-bold text-black">{credits.toLocaleString()}</span>
            </div>
            <div className="border-t border-medium-gray pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-medium-gray">New balance:</span>
                <span className="text-2xl font-bold text-black">{newBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-light-gray rounded-sm">
            <p className="text-sm text-medium-gray text-center">
              Redirecting to Stripe for secure payment processing...
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 btn btn-primary"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TopUpPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [dollarAmount, setDollarAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentData, setPaymentData] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState("stripe");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      const brandWallet = getWallet(user.email, "brand");
      setWallet(brandWallet);
      setSelectedGateway(detectPaymentGateway());
      
      // Sync with old credits system for backward compatibility
      if (typeof window !== 'undefined') {
        const oldCredits = localStorage.getItem('brand_credits');
        if (oldCredits && brandWallet.balance !== parseInt(oldCredits, 10)) {
          // Update wallet balance to match old system
          brandWallet.balance = parseInt(oldCredits, 10);
          setWallet(brandWallet);
        }
      }
    }
  }, [user]);

  // Calculate credits based on dollar amount
  const calculateCredits = (dollars) => {
    return Math.floor(dollars * CREDIT_RATE);
  };

  // Handle dollar amount input
  const handleAmountChange = (value) => {
    // Only allow numbers and one decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('') 
      : numericValue;
    
    setDollarAmount(formattedValue);
    
    // Update selected amount if it matches a preset
    const numValue = parseFloat(formattedValue);
    if (numValue && [10, 25, 50, 100, 250, 500].includes(numValue)) {
      setSelectedAmount(numValue);
    } else {
      setSelectedAmount(null);
    }
  };

  // Handle preset amount selection
  const handlePresetSelect = (amount) => {
    setDollarAmount(amount.toString());
    setSelectedAmount(amount);
  };

  const currentCredits = wallet?.balance || 200;
  const dollarValue = parseFloat(dollarAmount) || 0;
  const creditsToAdd = calculateCredits(dollarValue);
  const newCreditsTotal = currentCredits + creditsToAdd;

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (dollarValue <= 0) {
      setErrorMessage("Please enter a valid amount");
      setShowErrorModal(true);
      return;
    }

    if (dollarValue < 1) {
      setErrorMessage("Minimum purchase amount is $1.00");
      setShowErrorModal(true);
      return;
    }

    // Calculate updated credits
    const updatedCredits = currentCredits + creditsToAdd;
    
    // Show payment confirmation modal
    setPaymentData({
      amount: dollarValue,
      credits: creditsToAdd,
      newBalance: updatedCredits,
    });
    setShowPaymentModal(true);
  };

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!paymentData || !user || !wallet) return;

    setIsProcessing(true);
    setShowPaymentModal(false);

    try {
      // Create pending transaction
      addTransaction(user.email, "brand", {
        type: "topup",
        amount: paymentData.credits,
        currency: wallet.currency,
        status: "pending",
        paymentGateway: selectedGateway,
        description: `Top-up of $${paymentData.amount.toFixed(2)} (${paymentData.credits} credits)`,
      });

      // Initialize payment
      const paymentResponse = await initializePayment({
        amount: paymentData.amount,
        currency: wallet.currency,
        userId: user.email,
        userType: "brand",
        description: `Brand Credits Top-up - ${paymentData.credits} credits`,
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

  // Handle modal close (revert credits if user cancels)
  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
  };

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="min-h-screen bg-light-gray">
      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPayment}
        amount={paymentData?.amount || 0}
        credits={paymentData?.credits || 0}
        newBalance={paymentData?.newBalance || 0}
      />
      
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 fade-in">
          <Link 
            href="/dashboard/brand?tab=credits" 
            className="text-medium-gray hover:text-black mb-4 inline-block transition-colors"
          >
            ← Back to Credits
          </Link>
          <h1 className="text-4xl font-bold mb-2 slide-up">Top Up Credits</h1>
          <p className="text-medium-gray slide-up" style={{animationDelay: '0.1s'}}>
            Add credits to your account to promote products and access advanced features
          </p>
        </div>


        {/* Current Balance */}
        <div className="card mb-6">
          <p className="text-medium-gray text-sm mb-2">Current Credits Balance</p>
          <p className="text-4xl font-bold">{currentCredits.toLocaleString()}</p>
        </div>

        {/* Top Up Form */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Select Amount</h2>

          {/* Preset Amounts */}
          <div className="mb-6">
            <p className="text-sm text-medium-gray mb-3">Quick Select</p>
            <div className="grid grid-cols-3 gap-3">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handlePresetSelect(amount)}
                  className={`py-3 px-4 rounded-sm font-medium transition-all ${
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

          {/* Custom Amount Input */}
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Or enter custom amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-medium-gray">$</span>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={dollarAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="input pl-8 text-lg"
              />
            </div>
            <p className="text-xs text-medium-gray mt-2">
              Minimum: $1.00
            </p>
          </div>

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

          {/* Credit Preview */}
          {dollarValue > 0 && (
            <div className="mb-6 p-4 bg-light-gray rounded-sm border-2 border-black">
              <div className="flex justify-between items-center mb-2">
                <span className="text-medium-gray">Amount:</span>
                <span className="text-xl font-bold">${dollarValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-medium-gray">Credits to add:</span>
                <span className="text-xl font-bold text-black">{creditsToAdd.toLocaleString()}</span>
              </div>
              <div className="border-t border-medium-gray pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-medium-gray">New balance:</span>
                  <span className="text-2xl font-bold text-black">{newCreditsTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Conversion Rate Info */}
          <div className="mb-6 p-3 bg-light-gray rounded-sm">
            <p className="text-xs text-medium-gray">
              <strong>Conversion Rate:</strong> $1.00 = {CREDIT_RATE} credit{CREDIT_RATE !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Proceed Button */}
          <button
            onClick={handleProceedToPayment}
            disabled={dollarValue <= 0 || dollarValue < 1 || isProcessing}
            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Proceed to Payment"}
          </button>

          {/* Payment Info */}
          <div className="mt-6 p-4 bg-light-gray rounded-sm">
            <p className="text-sm text-medium-gray">
              <strong>Secure Payment:</strong> You will be redirected to {selectedGateway === "sslcommerz" ? "SSLCommerz" : "Stripe"} for secure payment processing. 
              Credits will be added to your account immediately after successful payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

