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
  TorusWalletAdapter,
  CoinbaseWalletAdapter
} from "@solana/wallet-adapter-wallets";

// Reown AppKit imports for better mobile support
// import { createAppKit } from '@reown/appkit/react';
// import { SolanaAdapter } from '@reown/appkit-adapter-solana';
// import { solana } from '@reown/appkit/networks';

// Temporarily comment out problematic mobile adapter
// import { SolanaMobileWalletAdapter } from "@solana-mobile/wallet-adapter-mobile";

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
  const [status, setStatus] = useState({ type: "info", message: "🔗 Welcome! Connect your Solana wallet to start NFT verification" });
  const [verifying, setVerifying] = useState(false);
  const [nftCount, setNftCount] = useState(null);
  const [lastVerifiedAt, setLastVerifiedAt] = useState(new Date().toISOString());
  const [tgId, setTgId] = useState("7761809923"); // Add Telegram ID state with user's ID
  const [mobileWalletConnecting, setMobileWalletConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [walletType, setWalletType] = useState(""); // Add walletType state

  const walletAddress = publicKey ? publicKey.toBase58() : null;

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
  }, []);

  // Save auto-connect preference when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      // Save that user wants auto-connect for future sessions
      localStorage.setItem('wallet_auto_connect', 'true');
      console.log("💾 Auto-connect preference saved for future sessions");
      
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

  // Enhanced mobile wallet connection with simplified logic
  const handleMobileWalletConnection = useCallback(async (selectedWalletType) => {
    if (mobileWalletConnecting) return;
    
    setWalletType(selectedWalletType);
    setMobileWalletConnecting(true);
    setConnectionAttempts(0);
    setStatus({ type: "info", message: `📱 Opening ${selectedWalletType} wallet...` });
    
    try {
      // Simplified deep link approach for mobile wallet connection
      let deepLink = '';
      let fallbackUrl = '';
      
      // Generate deep links for different wallet types with proper mobile support
      switch (selectedWalletType.toLowerCase()) {
        case 'phantom':
          // Phantom has the best mobile deep link support
          deepLink = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`;
          fallbackUrl = 'https://phantom.app/';
          break;
        case 'solflare':
          // Solflare mobile deep link with proper app scheme
          deepLink = `solflare://ul/browse/${encodeURIComponent(window.location.href)}`;
          fallbackUrl = 'https://solflare.com/';
          break;
        case 'torus':
          // Torus mobile deep link with app scheme
          deepLink = `torus://wallet/connect?appName=MetaBetties&appUrl=${encodeURIComponent(window.location.href)}`;
          fallbackUrl = 'https://app.tor.us/';
          break;
        case 'coinbase':
          // Coinbase mobile deep link with app scheme
          deepLink = `coinbase-wallet://wallet-selector?redirect_uri=${encodeURIComponent(window.location.href)}`;
          fallbackUrl = 'https://wallet.coinbase.com/';
          break;
        default:
          // Default fallback for unknown wallet types
          deepLink = window.location.href;
          fallbackUrl = window.location.href;
          break;
      }
      
      console.log(`📱 Enhanced: Attempting to connect to ${selectedWalletType} with deep link:`, deepLink);
      
      // For mobile devices, use simplified connection strategy
      if (window.navigator.userAgent.includes('Mobile')) {
        console.log("📱 Mobile device detected, using simplified mobile connection strategy");
        
        // Method 1: Try window.open with deep link first
        try {
          const newWindow = window.open(deepLink, '_blank');
          
          // Method 2: If window.open fails, try alternative approach
          if (!newWindow || newWindow.closed) {
            console.log("📱 Window.open failed, trying alternative approach");
            
            // Try alternative deep link formats for better mobile compatibility
            let alternativeLink = '';
            switch (selectedWalletType.toLowerCase()) {
              case 'phantom':
                alternativeLink = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`;
                break;
              case 'solflare':
                alternativeLink = `https://solflare.com/ul/browse/${encodeURIComponent(window.location.href)}`;
                break;
              case 'torus':
                alternativeLink = `https://app.tor.us/wallet/connect?appName=MetaBetties&appUrl=${encodeURIComponent(window.location.href)}`;
                break;
              case 'coinbase':
                alternativeLink = `https://wallet.coinbase.com/wallet-selector?redirect_uri=${encodeURIComponent(window.location.href)}`;
                break;
              default:
                alternativeLink = window.location.href;
                break;
            }
            
            if (alternativeLink) {
              console.log("📱 Trying alternative link:", alternativeLink);
              window.open(alternativeLink, '_blank');
            }
          }
          
        } catch (deepLinkError) {
          console.warn("📱 Deep link error:", deepLinkError);
          // Fallback to fallback URL
          window.open(fallbackUrl, '_blank');
        }
        
        // Set up a fallback timer with reasonable delay for mobile
        setTimeout(() => {
          // If still not connected after 8 seconds, show fallback options
          if (!connected && mobileWalletConnecting) {
            console.log("📱 Connection timeout, showing fallback options");
            setStatus({ 
              type: "warning", 
              message: `⚠️ ${selectedWalletType} app not responding. Opening fallback options...` 
            });
            
            // Open fallback URL in new tab
            window.open(fallbackUrl, '_blank');
            
            // Show manual connection instructions
            setTimeout(() => {
              setStatus({ 
                type: "info", 
                message: `📱 Please install ${selectedWalletType} app and return here to connect manually.` 
              });
            }, 2000);
          }
        }, 8000); // Reduced to 8 seconds for better UX
        
      } else {
        // For desktop, open in new tab
        console.log("🖥️ Desktop device, opening in new tab");
        window.open(deepLink, '_blank');
      }
      
      // Set up connection monitoring with better error handling
      const maxAttempts = 15; // Reduced timeout for better UX
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
          if (newAttempts <= 5) {
            statusMessage = `📱 Opening ${selectedWalletType} app... (${newAttempts}/${maxAttempts})`;
          } else if (newAttempts <= 10) {
            statusMessage = `⏳ Waiting for ${selectedWalletType} connection... (${newAttempts}/${maxAttempts})`;
          } else {
            statusMessage = `⚠️ Still waiting... Check if ${selectedWalletType} app is open (${newAttempts}/${maxAttempts})`;
          }
          
          setStatus({ type: "info", message: statusMessage });
          return newAttempts;
        });
      }, 1000); // Reduced interval for better responsiveness
      
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

  // Mobile wallet detection
  useEffect(() => {
    const detectMobileWallets = () => {
      const mobileWallets = [];
      
      try {
        // Check for Phantom
        if (window.solana?.isPhantom) {
          mobileWallets.push("Phantom");
          console.log("📱 Phantom wallet detected on mobile");
        }
        
        // Check for Solflare
        if (window.solflare?.isSolflare) {
          mobileWallets.push("Solflare");
          console.log("📱 Solflare wallet detected on mobile");
        }
        
        // Check for Torus
        if (window.torus) {
          mobileWallets.push("Torus");
          console.log("📱 Torus wallet detected on mobile");
        }
        
        // Check for Coinbase
        if (window.coinbaseWallet) {
          mobileWallets.push("Coinbase");
          console.log("📱 Coinbase wallet detected on mobile");
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
        // Check if any new wallets were installed
        if (window.solana?.isPhantom || window.solflare?.isSolflare || window.torus || window.coinbaseWallet) {
          console.log("🎉 New wallet detected! Attempting auto-connection...");
          
          // Trigger wallet detection again
          detectMobileWallets();
          
          // Auto-connect if user has previously connected
          if (localStorage.getItem('wallet_auto_connect') === 'true') {
            console.log("🔄 Auto-connecting to newly detected wallet...");
            // The WalletMultiButton will handle the connection
          }
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
    setStatus({ type: "info", message: `📱 Trying fallback connection to ${selectedWalletType}...` });
    
    try {
      // Try different connection methods for mobile
      let connectionSuccess = false;
      
      // Method 1: Try direct wallet detection
      if (selectedWalletType.toLowerCase() === 'phantom' && window.solana?.isPhantom) {
        try {
          await window.solana.connect();
          connectionSuccess = true;
          console.log("📱 Phantom connected via direct method");
        } catch (error) {
          console.log("📱 Direct Phantom connection failed:", error);
        }
      }
      
      // Method 2: Try Solflare direct connection
      if (!connectionSuccess && selectedWalletType.toLowerCase() === 'solflare' && window.solflare?.isSolflare) {
        try {
          await window.solflare.connect();
          connectionSuccess = true;
          console.log("📱 Solflare connected via direct method");
        } catch (error) {
          console.log("📱 Direct Solflare connection failed:", error);
        }
      }
      
      // Method 3: Try Torus direct connection
      if (!connectionSuccess && selectedWalletType.toLowerCase() === 'torus' && window.torus) {
        try {
          await window.torus.login();
          connectionSuccess = true;
          console.log("📱 Torus connected via direct method");
        } catch (error) {
          console.log("📱 Direct Torus connection failed:", error);
        }
      }
      
      // Method 4: Try Coinbase direct connection
      if (!connectionSuccess && selectedWalletType.toLowerCase() === 'coinbase' && window.coinbaseWallet) {
        try {
          await window.coinbaseWallet.requestAccounts();
          connectionSuccess = true;
          console.log("📱 Coinbase connected via direct method");
        } catch (error) {
          console.log("📱 Direct Coinbase connection failed:", error);
        }
      }
      
      if (connectionSuccess) {
        setMobileWalletConnecting(false);
        setStatus({ 
          type: "success", 
          message: `🎉 ${selectedWalletType} connected via fallback method!` 
        });
      } else {
        // If all direct methods fail, fall back to deep link method
        console.log("📱 All direct methods failed, trying deep link fallback");
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
  }, [mobileWalletConnecting, handleMobileWalletConnection]);

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
              
              // Improved mobile redirect logic
              try {
                if (window.navigator.userAgent.includes('Mobile')) {
                  // For mobile, try to open in same tab first
                  console.log("📱 Mobile device detected, redirecting to private group");
                  
                  // Method 1: Try direct redirect
                  window.location.href = privateGroupUrl;
                  
                  // Method 2: Fallback to new tab if redirect doesn't work
                  setTimeout(() => {
                    try {
                      window.open(privateGroupUrl, '_blank');
                    } catch (fallbackError) {
                      console.warn("Fallback redirect failed:", fallbackError);
                      // Show manual link
                      setStatus({ 
                        type: "success", 
                        message: `🎉 Access granted! Click here: ${privateGroupUrl}` 
                      });
                    }
                  }, 1000);
                  
                } else {
                  // For desktop, open in new tab
                  window.open(privateGroupUrl, '_blank');
                }
              } catch (redirectError) {
                console.warn("Redirect error:", redirectError);
                // Fallback to new tab
                window.open(privateGroupUrl, '_blank');
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
              
              // Redirect to main group after 3 seconds with improved mobile support
              setTimeout(() => {
                const mainGroupUrl = CONFIG.TELEGRAM_GROUPS.MAIN_GROUP;
                
                try {
                  if (window.navigator.userAgent.includes('Mobile')) {
                    // For mobile, try to open in same tab first
                    console.log("📱 Mobile device detected, redirecting to main group");
                    
                    // Method 1: Try direct redirect
                    window.location.href = mainGroupUrl;
                    
                    // Method 2: Fallback to new tab if redirect doesn't work
                    setTimeout(() => {
                      try {
                        window.open(mainGroupUrl, '_blank');
                      } catch (fallbackError) {
                        console.warn("Fallback redirect failed:", fallbackError);
                        // Show manual link
                        setStatus({ 
                          type: "warning", 
                          message: `⚠️ Redirected to main group. Click here: ${mainGroupUrl}` 
                        });
                      }
                    }, 1000);
                    
                  } else {
                    // For desktop, open in new tab
                    window.open(mainGroupUrl, '_blank');
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
          {connected && (
            <button
              onClick={() => navigator.clipboard?.writeText(walletAddress)}
              className="btn btn-secondary text-xs md:text-sm px-3 md:px-6 py-2 md:py-3"
              title={walletAddress}
            >
              {shortAddress(walletAddress)}
            </button>
          )}
        </div>
        
        {/* Mobile Wallet Quick Connect */}
        {!connected && window.navigator.userAgent.includes('Mobile') && (
          <div className="mt-3 p-3 bg-green-500/20 border border-green-400/30 rounded-xl">
            <p className="text-sm text-green-200 text-center mb-2">
              🚀 <strong>Quick Connect:</strong> Tap your wallet below for instant connection
            </p>
            
            {/* Connection Status */}
            {mobileWalletConnecting && (
              <div className="text-center mb-3 p-2 bg-blue-600/20 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300"></div>
                  <span className="text-xs text-blue-200">
                    {connectionAttempts <= 5 ? 'Opening wallet...' : 
                     connectionAttempts <= 10 ? 'Waiting for connection...' : 
                     connectionAttempts <= 15 ? 'Checking connection...' :
                     'Connection taking longer...'}
                  </span>
                </div>
                <p className="text-xs text-blue-300 mt-1">
                  {connectionAttempts <= 5 ? '📱 Opening wallet app...' : 
                   connectionAttempts <= 10 ? '⏳ Waiting for permission...' : 
                   connectionAttempts <= 15 ? '⚠️ Check if app is open' :
                   '🔄 Still trying to connect...'}
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  // Try standard connection first, then fallback
                  if (window.solana?.isPhantom) {
                    handleFallbackMobileConnection('Phantom');
                  } else {
                    handleMobileWalletConnection('Phantom');
                  }
                }}
                disabled={mobileWalletConnecting}
                className="inline-flex items-center px-3 py-2 bg-purple-600/80 text-white text-xs rounded-lg hover:bg-purple-500/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Connect Phantom Wallet - Best mobile support"
              >
                👻 Phantom
              </button>
              <button
                onClick={() => {
                  // Use deep link approach for Solflare
                  handleMobileWalletConnection('Solflare');
                }}
                disabled={mobileWalletConnecting}
                className="inline-flex items-center px-3 py-2 bg-orange-600/80 text-white text-xs rounded-lg hover:bg-orange-500/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Connect Solflare Wallet - Deep link mobile support"
              >
                🔥 Solflare
              </button>
              <button
                onClick={() => {
                  // Use deep link approach for Torus
                  handleMobileWalletConnection('Torus');
                }}
                disabled={mobileWalletConnecting}
                className="inline-flex items-center px-3 py-2 bg-blue-600/80 text-white text-xs rounded-lg hover:bg-blue-500/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Connect Torus Wallet - Deep link mobile support"
              >
                🌐 Torus
              </button>
              <button
                onClick={() => {
                  // Use deep link approach for Coinbase
                  handleMobileWalletConnection('Coinbase');
                }}
                disabled={mobileWalletConnecting}
                className="inline-flex items-center px-3 py-2 bg-green-600/80 text-white text-xs rounded-lg hover:bg-green-500/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Connect Coinbase Wallet - Deep link mobile support"
              >
                💰 Coinbase
              </button>
            </div>
            
            {/* Quick Tips */}
            <div className="mt-2 text-center">
              <p className="text-xs text-green-300">
                💡 <strong>Tip:</strong> Make sure your wallet app is installed and ready
              </p>
              {!mobileWalletConnecting && (
                <p className="text-xs text-green-400 mt-1">
                  🎯 Tap any wallet button above to start connection
                </p>
              )}
              {mobileWalletConnecting && (
                <p className="text-xs text-green-400 mt-1">
                  🔄 Connection in progress... Please wait
                </p>
              )}
            </div>
            
            {/* Wallet Compatibility Info */}
            <div className="mt-3 p-2 bg-blue-600/20 rounded-lg">
              <p className="text-xs text-blue-300 font-medium mb-1">📱 Wallet Compatibility:</p>
              <div className="text-xs text-blue-400 space-y-1">
                <div className="flex justify-between">
                  <span>👻 Phantom:</span>
                  <span className="text-green-400">✅ Best Support</span>
                </div>
                <div className="flex justify-between">
                  <span>🔥 Solflare:</span>
                  <span className="text-green-400">✅ Deep Link</span>
                </div>
                <div className="flex justify-between">
                  <span>🌐 Torus:</span>
                  <span className="text-green-400">✅ Deep Link</span>
                </div>
                <div className="flex justify-between">
                  <span>💰 Coinbase:</span>
                  <span className="text-green-400">✅ Deep Link</span>
                </div>
                <div className="flex justify-between">
                  <span>🔗 Mobile:</span>
                  <span className="text-green-400">✅ Enhanced Support</span>
                </div>
              </div>
            </div>
          </div>
        )}
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
    new TorusWalletAdapter(),
    new CoinbaseWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
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
                      className="developer-credit-visible mt-2 opacity-30 hover:opacity-60 transition-opacity duration-300"
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
  );
}

export default App;
