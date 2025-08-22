// App.js
import React, { useState, useEffect, useCallback } from "react";
// Remove unused imports: Connection, PublicKey, useMemo

import {
  ConnectionProvider,
  WalletProvider,
  useWallet
} from "@solana/wallet-adapter-react";

import {
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter
} from "@solana/wallet-adapter-wallets";

// Import Phantom React SDK
import { PhantomProvider, AddressType, useConnect, useAccounts, useDisconnect } from "@phantom/react-sdk";

// Import proper encryption libraries for Phantom deep links
import nacl from 'tweetnacl';
import bs58 from 'bs58';

import "@solana/wallet-adapter-react-ui/styles.css";
import "./styles.css";
import { CONFIG } from "./config";

// ---------------------
// CONFIG (Change these)
// ---------------------
// const NETWORK = WalletAdapterNetwork.Mainnet; // Remove unused NETWORK
const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
const API_BASE = CONFIG.API.BASE_URL; // Use config file instead of hardcoded URL
const DEFAULT_COLLECTION = "j7qeFNnpWTbaf5g9sMCxP2zfKrH5QFgE56SuYjQDQi1";

// Reown AppKit Configuration - Temporarily disabled
// const REOWN_PROJECT_ID = CONFIG.REOWN_APPKIT.PROJECT_ID;

// Initialize Reown AppKit for Solana - Temporarily disabled
// const solanaAdapter = new SolanaAdapter({
//   networks: [solana],
//   projectId: REOWN_PROJECT_ID,
//   metadata: CONFIG.REOWN_APPKIT.METADATA
// });

// Create AppKit instance - Temporarily disabled
// createAppKit({
//   adapters: [solanaAdapter],
//   networks: [solana],
//   projectId: REOWN_PROJECT_ID,
//   metadata: CONFIG.REOWN_APPKIT.METADATA,
//   features: {
//     analytics: false // Disable analytics for now
//   }
// });

// ---------------------
// Utilities
// ---------------------
const shortAddress = (addr = "", len = 6) =>
  addr ? `${addr.slice(0, len)}...${addr.slice(-4)}` : "";

// Remove unused isoNow function

// ---------------------
// Professional Status Component
// ---------------------
function StatusIndicator({ type, message }) {
  const statusClasses = {
    success: "status-success",
    error: "status-error",
    warning: "status-warning",
    info: "status-info"
  };

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️"
  };

  return (
    <div className={`${statusClasses[type]} p-4 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm`}>
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icons[type]}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

// ---------------------
// Professional Stats Card
// ---------------------
function StatsCard({ title, value, icon, gradient = "gradient-primary" }) {
  return (
    <div className="card-elevated p-4 md:p-6 text-center group">
      <div className={`w-12 h-12 md:w-16 md:h-16 ${gradient} rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg group-hover:shadow-glow transition-all duration-300`}>
        <span className="text-2xl md:text-3xl">{icon}</span>
      </div>
      <div className="heading-3 mb-2 text-lg md:text-xl lg:text-2xl">{value}</div>
      <div className="text-caption text-xs md:text-sm">{title}</div>
    </div>
  );
}

// ---------------------
// Reown AppKit Connect Button Component - Temporarily disabled
// ---------------------
/*
function ReownAppKitConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleReownConnect = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      // Use Reown AppKit's built-in connection method
      console.log("🚀 Reown AppKit: Initiating wallet connection...");
      
      // Show connecting status
      // The actual connection will be handled by Reown AppKit
      
      // Simulate connection process for better UX
      setTimeout(() => {
        setIsConnecting(false);
        console.log("✅ Reown AppKit: Connection process completed");
      }, 3000);
      
    } catch (error) {
      console.error("❌ Reown AppKit connection error:", error);
      setIsConnecting(false);
    }
  }, [isConnecting]);
  
  return (
    <button
      onClick={handleReownConnect}
      disabled={isConnecting}
      className="btn btn-primary flex-1 text-sm md:text-base px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
    >
      {isConnecting ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
          <span>Connecting with Reown AppKit...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span>🚀</span>
          <span>Connect with Reown AppKit</span>
        </div>
      )}
    </button>
  );
}
*/

