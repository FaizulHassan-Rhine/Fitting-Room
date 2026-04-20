const WALLET_KEY_PREFIX = "vto_wallet_";

export function getWallet(userId, userType) {
  if (typeof window === "undefined") {
    return createDefaultWallet(userId, userType);
  }
  
  const key = `${WALLET_KEY_PREFIX}${userType}_${userId}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    const wallet = createDefaultWallet(userId, userType);
    saveWallet(wallet);
    return wallet;
  }
  
  return JSON.parse(stored);
}

export function saveWallet(wallet) {
  if (typeof window === "undefined") return;
  
  const key = `${WALLET_KEY_PREFIX}${wallet.userType}_${wallet.userId}`;
  wallet.updatedAt = new Date().toISOString();
  localStorage.setItem(key, JSON.stringify(wallet));
}

export function createDefaultWallet(userId, userType) {
  return {
    userId,
    userType,
    balance: 200,
    currency: "USD",
    transactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function addTransaction(
  userId,
  userType,
  transaction
) {
  const wallet = getWallet(userId, userType);
  
  const newTransaction = {
    ...transaction,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  
  wallet.transactions.unshift(newTransaction);
  
  // Update balance based on transaction type
  if (transaction.type === "topup" && transaction.status === "completed") {
    wallet.balance += transaction.amount;
  } else if (transaction.type === "purchase" && transaction.status === "completed") {
    wallet.balance -= transaction.amount;
  } else if (transaction.type === "refund" && transaction.status === "completed") {
    wallet.balance += transaction.amount;
  }
  
  saveWallet(wallet);
}

export function updateTransactionStatus(
  userId,
  userType,
  transactionId,
  status
) {
  const wallet = getWallet(userId, userType);
  const transaction = wallet.transactions.find(t => t.id === transactionId);
  
  if (transaction) {
    const oldStatus = transaction.status;
    transaction.status = status;
    
    // Update balance if status changed to/from completed
    if (oldStatus === "completed" && status !== "completed") {
      // Revert balance change
      if (transaction.type === "topup") {
        wallet.balance -= transaction.amount;
      } else if (transaction.type === "purchase") {
        wallet.balance += transaction.amount;
      }
    } else if (oldStatus !== "completed" && status === "completed") {
      // Apply balance change
      if (transaction.type === "topup") {
        wallet.balance += transaction.amount;
      } else if (transaction.type === "purchase") {
        wallet.balance -= transaction.amount;
      }
    }
    
    saveWallet(wallet);
  }
}

export function getWalletBalance(userId, userType) {
  const wallet = getWallet(userId, userType);
  return wallet.balance;
}

