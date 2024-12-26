"use client";
import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';

const ConnectWallet: React.FC = () => {
  const {
    connectWallet,
    disconnectWallet,
    account,
    isConnected,
    balance,
    chainId,
    error
  } = useWallet();

  const [shortAddress, setShortAddress] = useState<string>('');

  useEffect(() => {
    if (account) {
      const shortened = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
      setShortAddress(shortened);
    }
  }, [account]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const getNetworkName = (chainId: number | null): string => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Goerli Testnet';
      case 11155111:
        return 'Sepolia';
      case 137:
        return 'Polygon Mainnet';
      case 80001:
        return 'Mumbai Testnet';
      default:
        return chainId ? `Chain ID: ${chainId}` : 'Unknown Network';
    }
  };

  const formatBalance = (balance: string): string => {
    return parseFloat(balance).toFixed(4);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p>{error}</p>
        {!isConnected && (
          <button
            onClick={handleConnect}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-xl shadow-lg bg-white max-w-md mx-auto flex items-center justify-center h-full transition-all">
      {!isConnected ? (
        <button
          onClick={handleConnect}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium text-lg rounded-xl shadow-md hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-6 w-full">
          {/* Status Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-gray-900 text-lg">
                {shortAddress}
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg shadow-md hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200"
            >
              Disconnect
            </button>
          </div>
  
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-500">Network</p>
              <p className="font-medium text-gray-900 text-base">
                {getNetworkName(chainId)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-500">Balance</p>
              <p className="font-medium text-gray-900 text-base">
                {formatBalance(balance)} ETH
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default ConnectWallet;