// ---------------------
// Professional Wallet Panel with Enhanced Mobile Support
// ---------------------
function WalletPanel({ onVerify }) {
  const { publicKey, connected } = useWallet(); // Remove unused: signTransaction, signAllTransactions, disconnect
  
  // Phantom React SDK hooks
  const { connect, isLoading: phantomConnecting } = useConnect();
  const accounts = useAccounts();
  const { disconnect: phantomDisconnect } = useDisconnect();
  
  const [status, setStatus] = useState({ type: "info", message: "🔗 Welcome! Connect your Solana wallet to start NFT verification" });
  const [verifying, setVerifying] = useState(false);
  const [nftCount, setNftCount] = useState(null);
  const [lastVerifiedAt, setLastVerifiedAt] = useState(new Date().toISOString());
  const [tgId, setTgId] = useState("7761809923"); // Add Telegram ID state with user's ID
  const [mobileWalletConnecting, setMobileWalletConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [walletType, setWalletType] = useState(""); // Add walletType state

  const walletAddress = publicKey ? publicKey.toBase58() : null;
  
  // Check if connected via Phantom SDK
  const isPhantomConnected = accounts && accounts.length > 0;
  const phantomAccount = isPhantomConnected ? accounts[0] : null;

  // Generate proper encryption key pair for Phantom deep links
  const generatePhantomEncryptionKey = () => {
    try {
      // Generate proper keypair using nacl.box.keyPair()
      const keypair = nacl.box.keyPair();
      
      // Return the public key encoded in base58 (Phantom expects base58)
      const publicKey = bs58.encode(keypair.publicKey);
      
      console.log("🔐 Generated Phantom encryption public key:", publicKey);
      
      // Store the keypair for later use (you might need the private key for decryption)
      if (!window.phantomKeypair) {
        window.phantomKeypair = keypair;
      }
      
      return publicKey;
    } catch (error) {
      console.error("❌ Error generating Phantom encryption key:", error);
      
      // Fallback to simple generation if nacl fails
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2);
      return btoa(timestamp + random).substring(0, 32);
    }
  };

  // App metadata for Phantom deep links
  const getAppMetadata = () => {
    return {
      name: "Meta Betties NFT Verification",
      url: "https://admin-q2j7.onrender.com",
      description: "NFT verification portal for Meta Betties community",
      icon: "https://admin-q2j7.onrender.com/favicon.ico", // You can add a favicon
      cluster: "mainnet-beta"
    };
  };

  // Handle redirect back from Phantom with wallet info
  const handlePhantomRedirect = (publicKey, signature) => {
    try {
      console.log("🔄 Handling Phantom redirect with wallet info...");
      console.log("🔑 Public Key:", publicKey);
      console.log("✍️ Signature:", signature);
      
      if (publicKey) {
        // Update UI to show connected wallet
        setStatus({ 
          type: "success", 
          message: `🎉 Phantom wallet connected! Address: ${shortAddress(publicKey)}` 
        });
        
        // Store wallet info for later use
        if (!window.phantomWalletInfo) {
          window.phantomWalletInfo = {
            publicKey: publicKey,
            signature: signature,
            connectedAt: new Date().toISOString(),
            walletType: 'Phantom'
          };
        }
        
        // Update connection state
        setMobileWalletConnecting(false);
        setConnectionAttempts(0);
        
        // Show success message with wallet address
        setTimeout(() => {
          setStatus({ 
            type: "success", 
            message: `🎉 Wallet connected successfully! Address: ${shortAddress(publicKey)}` 
          });
        }, 2000);
        
        console.log("✅ Phantom redirect handled successfully");
        return true;
      } else {
        console.warn("⚠️ No public key in Phantom redirect");
        setStatus({ 
          type: "warning", 
          message: "⚠️ Wallet connection incomplete. Please try again." 
        });
        return false;
      }
    } catch (error) {
      console.error("❌ Error handling Phantom redirect:", error);
      setStatus({ 
        type: "error", 
        message: "❌ Error processing wallet connection. Please try again." 
      });
      return false;
    }
  };

  // Universal wallet info handler for all wallet types
  const handleWalletInfo = (publicKey, signature, walletType = 'Unknown') => {
    try {
      console.log(`🔄 Handling ${walletType} wallet info...`);
      console.log("🔑 Public Key:", publicKey);
      console.log("✍️ Signature:", signature);
      console.log("📱 Wallet Type:", walletType);
      
      if (publicKey) {
        // Update UI to show connected wallet
        setStatus({ 
          type: "success", 
          message: `🎉 ${walletType} wallet connected! Address: ${shortAddress(publicKey)}` 
        });
        
        // Store universal wallet info
        if (!window.universalWalletInfo) {
          window.universalWalletInfo = {
            publicKey: publicKey,
            signature: signature,
            connectedAt: new Date().toISOString(),
            walletType: walletType
          };
        }
        
        // Also store wallet-specific info for backward compatibility
        if (walletType.toLowerCase() === 'phantom') {
          window.phantomWalletInfo = {
            publicKey: publicKey,
            signature: signature,
            connectedAt: new Date().toISOString(),
            walletType: walletType
          };
        } else if (walletType.toLowerCase() === 'solflare') {
          window.solflareWalletInfo = {
            publicKey: publicKey,
            signature: signature,
            connectedAt: new Date().toISOString(),
            walletType: walletType
          };
        } else if (walletType.toLowerCase() === 'coinbase') {
          window.coinbaseWalletInfo = {
            publicKey: publicKey,
            signature: signature,
            connectedAt: new Date().toISOString(),
            walletType: walletType
          };
        }
        
        // Update connection state
        setMobileWalletConnecting(false);
        setConnectionAttempts(0);
        
        // Show success message with wallet address
        setTimeout(() => {
          setStatus({ 
            type: "success", 
            message: `🎉 ${walletType} wallet connected successfully! Address: ${shortAddress(publicKey)}` 
          });
        }, 2000);
        
        console.log(`✅ ${walletType} wallet info handled successfully`);
        return true;
      } else {
        console.warn(`⚠️ No public key in ${walletType} wallet info`);
        setStatus({ 
          type: "warning", 
          message: `⚠️ ${walletType} wallet connection incomplete. Please try again.` 
        });
        return false;
      }
    } catch (error) {
      console.error(`❌ Error handling ${walletType} wallet info:`, error);
      setStatus({ 
        type: "error", 
        message: `❌ Error processing ${walletType} wallet connection. Please try again.` 
      });
      return false;
    }
  };

  // Manual Phantom wallet detection and debugging
  const checkPhantomWallet = () => {
    console.log("🔍 Manual Phantom wallet detection started...");
    
    const detectionResults = {
      windowSolana: !!window.solana,
      windowSolanaIsPhantom: !!window.solana?.isPhantom,
      windowPhantom: !!window.phantom,
      windowPhantomSolana: !!window.phantom?.solana,
      windowPhantomSolanaIsPhantom: !!window.phantom?.solana?.isPhantom,
      windowPhantomWallet: !!window.phantomWallet,
      windowPhantomWalletExtension: !!window.phantomWalletExtension,
      windowPhantomWalletAdapter: !!window.phantomWalletAdapter,
      documentPhantom: !!document.phantom,
      navigatorPhantom: !!navigator.phantom,
      userAgent: window.navigator.userAgent,
      isMobile: window.navigator.userAgent.includes('Mobile'),
      isIOS: /iPad|iPhone|iPod/.test(window.navigator.userAgent),
      isAndroid: /Android/.test(window.navigator.userAgent)
    };
    
    console.log("📊 Phantom detection results:", detectionResults);
    
    // Check for any Phantom-related objects
    let phantomDetected = false;
    let detectionMethod = "";
    
    if (window.solana?.isPhantom) {
      phantomDetected = true;
      detectionMethod = "window.solana.isPhantom";
    } else if (window.phantom?.solana?.isPhantom) {
      phantomDetected = true;
      detectionMethod = "window.phantom.solana.isPhantom";
    } else if (window.phantom?.solana) {
      phantomDetected = true;
      detectionMethod = "window.phantom.solana";
    } else if (window.solana) {
      phantomDetected = true;
      detectionMethod = "window.solana";
    } else if (window.phantom) {
      phantomDetected = true;
      detectionMethod = "window.phantom";
    } else if (window.phantomWallet) {
      phantomDetected = true;
      detectionMethod = "window.phantomWallet";
    } else if (window.phantomWalletExtension) {
      phantomDetected = true;
      detectionMethod = "window.phantomWalletExtension";
    } else if (window.phantomWalletAdapter) {
      phantomDetected = true;
      detectionMethod = "window.phantomWalletAdapter";
    }
    
    if (phantomDetected) {
      console.log("✅ Phantom wallet detected via:", detectionMethod);
      setStatus({ 
        type: "success", 
        message: `✅ Phantom wallet detected via ${detectionMethod}` 
      });
    } else {
      console.log("❌ Phantom wallet not detected");
      setStatus({ 
        type: "warning", 
        message: "❌ Phantom wallet not detected. Please make sure Phantom app is installed and try again." 
      });
      
      // Show detailed debugging info
      console.log("🔍 Debugging information:");
      console.log("- User Agent:", window.navigator.userAgent);
      console.log("- Is Mobile:", window.navigator.userAgent.includes('Mobile'));
      console.log("- Is iOS:", /iPad|iPhone|iPod/.test(window.navigator.userAgent));
      console.log("- Is Android:", /Android/.test(window.navigator.userAgent));
      console.log("- Window objects:", Object.keys(window).filter(key => key.toLowerCase().includes('phantom')));
      console.log("- Solana objects:", Object.keys(window).filter(key => key.toLowerCase().includes('solana')));
    }
    
    return { phantomDetected, detectionMethod, detectionResults };
  };

  // Helper function to handle popup blocking with user interaction
  const safeOpenPopup = (url, title = 'Redirect') => {
    try {
      // First try to open popup directly
      const popup = window.open(url, '_blank');
      
      // Check if popup was blocked
      if (!popup || popup.closed) {
        console.log("⚠️ Popup blocked, creating user interaction button");
        
        // Create a floating button for user to click
        const button = document.createElement('button');
        button.textContent = `🚀 ${title}`;
        button.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          padding: 20px 40px;
          background: linear-gradient(45deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 15px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.05); }
            100% { transform: translate(-50%, -50%) scale(1); }
          }
        `;
        document.head.appendChild(style);
        
        button.onclick = () => {
          // User interaction - this should work without popup blocking
          window.open(url, '_blank');
          document.body.removeChild(button);
          document.head.removeChild(style);
        };
        
        document.body.appendChild(button);
        
        // Auto-remove after 20 seconds
        setTimeout(() => {
          if (document.body.contains(button)) {
            document.body.removeChild(button);
            if (document.head.contains(style)) {
              document.head.removeChild(style);
            }
          }
        }, 20000);
        
        return false; // Popup was blocked
      }
      
      return true; // Popup opened successfully
    } catch (error) {
      console.error("Error opening popup:", error);
      return false;
    }
  };

  // Auto-fetch Telegram ID from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tgIdFromUrl = urlParams.get('tg_id') || urlParams.get('telegram_id') || urlParams.get('id');
    
    if (tgIdFromUrl) {
      setTgId(tgIdFromUrl);
      console.log("📱 Telegram ID fetched from URL:", tgIdFromUrl);
      
      // Show success message that ID was auto-fetched
      setStatus({ 
        type: "success", 
        message: `📱 Telegram ID automatically fetched: ${tgIdFromUrl}` 
      });
    }
    
    // Check for Phantom redirect parameters
    const phantomPublicKey = urlParams.get('phantom_public_key') || urlParams.get('public_key') || urlParams.get('pk');
    const phantomSignature = urlParams.get('phantom_signature') || urlParams.get('signature') || urlParams.get('sig');
    const phantomRedirect = urlParams.get('phantom_redirect') || urlParams.get('redirect') || urlParams.get('rd');
    
    if (phantomPublicKey && phantomSignature) {
      console.log("🔄 Phantom redirect detected with wallet info");
      console.log("🔑 Public Key:", phantomPublicKey);
      console.log("✍️ Signature:", phantomSignature);
      console.log("🔄 Redirect:", phantomRedirect);
      
      // Handle the Phantom redirect
      const success = handlePhantomRedirect(phantomPublicKey, phantomSignature);
      
      if (success) {
        // Clear the URL parameters after successful handling
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('phantom_public_key');
        newUrl.searchParams.delete('phantom_signature');
        newUrl.searchParams.delete('phantom_redirect');
        newUrl.searchParams.delete('public_key');
        newUrl.searchParams.delete('signature');
        newUrl.searchParams.delete('redirect');
        newUrl.searchParams.delete('pk');
        newUrl.searchParams.delete('sig');
        newUrl.searchParams.delete('rd');
        
        // Update URL without page reload
        window.history.replaceState({}, '', newUrl.toString());
        console.log("✅ URL parameters cleared after successful redirect handling");
      }
    }
    
    // Check for universal wallet redirect parameters (all wallet types)
    const universalPublicKey = urlParams.get('wallet_public_key') || urlParams.get('pk') || urlParams.get('public_key');
    const universalSignature = urlParams.get('wallet_signature') || urlParams.get('sig') || urlParams.get('signature');
    const universalWalletType = urlParams.get('wallet_type') || urlParams.get('type') || urlParams.get('wallet');
    const universalRedirect = urlParams.get('wallet_redirect') || urlParams.get('redirect') || urlParams.get('rd');
    
    if (universalPublicKey && universalSignature && universalWalletType) {
      console.log("🔄 Universal wallet redirect detected");
      console.log("🔑 Public Key:", universalPublicKey);
      console.log("✍️ Signature:", universalSignature);
      console.log("📱 Wallet Type:", universalWalletType);
      console.log("🔄 Redirect:", universalRedirect);
      
      // Handle the universal wallet redirect
      const success = handleWalletInfo(universalPublicKey, universalSignature, universalWalletType);
      
      if (success) {
        // Clear the URL parameters after successful handling
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('wallet_public_key');
        newUrl.searchParams.delete('wallet_signature');
        newUrl.searchParams.delete('wallet_type');
        newUrl.searchParams.delete('wallet_redirect');
        newUrl.searchParams.delete('pk');
        newUrl.searchParams.delete('sig');
        newUrl.searchParams.delete('type');
        newUrl.searchParams.delete('wallet');
        newUrl.searchParams.delete('redirect');
        newUrl.searchParams.delete('rd');
        
        // Update URL without page reload
        window.history.replaceState({}, '', newUrl.toString());
        console.log("✅ Universal wallet URL parameters cleared after successful redirect handling");
      }
    }
    
    // Check for Solflare specific redirect parameters
    const solflarePublicKey = urlParams.get('solflare_public_key') || urlParams.get('sf_pk');
    const solflareSignature = urlParams.get('solflare_signature') || urlParams.get('sf_sig');
    
    if (solflarePublicKey && solflareSignature) {
      console.log("🔄 Solflare redirect detected with wallet info");
      console.log("🔑 Public Key:", solflarePublicKey);
      console.log("✍️ Signature:", solflareSignature);
      
      // Handle the Solflare redirect
      const success = handleWalletInfo(solflarePublicKey, solflareSignature, 'Solflare');
      
      if (success) {
        // Clear the URL parameters after successful handling
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('solflare_public_key');
        newUrl.searchParams.delete('solflare_signature');
        newUrl.searchParams.delete('sf_pk');
        newUrl.searchParams.delete('sf_sig');
        
        // Update URL without page reload
        window.history.replaceState({}, '', newUrl.toString());
        console.log("✅ Solflare URL parameters cleared after successful redirect handling");
      }
    }
    
    // Check for Coinbase specific redirect parameters
    const coinbasePublicKey = urlParams.get('coinbase_public_key') || urlParams.get('cb_pk');
    const coinbaseSignature = urlParams.get('coinbase_signature') || urlParams.get('cb_sig');
    
    if (coinbasePublicKey && coinbaseSignature) {
      console.log("🔄 Coinbase redirect detected with wallet info");
      console.log("🔑 Public Key:", coinbasePublicKey);
      console.log("✍️ Signature:", coinbaseSignature);
      
      // Handle the Coinbase redirect
      const success = handleWalletInfo(coinbasePublicKey, coinbaseSignature, 'Coinbase');
      
      if (success) {
        // Clear the URL parameters after successful handling
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('coinbase_public_key');
        newUrl.searchParams.delete('coinbase_signature');
        newUrl.searchParams.delete('cb_pk');
        newUrl.searchParams.delete('cb_sig');
        
        // Update URL without page reload
        window.history.replaceState({}, '', newUrl.toString());
        console.log("✅ Coinbase URL parameters cleared after successful redirect handling");
      }
    }
  }, []);

  // Auto-check for Phantom wallet when component mounts
  useEffect(() => {
    // Wait a bit for wallet injection
    const checkPhantomAfterDelay = () => {
      setTimeout(() => {
        console.log("🔍 Auto-checking for Phantom wallet...");
        checkPhantomWallet();
      }, 2000); // Wait 2 seconds for wallet injection
    };
    
    checkPhantomAfterDelay();
  }, []);

  // Save auto-connect preference when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      // Show success message when wallet connects
      const walletName = mobileWalletConnecting ? "Mobile wallet" : "Wallet";
      setStatus({ 
        type: "success", 
        message: `🎉 ${walletName} connected successfully! Address: ${shortAddress(publicKey.toBase58())}` 
      });
      
      // Reset mobile connection state
      setMobileWalletConnecting(false);
      setConnectionAttempts(0);
      
      // Show mobile-specific success message
      if (window.navigator.userAgent.includes('Mobile')) {
        setTimeout(() => {
          setStatus({ 
            type: "success", 
            message: `🎉 Mobile wallet connected! You can now verify your NFT. Address: ${shortAddress(publicKey.toBase58())}` 
          });
        }, 1000);
      }
    } else if (!connected) {
      // Show message when wallet disconnects
      setStatus({ 
        type: "info", 
        message: "🔌 Wallet disconnected. Connect your wallet to get started." 
      });
    }
  }, [connected, publicKey, mobileWalletConnecting]);

  // Enhanced mobile wallet connection with improved logic for all wallet types
  const handleMobileWalletConnection = useCallback(async (selectedWalletType) => {
    if (mobileWalletConnecting) return;
    
    setWalletType(selectedWalletType);
    setMobileWalletConnecting(true);
    setConnectionAttempts(0);
    
    // Show user confirmation first
    setStatus({ 
      type: "info", 
      message: `📱 ${selectedWalletType} wallet selected. Click "Connect" to proceed...` 
    });
    
    // Add a small delay to let user see the confirmation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Ask for user confirmation before proceeding
    const userConfirmed = window.confirm(
      `Do you want to connect to ${selectedWalletType} wallet?\n\n` +
      `This will open the ${selectedWalletType} app and request connection permission.`
    );
    
    if (!userConfirmed) {
      console.log(`📱 User cancelled ${selectedWalletType} connection`);
      setMobileWalletConnecting(false);
      setStatus({ 
        type: "info", 
        message: "🔌 Wallet connection cancelled by user." 
      });
      return;
    }
    
    // User confirmed, proceed with connection
    setStatus({ type: "info", message: `📱 Opening ${selectedWalletType} wallet...` });
    
    try {
      // Enhanced deep link approach for mobile wallet connection
      let deepLinks = [];
      let fallbackUrl = '';
      let walletMetadata = null;
      
      // Generate multiple deep link formats for better compatibility
      switch (selectedWalletType.toLowerCase()) {
        case 'phantom':
          // Phantom official deep link format according to docs.phantom.com
          // Use specific app URL for better integration
          walletMetadata = {
            name: "Meta Betties NFT Verification",
            url: "https://admin-q2j7.onrender.com",
            description: "NFT verification portal for Meta Betties community",
            icon: "https://admin-q2j7.onrender.com/favicon.ico",
            cluster: "mainnet-beta",
            deepLinkBase: "https://phantom.app/ul/v1/connect"
          };
          
          const phantomAppUrl = encodeURIComponent(walletMetadata.url);
          const phantomRedirectLink = encodeURIComponent(window.location.href);
          const phantomCluster = walletMetadata.cluster;
          
          // Generate proper encryption public key for Phantom
          const dappEncryptionKey = generatePhantomEncryptionKey();
          
          // Build official Phantom deep link with proper parameters
          const officialPhantomLink = new URL(walletMetadata.deepLinkBase);
          officialPhantomLink.searchParams.append("app_url", phantomAppUrl);
          officialPhantomLink.searchParams.append("dapp_encryption_public_key", dappEncryptionKey);
          officialPhantomLink.searchParams.append("redirect_link", phantomRedirectLink);
          officialPhantomLink.searchParams.append("cluster", phantomCluster);
          
          console.log("🔗 Official Phantom deep link for Meta Betties:", officialPhantomLink.toString());
          console.log("📱 App Name:", walletMetadata.name);
          console.log("📱 App URL:", phantomAppUrl);
          console.log("📱 Redirect Link:", phantomRedirectLink);
          console.log("🔐 Encryption Key:", dappEncryptionKey);
          console.log("🌐 Cluster:", phantomCluster);
          
          deepLinks = [
            // Official Phantom deep link format (primary)
            officialPhantomLink.toString(),
            // Alternative formats for better compatibility
            `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`,
            `https://phantom.app/ul/browse/${window.location.href}`,
            `phantom://ul/browse/${encodeURIComponent(window.location.href)}`,
            // Fallback URLs
            `https://phantom.app/`,
            `https://phantom.app/ul/`
          ];
          fallbackUrl = 'https://phantom.app/';
          break;
          
        case 'solflare':
          // Solflare professional deep link format
          walletMetadata = {
            name: "Meta Betties NFT Verification",
            url: "https://admin-q2j7.onrender.com",
            description: "NFT verification portal for Meta Betties community",
            icon: "https://admin-q2j7.onrender.com/favicon.ico",
            cluster: "mainnet-beta",
            deepLinkBase: "https://solflare.com/ul/v1/connect"
          };
          
          const solflareAppUrl = encodeURIComponent(walletMetadata.url);
          const solflareRedirectLink = encodeURIComponent(window.location.href);
          const solflareCluster = walletMetadata.cluster;
          
          // Build Solflare deep link with proper parameters
          const officialSolflareLink = new URL(walletMetadata.deepLinkBase);
          officialSolflareLink.searchParams.append("app_url", solflareAppUrl);
          officialSolflareLink.searchParams.append("redirect_link", solflareRedirectLink);
          officialSolflareLink.searchParams.append("cluster", solflareCluster);
          
          console.log("🔗 Official Solflare deep link for Meta Betties:", officialSolflareLink.toString());
          console.log("📱 App Name:", walletMetadata.name);
          console.log("📱 App URL:", solflareAppUrl);
          console.log("📱 Redirect Link:", solflareRedirectLink);
          console.log("🌐 Cluster:", solflareCluster);
          
          deepLinks = [
            // Official Solflare deep link format (primary)
            officialSolflareLink.toString(),
            // Alternative formats for better compatibility
            `solflare://ul/browse/${encodeURIComponent(window.location.href)}`,
            `https://solflare.com/ul/browse/${encodeURIComponent(window.location.href)}`,
            `https://solflare.com/ul/browse/${window.location.href}`,
            // Fallback URLs
            `https://solflare.com/`,
            `https://solflare.com/ul/`
          ];
          fallbackUrl = 'https://solflare.com/';
          break;
          
        case 'coinbase':
          // Coinbase professional deep link format
          walletMetadata = {
            name: "Meta Betties NFT Verification",
            url: "https://admin-q2j7.onrender.com",
            description: "NFT verification portal for Meta Betties community",
            icon: "https://admin-q2j7.onrender.com/favicon.ico",
            cluster: "mainnet-beta",
            deepLinkBase: "https://wallet.coinbase.com/wallet-selector"
          };
          
          const coinbaseAppUrl = encodeURIComponent(walletMetadata.url);
          const coinbaseRedirectLink = encodeURIComponent(window.location.href);
          const coinbaseCluster = walletMetadata.cluster;
          
          // Build Coinbase deep link with proper parameters
          const officialCoinbaseLink = new URL(walletMetadata.deepLinkBase);
          officialCoinbaseLink.searchParams.append("redirect_uri", coinbaseRedirectLink);
          officialCoinbaseLink.searchParams.append("app_url", coinbaseAppUrl);
          officialCoinbaseLink.searchParams.append("cluster", coinbaseCluster);
          
          console.log("🔗 Official Coinbase deep link for Meta Betties:", officialCoinbaseLink.toString());
          console.log("📱 App Name:", walletMetadata.name);
          console.log("📱 App URL:", coinbaseAppUrl);
          console.log("📱 Redirect Link:", coinbaseRedirectLink);
          console.log("🌐 Cluster:", coinbaseCluster);
          
          deepLinks = [
            // Official Coinbase deep link format (primary)
            officialCoinbaseLink.toString(),
            // Alternative formats for better compatibility
            `coinbase-wallet://wallet-selector?redirect_uri=${encodeURIComponent(window.location.href)}`,
            `https://wallet.coinbase.com/wallet-selector?redirect_uri=${encodeURIComponent(window.location.href)}`,
            // Fallback URLs
            `https://wallet.coinbase.com/`,
            `https://wallet.coinbase.com/wallet-selector`
          ];
          fallbackUrl = 'https://wallet.coinbase.com/';
          break;
          
        default:
          walletMetadata = {
            name: "Meta Betties NFT Verification",
            url: "https://admin-q2j7.onrender.com",
            description: "NFT verification portal for Meta Betties community",
            icon: "https://admin-q2j7.onrender.com/favicon.ico",
            cluster: "mainnet-beta"
          };
          deepLinks = [window.location.href];
          fallbackUrl = window.location.href;
          break;
      }
      
      console.log(`📱 Enhanced: Attempting to connect to ${selectedWalletType} with ${deepLinks.length} deep link formats`);
      
      // For mobile devices, try multiple connection methods
      if (window.navigator.userAgent.includes('Mobile')) {
        console.log("📱 Mobile device detected, using enhanced mobile connection strategy");
        
        let connectionAttempted = false;
        
        // Method 1: Try direct wallet detection first (if available)
        if (selectedWalletType.toLowerCase() === 'phantom' && (window.solana?.isPhantom || window.phantom?.solana?.isPhantom || window.phantom?.solana || window.solana)) {
          try {
            console.log("📱 Phantom detected, asking user permission for direct connection...");
            
            // Ask user permission before direct connection
            const directConnectConfirmed = window.confirm(
              "Phantom wallet is detected on your device.\n\n" +
              "Do you want to connect directly to Phantom?\n\n" +
              "This will request connection permission from your wallet."
            );
            
            if (directConnectConfirmed) {
              // Try multiple Phantom connection methods
              let connected = false;
              
              if (window.solana?.isPhantom) {
                try {
                  await window.solana.connect();
                  connected = true;
                  console.log("📱 Phantom connected via window.solana.connect()");
                } catch (error) {
                  console.log("📱 window.solana.connect() failed:", error);
                }
              }
              
              if (!connected && window.phantom?.solana?.connect) {
                try {
                  await window.phantom.solana.connect();
                  connected = true;
                  console.log("📱 Phantom connected via window.phantom.solana.connect()");
                } catch (error) {
                  console.log("📱 window.phantom.solana.connect() failed:", error);
                }
              }
              
              if (connected) {
                connectionAttempted = true;
                console.log("📱 Phantom connected via direct method");
              }
            } else {
              console.log("📱 User declined direct Phantom connection");
            }
          } catch (error) {
            console.log("📱 Direct Phantom connection failed:", error);
          }
        }
        
        // Phantom deep link response handling with improved mobile integration
        if (selectedWalletType.toLowerCase() === 'phantom' && !connectionAttempted) {
          try {
            console.log("📱 Setting up Phantom deep link response handler...");
            
            // Set up custom redirect scheme handler for return flow
            const handleCustomRedirect = (event) => {
              console.log("📱 Custom redirect event received:", event);
              
              // Handle custom scheme redirects (e.g., mydapp://onConnect)
              if (event.data && event.data.type === 'phantom_redirect') {
                console.log("📱 Phantom redirect received:", event.data);
                // Process the redirect data
              }
            };
            
            // Set up page visibility change handler for mobile app return
            const handleVisibilityChange = () => {
              if (!document.hidden) {
                console.log("📱 User returned from Phantom app, checking connection status...");
                
                // Check if wallet is now connected
                setTimeout(() => {
                  if (window.solana?.isPhantom && window.solana.isConnected) {
                    console.log("📱 Phantom wallet connected after app return!");
                    const walletAddress = window.solana.publicKey?.toBase58();
                    setStatus({ 
                      type: "success", 
                      message: `🎉 Phantom wallet connected! Address: ${shortAddress(walletAddress)}` 
                    });
                    connectionAttempted = true;
                  } else if (window.phantom?.solana?.isConnected) {
                    console.log("📱 Phantom wallet connected after app return (alternative method)!");
                    const walletAddress = window.phantom.solana.publicKey?.toBase58();
                    setStatus({ 
                      type: "success", 
                      message: `🎉 Phantom wallet connected! Address: ${shortAddress(walletAddress)}` 
                    });
                    connectionAttempted = true;
                  } else {
                    console.log("📱 Phantom wallet not connected after app return");
                    setStatus({ 
                      type: "info", 
                      message: "📱 Phantom app opened. Please approve the connection and return here." 
                    });
                  }
                }, 1000);
              }
            };
            
            // Add visibility change listener
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            // Add custom redirect listener
            window.addEventListener('message', handleCustomRedirect);
            
            // Listen for Phantom deep link response with public key and signature
            const handlePhantomResponse = (event) => {
              if (event.data && event.data.type === 'phantom_deeplink_response') {
                console.log("📱 Phantom deep link response received:", event.data);
                
                // Handle the response data with public key and signature
                if (event.data.data) {
                  try {
                    // Process the encrypted data from Phantom
                    console.log("📱 Phantom connection successful, processing response...");
                    
                    // Extract public key and signature from Phantom response
                    const { publicKey, signature } = event.data.data;
                    
                    if (publicKey) {
                      console.log("🔑 Phantom returned public key:", publicKey);
                      console.log("✍️ Phantom returned signature:", signature);
                      
                      // Use the dedicated redirect handler
                      const success = handlePhantomRedirect(publicKey, signature);
                      
                      if (success) {
                        connectionAttempted = true;
                        console.log("✅ Phantom connection completed via redirect handler");
                      }
                      
                    } else {
                      console.warn("⚠️ No public key in Phantom response");
                      setStatus({ 
                        type: "warning", 
                        message: "⚠️ Phantom connection incomplete. Please try again." 
                      });
                    }
                    
                  } catch (error) {
                    console.error("📱 Error processing Phantom response:", error);
                    setStatus({ 
                      type: "error", 
                      message: "❌ Error processing wallet connection. Please try again." 
                    });
                  }
                }
                
                // Remove the event listener
                window.removeEventListener('message', handlePhantomResponse);
              }
            };
            
            // Add event listener for Phantom response
            window.addEventListener('message', handlePhantomResponse);
            
            // Cleanup after 30 seconds
            setTimeout(() => {
              window.removeEventListener('message', handlePhantomResponse);
              window.removeEventListener('message', handleCustomRedirect);
              document.removeEventListener('visibilitychange', handleVisibilityChange);
            }, 30000);
            
          } catch (error) {
            console.log("📱 Phantom deep link handler setup failed:", error);
          }
        }
        
        if (selectedWalletType.toLowerCase() === 'solflare' && window.solflare?.isSolflare) {
          try {
            console.log("📱 Solflare detected, asking user permission for direct connection...");
            
            // Ask user permission before direct connection
            const directConnectConfirmed = window.confirm(
              "Solflare wallet is detected on your device.\n\n" +
              "Do you want to connect directly to Solflare?\n\n" +
              "This will request connection permission from your wallet."
            );
            
            if (directConnectConfirmed) {
              await window.solflare.connect();
              connectionAttempted = true;
              console.log("📱 Solflare connected via direct method");
            } else {
              console.log("📱 User declined direct Solflare connection");
            }
          } catch (error) {
            console.log("📱 Direct Solflare connection failed:", error);
          }
        }
        
        if (selectedWalletType.toLowerCase() === 'coinbase' && window.coinbaseWallet) {
          try {
            console.log("📱 Coinbase detected, asking user permission for direct connection...");
            
            // Ask user permission before direct connection
            const directConnectConfirmed = window.confirm(
              "Coinbase wallet is detected on your device.\n\n" +
              "Do you want to connect directly to Coinbase?\n\n" +
              "This will request connection permission from your wallet."
            );
            
            if (directConnectConfirmed) {
              await window.coinbaseWallet.requestAccounts();
              connectionAttempted = true;
              console.log("📱 Coinbase connected via direct method");
            } else {
              console.log("📱 User declined direct Coinbase connection");
            }
          } catch (error) {
            console.log("📱 Direct Coinbase connection failed:", error);
          }
        }
        
        // Method 2: If direct connection failed, try deep links
        if (!connectionAttempted) {
          console.log("📱 Direct connection failed, trying deep links...");
          
          // Special handling for Phantom wallet
          if (selectedWalletType.toLowerCase() === 'phantom') {
            console.log("📱 Using official Phantom deep link format...");
            setStatus({ 
              type: "info", 
              message: "📱 Opening Phantom app with official deep link..." 
            });
          }
          
          // Try each deep link format
          for (let i = 0; i < deepLinks.length; i++) {
            const deepLink = deepLinks[i];
            console.log(`📱 Trying deep link ${i + 1}/${deepLinks.length}:`, deepLink);
            
            try {
              // Validate deep link format
              if (i === 0 && selectedWalletType.toLowerCase() === 'phantom') {
                // Validate official Phantom deep link
                try {
                  const url = new URL(deepLink);
                  if (url.hostname !== 'phantom.app' || !url.pathname.includes('/ul/v1/connect')) {
                    console.warn("⚠️ Invalid official Phantom deep link format:", deepLink);
                    continue;
                  }
                  
                  // Check required parameters
                  const appUrl = url.searchParams.get('app_url');
                  const dappKey = url.searchParams.get('dapp_encryption_public_key');
                  const redirectLink = url.searchParams.get('redirect_link');
                  
                  if (!appUrl || !dappKey || !redirectLink) {
                    console.warn("⚠️ Missing required parameters in official Phantom deep link");
                    continue;
                  }
                  
                  console.log("✅ Official Phantom deep link validation passed");
                } catch (validationError) {
                  console.warn("⚠️ Deep link validation failed:", validationError);
                  continue;
                }
              }
              
              // Try to open deep link
              const newWindow = window.open(deepLink, '_blank');
              
              // Check if window opened successfully
              if (newWindow && !newWindow.closed) {
                console.log(`📱 Deep link ${i + 1} opened successfully`);
                
                // Special status for Phantom
                if (selectedWalletType.toLowerCase() === 'phantom') {
                  if (i === 0) {
                    setStatus({ 
                      type: "info", 
                      message: "📱 Phantom app opened with official deep link! Please approve the connection request and return here..." 
                    });
                  } else {
                    setStatus({ 
                      type: "info", 
                      message: "📱 Phantom app opened! Please approve the connection request and return here..." 
                    });
                  }
                  
                  // Set up a timer to check if user returned
                  setTimeout(() => {
                    if (!connected && !connectionAttempted) {
                      setStatus({ 
                        type: "warning", 
                        message: "📱 Waiting for Phantom connection... Please approve in the app and return here." 
                      });
                    }
                  }, 3000);
                }
                
                break;
              } else {
                console.log(`📱 Deep link ${i + 1} failed, trying next...`);
                
                // If this is the official Phantom deep link and it failed, show specific message
                if (selectedWalletType.toLowerCase() === 'phantom' && i === 0) {
                  setStatus({ 
                    type: "warning", 
                    message: "⚠️ Official Phantom deep link failed. Trying alternative methods..." 
                  });
                }
              }
              
              // Small delay between attempts
              await new Promise(resolve => setTimeout(resolve, 500));
              
            } catch (deepLinkError) {
              console.warn(`📱 Deep link ${i + 1} error:`, deepLinkError);
              continue;
            }
          }
        }
        
        // Method 3: Fallback to app store or website
        setTimeout(() => {
          if (!connected && mobileWalletConnecting) {
            console.log("📱 Connection timeout, checking wallet status...");
            
            // Check if wallet is actually installed but connection failed
            let walletInstalled = false;
            if (selectedWalletType.toLowerCase() === 'phantom') {
              walletInstalled = !!(window.solana?.isPhantom || window.phantom?.solana?.isPhantom || window.phantom?.solana || window.solana);
            } else if (selectedWalletType.toLowerCase() === 'solflare') {
              walletInstalled = !!(window.solflare?.isSolflare || window.solflare?.isSolflareWallet || window.solflare);
            } else if (selectedWalletType.toLowerCase() === 'coinbase') {
              walletInstalled = !!(window.coinbaseWallet || window.coinbaseWalletExtension);
            }
            
            if (walletInstalled) {
              // Wallet is installed but connection failed
              setStatus({ 
                type: "warning", 
                message: `⚠️ ${selectedWalletType} is installed but connection failed. Please check the app and try again.` 
              });
              
              // Show manual connection instructions
              setTimeout(() => {
                setStatus({ 
                  type: "info", 
                  message: `📱 Please open ${selectedWalletType} app manually and approve the connection, then return here.` 
                });
              }, 3000);
            } else {
              // Wallet not detected, suggest installation
              setStatus({ 
                type: "warning", 
                message: `⚠️ ${selectedWalletType} app not responding. Opening fallback options...` 
              });
              
              // Open fallback URL
              window.open(fallbackUrl, '_blank');
              
              // Show manual connection instructions
              setTimeout(() => {
                setStatus({ 
                  type: "info", 
                  message: `📱 Please install ${selectedWalletType} app and return here to connect manually.` 
                });
              }, 2000);
            }
          }
        }, 10000); // Increased timeout for better UX
        
      } else {
        // For desktop, open in new tab
        console.log("🖥️ Desktop device, opening in new tab");
        window.open(deepLinks[0], '_blank');
      }
      
      // Set up connection monitoring with better error handling
      const maxAttempts = 20; // Increased timeout for better UX
      const checkInterval = setInterval(() => {
        setConnectionAttempts(prev => {
          const newAttempts = prev + 1;
          
          if (newAttempts >= maxAttempts) {
            clearInterval(checkInterval);
            setMobileWalletConnecting(false);
            setStatus({ 
              type: "warning", 
              message: `⚠️ Connection timeout for ${selectedWalletType}. Please check if the app is installed and try again.` 
            });
            return 0;
          }
          
          // Check if wallet is now connected
          if (connected) {
            clearInterval(checkInterval);
            setMobileWalletConnecting(false);
            setStatus({ 
              type: "success", 
              message: `🎉 ${selectedWalletType} wallet connected successfully!` 
            });
            return 0;
          }
          
          // Update status based on attempt count with better messages
          let statusMessage = '';
          if (newAttempts <= 8) {
            statusMessage = `📱 Opening ${selectedWalletType} app... (${newAttempts}/${maxAttempts})`;
          } else if (newAttempts <= 15) {
            statusMessage = `⏳ Waiting for ${selectedWalletType} connection... (${newAttempts}/${maxAttempts})`;
          } else {
            statusMessage = `⚠️ Still waiting... Check if ${selectedWalletType} app is open (${newAttempts}/${maxAttempts})`;
          }
          
          setStatus({ type: "info", message: statusMessage });
          return newAttempts;
        });
      }, 1000);
      
    } catch (error) {
      console.error(`Mobile wallet connection error for ${selectedWalletType}:`, error);
      setMobileWalletConnecting(false);
      setStatus({ 
        type: "error", 
        message: `❌ Error opening ${selectedWalletType}. Please try again or install the app first.` 
      });
      
      // Show specific error messages for common issues
      setTimeout(() => {
        if (error.message.includes('timeout') || error.message.includes('timeout')) {
          setStatus({ 
            type: "warning", 
            message: `⚠️ ${selectedWalletType} connection timed out. Please check if the app is installed and try again.` 
          });
        } else if (error.message.includes('not found') || error.message.includes('app not found')) {
          setStatus({ 
            type: "warning", 
            message: `⚠️ ${selectedWalletType} app not found. Please install it first from the app store.` 
          });
        } else if (error.message.includes('blocked') || error.message.includes('popup blocked')) {
          setStatus({ 
            type: "warning", 
            message: `⚠️ Popup blocked by browser. Please allow popups for this site and try again.` 
          });
        } else {
          setStatus({ 
            type: "error", 
            message: `❌ Failed to connect to ${selectedWalletType}. Please try again or use a different wallet.` 
          });
        }
      }, 2000);
    }
  }, [mobileWalletConnecting, connected]);

  // Check for mobile wallet return
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && mobileWalletConnecting) {
        // User returned from wallet app
        console.log("📱 User returned from wallet app");
        
        // Wait a bit for wallet to initialize
        setTimeout(() => {
          if (connected) {
            setMobileWalletConnecting(false);
            setStatus({ 
              type: "success", 
              message: "🎉 Mobile wallet connected successfully!" 
            });
            
            // Show additional success message for mobile users
            if (window.navigator.userAgent.includes('Mobile')) {
              setTimeout(() => {
                setStatus({ 
                  type: "success", 
                  message: "🎉 Mobile wallet connected! You can now verify your NFT below." 
                });
              }, 2000);
            }
          } else {
            setStatus({ 
              type: "warning", 
              message: "⚠️ Wallet not connected. Please try connecting again." 
            });
            
            // Show mobile-specific troubleshooting tips
            if (window.navigator.userAgent.includes('Mobile')) {
              setTimeout(() => {
                setStatus({ 
                  type: "info", 
                  message: "📱 Mobile connection failed. Make sure to grant permission in your wallet app and try again." 
                });
              }, 2000);
            }
          }
        }, 2000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [mobileWalletConnecting, connected]);

  // DEVELOPER CREDIT PROTECTION - DO NOT REMOVE (SILENT)
  useEffect(() => {
    // Protect developer credit from removal (silent protection)
    const protectDeveloperCredit = () => {
      const developerCredit = document.querySelector('.developer-credit-locked');
      const visibleCredit = document.querySelector('.developer-credit-visible');
      const backupCredit = document.querySelector('[data-protection="developer-credit-backup"]');
      const visibleBackup = document.querySelector('[data-protection="developer-credit-visible"]');
      
      if (!developerCredit && backupCredit) {
        // Silent restore invisible credit without console warnings
        const footer = document.querySelector('footer');
        if (footer) {
          const restoredCredit = backupCredit.cloneNode(true);
          restoredCredit.classList.remove('hidden');
          restoredCredit.classList.add('developer-credit-locked');
          // Find the bottom bar section to append the credit
          const bottomBar = footer.querySelector('.mt-8.pt-6');
          if (bottomBar) {
            bottomBar.appendChild(restoredCredit);
          } else {
            footer.appendChild(restoredCredit);
          }
        }
      }
      
      if (!visibleCredit && visibleBackup) {
        // Restore visible credit
        const footer = document.querySelector('footer');
        if (footer) {
          const restoredVisibleCredit = visibleBackup.cloneNode(true);
          restoredVisibleCredit.classList.add('developer-credit-visible');
          // Find the bottom bar section to append the credit
          const bottomBar = footer.querySelector('.mt-8.pt-6');
          if (bottomBar) {
            bottomBar.appendChild(restoredVisibleCredit);
          } else {
            footer.appendChild(restoredVisibleCredit);
          }
        }
      }
      
      // Silent protection check
      if (!developerCredit || !visibleCredit) {
        // Protection active but silent
      }
    };
    
    // Check immediately
    protectDeveloperCredit();
    
    // Set up continuous protection
    const protectionInterval = setInterval(protectDeveloperCredit, 5000);
    
    // Add mutation observer to detect DOM changes (silent)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const developerCredit = document.querySelector('.developer-credit-locked');
          const visibleCredit = document.querySelector('.developer-credit-visible');
          if (!developerCredit || !visibleCredit) {
            // Silent restore
            protectDeveloperCredit();
          }
        }
      });
    });
    
    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Cleanup
    return () => {
      clearInterval(protectionInterval);
      observer.disconnect();
    };
  }, []);

  // Mobile wallet detection with enhanced detection methods
  useEffect(() => {
    const detectMobileWallets = () => {
      const mobileWallets = [];
      
      try {
        // Enhanced Phantom detection - multiple methods
        if (window.solana?.isPhantom) {
          mobileWallets.push("Phantom");
          console.log("📱 Phantom wallet detected via window.solana.isPhantom");
        } else if (window.phantom?.solana?.isPhantom) {
          mobileWallets.push("Phantom");
          console.log("📱 Phantom wallet detected via window.phantom.solana.isPhantom");
        } else if (window.phantom?.solana) {
          mobileWallets.push("Phantom");
          console.log("📱 Phantom wallet detected via window.phantom.solana");
        } else if (window.solana) {
          mobileWallets.push("Phantom");
          console.log("📱 Phantom wallet detected via window.solana");
        } else if (window.phantom) {
          mobileWallets.push("Phantom");
          console.log("📱 Phantom wallet detected via window.phantom");
        } else if (window.phantomWallet) {
          mobileWallets.push("Phantom");
          console.log("📱 Phantom wallet detected via window.phantomWallet");
        } else if (window.phantomWalletExtension) {
          mobileWallets.push("Phantom");
          console.log("📱 Phantom wallet detected via window.phantomWalletExtension");
        } else if (window.phantomWalletAdapter) {
          mobileWallets.push("Phantom");
          console.log("📱 Phantom wallet detected via window.phantomWalletAdapter");
        }
        
        // Additional Phantom detection methods for mobile
        try {
          // Check if Phantom is injected in any form
          if (typeof window !== 'undefined') {
            // Method 1: Check for Phantom object
            if (window.phantom) {
              mobileWallets.push("Phantom");
              console.log("📱 Phantom wallet detected via window.phantom object");
            }
            
            // Method 2: Check for Solana object with Phantom properties
            if (window.solana && typeof window.solana === 'object') {
              const solanaKeys = Object.keys(window.solana);
              if (solanaKeys.includes('isPhantom') || solanaKeys.includes('phantom')) {
                mobileWallets.push("Phantom");
                console.log("📱 Phantom wallet detected via window.solana properties:", solanaKeys);
              }
            }
            
            // Method 3: Check for Phantom in global scope
            if (window.Phantom || window.PHANTOM) {
              mobileWallets.push("Phantom");
              console.log("📱 Phantom wallet detected via global Phantom object");
            }
            
            // Method 4: Check for Phantom in document
            if (document.phantom || document.Phantom) {
              mobileWallets.push("Phantom");
              console.log("📱 Phantom wallet detected via document.phantom");
            }
            
            // Method 5: Check for Phantom in navigator
            if (navigator.phantom || navigator.Phantom) {
              mobileWallets.push("Phantom");
              console.log("📱 Phantom wallet detected via navigator.phantom");
            }
          }
        } catch (error) {
          console.warn("⚠️ Error in additional Phantom detection:", error);
        }
        
        // Enhanced Solflare detection
        if (window.solflare?.isSolflare) {
          mobileWallets.push("Solflare");
          console.log("📱 Solflare wallet detected via window.solflare.isSolflare");
        } else if (window.solflare?.isSolflareWallet) {
          mobileWallets.push("Solflare");
          console.log("📱 Solflare wallet detected via window.solflare.isSolflareWallet");
        } else if (window.solflare) {
          mobileWallets.push("Solflare");
          console.log("📱 Solflare wallet detected via window.solflare");
        }
        
        // Enhanced Coinbase detection
        if (window.coinbaseWallet) {
          mobileWallets.push("Coinbase");
          console.log("📱 Coinbase wallet detected via window.coinbaseWallet");
        } else if (window.coinbaseWalletExtension) {
          mobileWallets.push("Coinbase");
          console.log("📱 Coinbase wallet detected via window.coinbaseWalletExtension");
        }
        
        // Check for mobile-specific wallets
        if (window.navigator.userAgent.includes('Mobile')) {
          console.log("📱 Mobile device detected");
          if (mobileWallets.length > 0) {
            console.log("📱 Available mobile wallets:", mobileWallets.join(", "));
          } else {
            console.log("📱 No mobile wallets detected, user may need to install one");
          }
        }
      } catch (error) {
        console.warn("⚠️ Error detecting mobile wallets:", error);
      }
    };
    
    detectMobileWallets();
    
    // Set up continuous monitoring for newly installed wallets
    const checkForNewWallets = () => {
      try {
        // Check if any new wallets were installed with enhanced detection
        if (window.solana?.isPhantom || 
            window.phantom?.solana?.isPhantom ||
            window.phantom?.solana ||
            window.solana ||
            window.solflare?.isSolflare || 
            window.solflare?.isSolflareWallet ||
            window.solflare ||
            window.coinbaseWallet || 
            window.coinbaseWalletExtension) {
          console.log("🎉 New wallet detected! User can manually connect when ready.");
          
          // Trigger wallet detection again
          detectMobileWallets();
          
          // Don't auto-connect - let user choose when to connect
          console.log("📱 Wallet detected but waiting for user to manually connect...");
        }
      } catch (error) {
        console.warn("⚠️ Error checking for new wallets:", error);
      }
    };
    
    // Check every 2 seconds for newly installed wallets
    const walletCheckInterval = setInterval(checkForNewWallets, 2000);
    
    // Cleanup interval on unmount
    return () => clearInterval(walletCheckInterval);
  }, []);

  // Fallback mobile wallet connection for when standard adapters fail
  const handleFallbackMobileConnection = useCallback(async (selectedWalletType) => {
    if (mobileWalletConnecting) return;
    
    setWalletType(selectedWalletType);
    setMobileWalletConnecting(true);
    setConnectionAttempts(0);
    
    // Show user confirmation first
    setStatus({ 
      type: "info", 
      message: `📱 ${selectedWalletType} fallback connection. Click "Connect" to proceed...` 
    });
    
    // Add a small delay to let user see the confirmation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Ask for user confirmation before proceeding
    const userConfirmed = window.confirm(
      `Do you want to try fallback connection to ${selectedWalletType} wallet?\n\n` +
      `This will attempt to connect using alternative methods.`
    );
    
    if (!userConfirmed) {
      console.log(`📱 User cancelled ${selectedWalletType} fallback connection`);
      setMobileWalletConnecting(false);
      setStatus({ 
        type: "info", 
        message: "🔌 Fallback connection cancelled by user." 
      });
      return;
    }
    
    // User confirmed, proceed with fallback connection
    setStatus({ type: "info", message: `📱 Trying fallback connection to ${selectedWalletType}...` });
    
    try {
      // Try different connection methods for mobile
      let connectionSuccess = false;
      
      // Method 1: Try direct wallet detection
      if (selectedWalletType.toLowerCase() === 'phantom' && window.solana?.isPhantom) {
        try {
          console.log("📱 Phantom detected, attempting direct fallback connection...");
          await window.solana.connect();
          connectionSuccess = true;
          console.log("📱 Phantom connected via direct fallback method");
        } catch (error) {
          console.log("📱 Direct Phantom fallback connection failed:", error);
        }
      }
      
      // Method 2: Try wallet deep link with official format
      if (!connectionSuccess && selectedWalletType.toLowerCase() === 'phantom') {
        try {
          console.log("📱 Trying Phantom official deep link format...");
          
          const walletMetadata = {
            name: "Meta Betties NFT Verification",
            url: "https://admin-q2j7.onrender.com",
            description: "NFT verification portal for Meta Betties community",
            icon: "https://admin-q2j7.onrender.com/favicon.ico",
            cluster: "mainnet-beta",
            deepLinkBase: "https://phantom.app/ul/v1/connect"
          };
          
          const phantomAppUrl = encodeURIComponent(walletMetadata.url);
          const phantomRedirectLink = encodeURIComponent(window.location.href);
          const phantomCluster = walletMetadata.cluster;
          const dappEncryptionKey = generatePhantomEncryptionKey();
          
          const officialPhantomLink = new URL(walletMetadata.deepLinkBase);
          officialPhantomLink.searchParams.append("app_url", phantomAppUrl);
          officialPhantomLink.searchParams.append("dapp_encryption_public_key", dappEncryptionKey);
          officialPhantomLink.searchParams.append("redirect_link", phantomRedirectLink);
          officialPhantomLink.searchParams.append("cluster", phantomCluster);
          
          console.log("📱 Official Phantom deep link for fallback:", officialPhantomLink.toString());
          console.log("📱 App Name:", walletMetadata.name);
          console.log("📱 App URL:", phantomAppUrl);
          console.log("📱 Redirect Link:", phantomRedirectLink);
          
          // Open official deep link
          const phantomWindow = window.open(officialPhantomLink.toString(), '_blank');
          
          if (phantomWindow && !phantomWindow.closed) {
            console.log("📱 Phantom official deep link opened successfully");
            setStatus({ 
              type: "info", 
              message: "📱 Phantom app opened! Please approve the connection..." 
            });
            
            // Wait for user to complete connection
            setTimeout(() => {
              if (!connected) {
                setStatus({ 
                  type: "warning", 
                  message: "⚠️ Phantom connection pending. Please check your Phantom app and approve the connection." 
                });
              }
            }, 5000);
            
          } else {
            console.log("📱 Phantom official deep link failed, trying alternative...");
            // Try alternative Phantom deep link
            const alternativeLink = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`;
            window.open(alternativeLink, '_blank');
          }
          
        } catch (error) {
          console.log("📱 Phantom official deep link failed:", error);
        }
      }
      
      // Method 3: Try Solflare deep link with official format
      if (!connectionSuccess && selectedWalletType.toLowerCase() === 'solflare') {
        try {
          console.log("📱 Trying Solflare official deep link format...");
          
          const walletMetadata = {
            name: "Meta Betties NFT Verification",
            url: "https://admin-q2j7.onrender.com",
            description: "NFT verification portal for Meta Betties community",
            icon: "https://admin-q2j7.onrender.com/favicon.ico",
            cluster: "mainnet-beta",
            deepLinkBase: "https://solflare.com/ul/v1/connect"
          };
          
          const solflareAppUrl = encodeURIComponent(walletMetadata.url);
          const solflareRedirectLink = encodeURIComponent(window.location.href);
          const solflareCluster = walletMetadata.cluster;
          
          const officialSolflareLink = new URL(walletMetadata.deepLinkBase);
          officialSolflareLink.searchParams.append("app_url", solflareAppUrl);
          officialSolflareLink.searchParams.append("redirect_link", solflareRedirectLink);
          officialSolflareLink.searchParams.append("cluster", solflareCluster);
          
          console.log("📱 Official Solflare deep link for fallback:", officialSolflareLink.toString());
          console.log("📱 App Name:", walletMetadata.name);
          console.log("📱 App URL:", solflareAppUrl);
          console.log("📱 Redirect Link:", solflareRedirectLink);
          
          // Open official deep link
          const solflareWindow = window.open(officialSolflareLink.toString(), '_blank');
          
          if (solflareWindow && !solflareWindow.closed) {
            console.log("📱 Solflare official deep link opened successfully");
            setStatus({ 
              type: "info", 
              message: "📱 Solflare app opened! Please approve the connection..." 
            });
            
            // Wait for user to complete connection
            setTimeout(() => {
              if (!connected) {
                setStatus({ 
                  type: "warning", 
                  message: "⚠️ Solflare connection pending. Please check your Solflare app and approve the connection." 
                });
              }
            }, 5000);
            
          } else {
            console.log("📱 Solflare official deep link failed, trying alternative...");
            // Try alternative Solflare deep link
            const alternativeLink = `https://solflare.com/ul/browse/${encodeURIComponent(window.location.href)}`;
            window.open(alternativeLink, '_blank');
          }
          
        } catch (error) {
          console.log("📱 Solflare official deep link failed:", error);
        }
      }
      
      // Method 4: Try Coinbase deep link with official format
      if (!connectionSuccess && selectedWalletType.toLowerCase() === 'coinbase') {
        try {
          console.log("📱 Trying Coinbase official deep link format...");
          
          const walletMetadata = {
            name: "Meta Betties NFT Verification",
            url: "https://admin-q2j7.onrender.com",
            description: "NFT verification portal for Meta Betties community",
            icon: "https://admin-q2j7.onrender.com/favicon.ico",
            cluster: "mainnet-beta",
            deepLinkBase: "https://wallet.coinbase.com/wallet-selector"
          };
          
          const coinbaseAppUrl = encodeURIComponent(walletMetadata.url);
          const coinbaseRedirectLink = encodeURIComponent(window.location.href);
          const coinbaseCluster = walletMetadata.cluster;
          
          const officialCoinbaseLink = new URL(walletMetadata.deepLinkBase);
          officialCoinbaseLink.searchParams.append("redirect_uri", coinbaseRedirectLink);
          officialCoinbaseLink.searchParams.append("app_url", coinbaseAppUrl);
          officialCoinbaseLink.searchParams.append("cluster", coinbaseCluster);
          
          console.log("📱 Official Coinbase deep link for fallback:", officialCoinbaseLink.toString());
          console.log("📱 App Name:", walletMetadata.name);
          console.log("📱 App URL:", coinbaseAppUrl);
          console.log("📱 Redirect Link:", coinbaseRedirectLink);
          
          // Open official deep link
          const coinbaseWindow = window.open(officialCoinbaseLink.toString(), '_blank');
          
          if (coinbaseWindow && !coinbaseWindow.closed) {
            console.log("📱 Coinbase official deep link opened successfully");
            setStatus({ 
              type: "info", 
              message: "📱 Coinbase app opened! Please approve the connection..." 
            });
            
            // Wait for user to complete connection
            setTimeout(() => {
              if (!connected) {
                setStatus({ 
                  type: "warning", 
                  message: "⚠️ Coinbase connection pending. Please check your Coinbase app and approve the connection." 
                });
              }
            }, 5000);
            
          } else {
            console.log("📱 Coinbase official deep link failed, trying alternative...");
            // Try alternative Coinbase deep link
            const alternativeLink = `coinbase-wallet://wallet-selector?redirect_uri=${encodeURIComponent(window.location.href)}`;
            window.open(alternativeLink, '_blank');
          }
          
        } catch (error) {
          console.log("📱 Coinbase official deep link failed:", error);
        }
      }
      
      // Method 5: Try direct wallet connections as last resort
      if (!connectionSuccess && selectedWalletType.toLowerCase() === 'phantom' && window.solana?.isPhantom) {
        try {
          console.log("📱 Phantom detected, attempting direct fallback connection...");
          await window.solana.connect();
          connectionSuccess = true;
          console.log("📱 Phantom connected via direct fallback method");
        } catch (error) {
          console.log("📱 Direct Phantom fallback connection failed:", error);
        }
      }
      
      // Method 6: Try Solflare direct connection
      if (!connectionSuccess && selectedWalletType.toLowerCase() === 'solflare' && window.solflare?.isSolflare) {
        try {
          console.log("📱 Solflare detected, attempting direct fallback connection...");
          await window.solflare.connect();
          connectionSuccess = true;
          console.log("📱 Solflare connected via direct fallback method");
        } catch (error) {
          console.log("📱 Direct Solflare fallback connection failed:", error);
        }
      }
      
      // Method 7: Try Coinbase direct connection
      if (!connectionSuccess && selectedWalletType.toLowerCase() === 'coinbase' && window.coinbaseWallet) {
        try {
          console.log("📱 Coinbase detected, attempting direct fallback connection...");
          await window.coinbaseWallet.requestAccounts();
          connectionSuccess = true;
          console.log("📱 Coinbase connected via direct fallback method");
        } catch (error) {
          console.log("📱 Direct Coinbase fallback connection failed:", error);
        }
      }
      
      if (connectionSuccess) {
        setMobileWalletConnecting(false);
        setStatus({ 
          type: "success", 
          message: `🎉 ${selectedWalletType} connected via fallback method!` 
        });
      } else {
        // If all direct methods fail, fall back to enhanced deep link method
        console.log("📱 All direct fallback methods failed, trying enhanced deep link method");
        await handleMobileWalletConnection(selectedWalletType);
      }
      
    } catch (error) {
      console.error(`Fallback mobile connection error for ${selectedWalletType}:`, error);
      setMobileWalletConnecting(false);
      setStatus({ 
        type: "error", 
        message: `❌ Fallback connection failed for ${selectedWalletType}. Please try the standard connection method.` 
      });
    }
  }, [mobileWalletConnecting, connected, generatePhantomEncryptionKey, handleMobileWalletConnection]);

  const doVerify = useCallback(
    async (collectionId = DEFAULT_COLLECTION, tg_id = null) => {
      if (!walletAddress) {
        setStatus({ type: "warning", message: "🚫 Please connect your wallet first." });
        return;
      }
      
      // Use tg_id parameter or state value, fallback to user's default ID
      const telegramId = tg_id || tgId || "7761809923";
      
      if (!telegramId) {
        setStatus({ type: "warning", message: "🚫 Please enter your Telegram ID." });
        return;
      }
      
      setVerifying(true);
      setStatus({ type: "info", message: "⏳ Sending verification request..." });

      try {
        const payload = {
          wallet_address: walletAddress,
          tg_id: telegramId,
          collection_id: collectionId
        };

        // Try multiple endpoints to handle CORS issues
        let res = null;
        let data = null;
        // Remove unused lastError variable

        // Try direct API call first
        try {
          console.log("🔗 Attempting direct API call to:", API_BASE);
          res = await fetch(`${API_BASE}/api/verify-nft`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          
          if (res.ok) {
            data = await res.json();
            console.log("✅ Direct API call successful");
          } else {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
        } catch (directError) {
          console.warn("⚠️ Direct API call failed:", directError);
          
          // Try CORS proxy as fallback
          try {
            const corsProxyUrl = `${CONFIG.API.CORS_PROXY}${API_BASE}/api/verify-nft`;
            console.log("🔗 Attempting CORS proxy call to:", corsProxyUrl);
            
            // Update status to show we're trying alternative method
            setStatus({ 
              type: "info", 
              message: "🔄 Direct connection failed. Trying alternative connection method..." 
            });
            
            res = await fetch(corsProxyUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            
            if (res.ok) {
              data = await res.json();
              console.log("✅ CORS proxy call successful");
            } else {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
          } catch (proxyError) {
            console.error("❌ Both direct and CORS proxy calls failed:", proxyError);
            // Show user-friendly error message
            setStatus({ 
              type: "error", 
              message: "⚠️ API connection failed. This might be a temporary issue. Please try again later or contact support." 
            });
            return;
          }
        }

        if (!res.ok) {
          setStatus({ type: "error", message: `⚠️ Verification failed: ${data?.error || res.statusText}` });
        } else {
          if (data.has_nft) {
            setStatus({ type: "success", message: `✅ Verified — ${data.nft_count || 1} NFT(s) found. Access granted.` });
            
            // Automatically redirect to private group after successful verification
            setTimeout(() => {
              const privateGroupUrl = CONFIG.TELEGRAM_GROUPS.PRIVATE_KEY;
              setStatus({ type: "success", message: `🎉 Redirecting to private group...` });
              
              console.log("🚀 Starting redirect to:", privateGroupUrl);
              
              // Improved redirect logic with popup blocking prevention
              try {
                if (window.navigator.userAgent.includes('Mobile')) {
                  // For mobile, try to open in same tab first (no popup blocking)
                  console.log("📱 Mobile device detected, redirecting to private group");
                  
                  // Method 1: Try direct redirect (no popup blocking)
                  window.location.href = privateGroupUrl;
                  
                  // Method 2: Fallback to new tab with user interaction
                  setTimeout(() => {
                    try {
                      // Create a button for user to click (prevents popup blocking)
                      const redirectButton = document.createElement('button');
                      redirectButton.textContent = 'Click to join Private Group';
                      redirectButton.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 9999;
                        padding: 15px 30px;
                        background: linear-gradient(45deg, #10b981, #059669);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                      `;
                      
                      redirectButton.onclick = () => {
                        window.open(privateGroupUrl, '_blank');
                        document.body.removeChild(redirectButton);
                      };
                      
                      document.body.appendChild(redirectButton);
                      
                      // Auto-remove after 10 seconds
                      setTimeout(() => {
                        if (document.body.contains(redirectButton)) {
                          document.body.removeChild(redirectButton);
                        }
                      }, 10000);
                      
                    } catch (fallbackError) {
                      console.warn("Fallback redirect failed:", fallbackError);
                      // Show manual link
                      setStatus({ 
                        type: "success", 
                        message: `🎉 Access granted! Click here: ${privateGroupUrl}` 
                      });
                    }
                  }, 2000);
                  
                } else {
                  // For desktop, try multiple methods to prevent popup blocking
                  console.log("🖥️ Desktop device, opening in new tab");
                  
                  // Use the safe popup helper function
                  const popupSuccess = safeOpenPopup(privateGroupUrl, 'Join Private Group');
                  
                  if (!popupSuccess) {
                    console.log("⚠️ Popup blocked, user interaction button created");
                  }
                }
              } catch (redirectError) {
                console.warn("Redirect error:", redirectError);
                // Final fallback - show manual link
                setStatus({ 
                  type: "success", 
                  message: `🎉 Access granted! Please manually visit: ${privateGroupUrl}` 
                });
              }
              
              // Show success message
              setTimeout(() => {
                setStatus({ type: "success", message: `🎉 Access granted! Redirected to private group.` });
              }, 3000);
            }, CONFIG.REDIRECT.SUCCESS_DELAY);
            
          } else {
            setStatus({ type: "error", message: "❌ No matching NFT found for this wallet." });
            
            // Automatically redirect to main group after failed verification
            setTimeout(() => {
              setStatus({ type: "warning", message: `⚠️ No NFT found. Redirecting to main group in 3 seconds...` });
              
              // Redirect to main group after 3 seconds with improved mobile support and popup blocking prevention
              setTimeout(() => {
                const mainGroupUrl = CONFIG.TELEGRAM_GROUPS.MAIN_GROUP;
                
                try {
                  if (window.navigator.userAgent.includes('Mobile')) {
                    // For mobile, try to open in same tab first (no popup blocking)
                    console.log("📱 Mobile device detected, redirecting to main group");
                    
                    // Method 1: Try direct redirect (no popup blocking)
                    window.location.href = mainGroupUrl;
                    
                    // Method 2: Fallback to new tab with user interaction
                    setTimeout(() => {
                      try {
                        // Create a button for user to click (prevents popup blocking)
                        const redirectButton = document.createElement('button');
                        redirectButton.textContent = 'Click to join Main Group';
                        redirectButton.style.cssText = `
                          position: fixed;
                          top: 50%;
                          left: 50%;
                          transform: translate(-50%, -50%);
                          z-index: 9999;
                          padding: 15px 30px;
                          background: linear-gradient(45deg, #3b82f6, #2563eb);
                          color: white;
                          border: none;
                          border-radius: 10px;
                          font-size: 16px;
                          font-weight: bold;
                          cursor: pointer;
                          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                        `;
                        
                        redirectButton.onclick = () => {
                          window.open(mainGroupUrl, '_blank');
                          document.body.removeChild(redirectButton);
                        };
                        
                        document.body.appendChild(redirectButton);
                        
                        // Auto-remove after 10 seconds
                        setTimeout(() => {
                          if (document.body.contains(redirectButton)) {
                            document.body.removeChild(redirectButton);
                          }
                        }, 10000);
                        
                      } catch (fallbackError) {
                        console.warn("Fallback redirect failed:", fallbackError);
                        // Show manual link
                        setStatus({ 
                          type: "warning", 
                          message: `⚠️ Redirected to main group. Click here: ${mainGroupUrl}` 
                        });
                      }
                    }, 2000);
                    
                  } else {
                    // For desktop, try multiple methods to prevent popup blocking
                    console.log("🖥️ Desktop device, opening main group in new tab");
                    
                    // Use the safe popup helper function
                    const popupSuccess = safeOpenPopup(mainGroupUrl, 'Join Main Group');
                    
                    if (!popupSuccess) {
                      console.log("⚠️ Popup blocked, user interaction button created for main group");
                    }
                  }
                } catch (redirectError) {
                  console.warn("Redirect error:", redirectError);
                  // Fallback to new tab
                  window.open(mainGroupUrl, '_blank');
                }
                
                setStatus({ type: "warning", message: `⚠️ Redirected to main group. Please acquire required NFT to rejoin private group.` });
              }, 3000);
            }, 1000);
            
            // Show instructions for acquiring NFT
            const instructions = `
🔑 To join the private group, you need:
• Minimum 1 NFT from collection: ${collectionId}
• Or any NFT from the specified collection

💡 Steps:
1. Acquire the required NFT
2. Come back and verify again
3. You'll be automatically redirected to private group

📱 Main Group: ${CONFIG.TELEGRAM_GROUPS.MAIN_GROUP}
            `;
            
            alert(instructions);
          }
          setNftCount(data.nft_count ?? 0);
          setLastVerifiedAt(new Date().toISOString());
        }

        if (typeof onVerify === "function") onVerify({ walletAddress, ...data });
      } catch (err) {
        console.error("verify error", err);
        
        // Provide specific error messages for common issues
        let errorMessage = "⚠️ Error while verifying. Please try again.";
        
        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          errorMessage = "⚠️ Network error: Unable to connect to verification server. This might be a CORS issue or server downtime.";
        } else if (err.message.includes('CORS')) {
          errorMessage = "⚠️ CORS error: Server doesn't allow requests from this domain. Trying alternative connection methods...";
        } else if (err.message.includes('timeout')) {
          errorMessage = "⚠️ Request timeout: Server is taking too long to respond. Please try again.";
        }
        
        setStatus({ type: "error", message: errorMessage });
        
        // Show additional troubleshooting tips for CORS issues
        if (err.message.includes('CORS') || (err.name === 'TypeError' && err.message.includes('Failed to fetch'))) {
          setTimeout(() => {
            setStatus({ 
              type: "warning", 
              message: "💡 CORS Issue Detected: The API server doesn't allow requests from this domain. This is a server configuration issue, not a problem with your wallet or NFT." 
            });
          }, 3000);
        }
      } finally {
        setVerifying(false);
      }
    },
    [walletAddress, tgId, onVerify]
  );

  return (
    <div className="card space-component">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="flex-1">
          <h2 className="heading-2 mb-3 text-xl md:text-2xl lg:text-3xl">Meta Betties — NFT Verification</h2>
          {/* Description text removed */}
        </div>

        <div className="flex flex-row items-center gap-3 md:gap-4">
          <WalletMultiButton className="wallet-connect-btn text-sm md:text-base px-4 md:px-8 py-3 md:py-4" />
          
          {/* Phantom SDK Connect Button */}
          {!isPhantomConnected ? (
            <button
              onClick={async () => {
                try {
                  setStatus({ type: "info", message: "🔗 Connecting to Phantom wallet..." });
                  const result = await connect();
                  console.log("✅ Phantom connected via SDK:", result);
                  setStatus({ type: "success", message: `🎉 Phantom wallet connected! Address: ${shortAddress(result.accounts[0].address)}` });
                } catch (error) {
                  console.error("❌ Phantom connection failed:", error);
                  setStatus({ type: "error", message: `❌ Phantom connection failed: ${error.message}` });
                }
              }}
              disabled={phantomConnecting}
              className="btn btn-primary text-xs md:text-sm px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {phantomConnecting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                "🔗 Connect Phantom"
              )}
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigator.clipboard?.writeText(phantomAccount.address)}
                className="btn btn-secondary text-xs md:text-sm px-3 md:px-6 py-2 md:py-3"
                title={phantomAccount.address}
              >
                {shortAddress(phantomAccount.address)}
              </button>
              <button
                onClick={async () => {
                  try {
                    await phantomDisconnect();
                    setStatus({ type: "info", message: "🔌 Phantom wallet disconnected" });
                  } catch (error) {
                    console.error("❌ Phantom disconnect failed:", error);
                  }
                }}
                className="btn btn-danger text-xs md:text-sm px-2 md:px-4 py-2 md:py-3"
              >
                Disconnect
              </button>
            </div>
          )}
          
          {connected && (
            <button
              onClick={() => navigator.clipboard?.writeText(walletAddress)}
              className="btn btn-secondary text-xs md:text-sm px-3 md:px-6 py-2 md:py-3"
              title={walletAddress}
            >
              {shortAddress(walletAddress)}
            </button>
          )}
          
          {/* Manual Phantom Detection Button */}
          <button
            onClick={checkPhantomWallet}
            className="btn btn-info text-xs md:text-sm px-3 md:px-6 py-2 md:py-3"
            title="Check Phantom Wallet Detection"
          >
            🔍 Check Phantom
          </button>
        </div>
        
        {/* Mobile Wallet Quick Connect - REMOVED */}
      </div>

      {/* Telegram ID Input - Hidden but functional */}
      <div className="hidden">
        <label htmlFor="tgId" className="block text-sm md:text-base font-medium text-white mb-2">
          Telegram ID (Auto-fetched from URL or enter manually)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="tgId"
            type="text"
            value={tgId}
            onChange={(e) => setTgId(e.target.value)}
            placeholder="Telegram ID (auto-fetched from URL or enter manually)"
            className="input flex-1 text-sm md:text-base px-3 md:px-4 py-2 md:py-3"
          />
        </div>
        <p className="text-caption mt-2 text-xs md:text-sm">
          ID automatically fetched from URL parameters (tg_id, telegram_id, or id) or enter manually
        </p>
      </div>

      {/* Status Display */}
      <StatusIndicator type={status.type} message={status.message} />
      
      {/* Connected Wallet Display */}
      {(window.phantomWalletInfo || window.solflareWalletInfo || window.coinbaseWalletInfo || window.universalWalletInfo || isPhantomConnected) && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-400/30 rounded-xl">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <span className="text-green-400 text-2xl">🎉</span>
            <span className="text-green-200 font-medium">Wallet Connected Successfully!</span>
          </div>
          
          <div className="text-center space-y-2">
            {/* Display wallet info based on what's available */}
            {(() => {
              // Priority: Phantom SDK > Universal > Specific wallets
              if (isPhantomConnected && phantomAccount) {
                return (
                  <>
                    <div className="text-sm text-green-300">
                      <strong>Wallet:</strong> Phantom (SDK)
                    </div>
                    <div className="text-sm text-green-300">
                      <strong>Address:</strong> {shortAddress(phantomAccount.address)}
                    </div>
                    <div className="text-xs text-green-400">
                      <strong>Type:</strong> {phantomAccount.type}
                    </div>
                    <div className="text-xs text-green-400">
                      <strong>Network:</strong> {phantomAccount.network}
                    </div>
                  </>
                );
              }
              
              const walletInfo = window.universalWalletInfo || window.phantomWalletInfo || window.solflareWalletInfo || window.coinbaseWalletInfo;
              if (walletInfo) {
                return (
                  <>
                    <div className="text-sm text-green-300">
                      <strong>Wallet:</strong> {walletInfo.walletType || 'Unknown'}
                    </div>
                    <div className="text-sm text-green-300">
                      <strong>Address:</strong> {shortAddress(walletInfo.publicKey)}
                    </div>
                    
                    <div className="text-xs text-green-400">
                      <strong>Connected:</strong> {new Date(walletInfo.connectedAt).toLocaleString()}
                    </div>
                    
                    {walletInfo.signature && (
                      <div className="text-xs text-green-400">
                        <strong>Signature:</strong> {walletInfo.signature.substring(0, 20)}...
                      </div>
                    )}
                  </>
                );
              }
              return null;
            })()}
            
            <div className="mt-3 p-2 bg-green-600/20 rounded-lg">
              <p className="text-xs text-green-300 font-medium mb-1">✅ Connection Details:</p>
              <ul className="text-xs text-green-400 text-left space-y-1">
                <li>• Wallet: {isPhantomConnected ? 'Phantom (SDK)' : (() => {
                  const walletInfo = window.universalWalletInfo || window.phantomWalletInfo || window.solflareWalletInfo || window.coinbaseWalletInfo;
                  return walletInfo?.walletType || 'Unknown';
                })()}</li>
                <li>• Network: Mainnet Beta</li>
                <li>• Status: Active</li>
                <li>• Ready for NFT verification</li>
                {isPhantomConnected && (
                  <li>• Integration: Official Phantom SDK</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Connection Status */}
      {mobileWalletConnecting && window.navigator.userAgent.includes('Mobile') && (
        <div className="mt-4 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-300"></div>
            <span className="text-blue-200 font-medium">Connecting to Mobile Wallet...</span>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-sm text-blue-300">
              {connectionAttempts === 0 && "📱 Opening wallet app..."}
              {connectionAttempts > 0 && connectionAttempts <= 5 && `📱 Opening wallet app... (${connectionAttempts}/15)`}
              {connectionAttempts > 5 && connectionAttempts <= 10 && `⏳ Waiting for connection... (${connectionAttempts}/15)`}
              {connectionAttempts > 10 && connectionAttempts < 15 && `⚠️ Still waiting... Check if app is open (${connectionAttempts}/15)`}
              {connectionAttempts >= 15 && "⚠️ Connection timeout. Please try again."}
            </div>
            
            {connectionAttempts > 0 && connectionAttempts < 15 && (
              <div className="w-full bg-blue-600/30 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(connectionAttempts / 15) * 100}%` }}
                ></div>
              </div>
            )}
            
            <div className="text-xs text-blue-400">
              {connectionAttempts <= 5 && "💡 Opening wallet app..."}
              {connectionAttempts > 5 && connectionAttempts <= 10 && "💡 Waiting for connection permission..."}
              {connectionAttempts > 10 && "💡 Make sure to grant connection permission in your wallet app"}
            </div>
            
            {/* Connection Tips */}
            <div className="mt-3 p-2 bg-blue-600/20 rounded-lg">
              <p className="text-xs text-blue-300 font-medium mb-1">💡 Connection Tips:</p>
              <ul className="text-xs text-blue-400 text-left space-y-1">
                <li>• Make sure {walletType || 'wallet'} app is installed</li>
                <li>• Grant connection permission when prompted</li>
                <li>• Return to this page after connecting</li>
                <li>• If app doesn't open, try refreshing the page</li>
                <li>• Allow popups for this website</li>
                <li>• Check if wallet app is running in background</li>
                <li>• Try switching between wallet apps if one fails</li>
                <li>• Ensure stable internet connection</li>
                <li>• Close and reopen wallet app if stuck</li>
                <li>• Check wallet app permissions in device settings</li>
                <li>• Restart device if connection issues persist</li>
                <li>• Use different browser if Chrome/Safari fails</li>
              </ul>
            </div>
            
            {/* Success indicator when connected */}
            {connected && (
              <div className="mt-2 p-2 bg-green-600/20 border border-green-400/30 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-400">✅</span>
                  <span className="text-green-200 text-sm font-medium">Wallet Connected Successfully!</span>
                </div>
                <p className="text-xs text-green-300 mt-1">
                  You can now proceed with NFT verification below
                </p>
              </div>
            )}
          </div>
          
          {connectionAttempts >= 15 && (
            <div className="flex justify-center mt-3 space-x-2">
              <button
                onClick={() => {
                  setMobileWalletConnecting(false);
                  setConnectionAttempts(0);
                  setStatus({ type: "info", message: "🔗 Ready to connect. Try again with any wallet button above." });
                }}
                className="inline-flex items-center px-3 py-1 bg-blue-600/80 text-white text-xs rounded-lg hover:bg-blue-500/80 transition-colors"
              >
                🔄 Reset Connection
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-1 bg-green-600/80 text-white text-xs rounded-lg hover:bg-green-500/80 transition-colors"
              >
                🔄 Refresh Page
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8">
        <StatsCard 
          title="Status" 
          value={status.message || "Idle"} 
          icon="📊"
          gradient="gradient-info"
        />
        <StatsCard 
          title="Last Verified" 
          value={(() => {
            const date = new Date(lastVerifiedAt);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
          })()} 
          icon="⏰"
          gradient="gradient-warning"
        />
        <StatsCard 
          title="NFT Count" 
          value={nftCount !== null ? nftCount : "—"} 
          icon="🎨"
          gradient="gradient-success"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
        {/* Verify NFT Button */}
        <button
          onClick={() => doVerify(DEFAULT_COLLECTION, tgId)}
          disabled={verifying}
          className="btn btn-success flex-1 text-sm md:text-base px-4 md:px-6 py-3 md:py-4"
        >
          {verifying ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
              <span>Verifying...</span>
            </div>
          ) : (
            "Verify NFT & Request Access"
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------
// Main App Component
// ---------------------
function App() {
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
  ];

  return (
    <PhantomProvider
      config={{
        providerType: "embedded",
        embeddedWalletType: "user-wallet",
        addressTypes: [AddressType.solana],
        apiBaseUrl: "https://api.phantom.app/v1/wallets",
        organizationId: "meta-betties-nft-verification"
      }}
    >
      <ConnectionProvider endpoint={RPC_ENDPOINT}>
        <WalletProvider wallets={wallets} autoConnect={false}>
          <WalletModalProvider>
            <div className="App">
              <header className="App-header">
                <div className="container mx-auto px-4 py-8">
                  <WalletPanel />
                </div>
              </header>
              
              {/* Professional Footer */}
              <footer className="mt-16 py-8 border-t border-white/10">
        
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                  
                  {/* Bottom Bar */}
                  <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-white/50 text-sm">
                      © 2025 Meta Betties. All rights reserved. | 
            
                    </p>
                      
                      {/* Developer Credit - Invisible and Locked */}
                      <div 
                        className="developer-credit-locked opacity-0 pointer-events-none select-none"
                        data-protection="developer-credit-backup"
                        style={{
                          position: 'absolute',
                          left: '-9999px',
                          visibility: 'hidden',
                          display: 'none'
                        }}
                      >
                        <p className="text-transparent text-xs">
                          Developed by{' '}
                          <a 
                            href="https://i-am-mushfiqur.netlify.app/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-transparent hover:text-transparent"
                          >
                            Mushfiqur Rahman
                          </a>
                        </p>
                  </div>
                      
                      {/* Visible Developer Credit - Subtle but Protected */}
                      <div 
                        className="developer-credit-locked mt-2 opacity-30 hover:opacity-60 transition-opacity duration-300"
                        data-protection="developer-credit-visible"
                      >
                        <p className="text-white/30 text-xs">
                          Crafted with ❤️ by{' '}
                          <a 
                            href="https://i-am-mushfiqur.netlify.app/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-white/60 transition-colors underline decoration-dotted"
                            title="Developer Portfolio"
                          >
                            Mushfiqur Rahman
                          </a>
                        </p>
                  </div>
                    </div>
                  </div>
                </footer>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </PhantomProvider>
  );
}

export default App;
