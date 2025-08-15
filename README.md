# Meta Betties NFT Verification Portal

A secure, blockchain-based NFT ownership verification portal built with React and Solana blockchain technology. This application allows users to connect their Solana wallets and verify ownership of Meta Betties NFTs to gain access to exclusive Telegram groups.

## 🚀 Features

- **Multi-Wallet Support**: Connect with Phantom, Solflare, Backpack, and other Solana wallets
- **Mobile Optimized**: Full support for mobile devices with mobile wallet adapters
- **Secure Verification**: Blockchain-based NFT ownership verification
- **Telegram Integration**: Automatic access to exclusive groups upon successful verification
- **Responsive Design**: Beautiful, modern UI built with Tailwind CSS
- **Real-time Status**: Live connection and verification status updates

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS
- **Blockchain**: Solana Web3.js, Solana Wallet Adapters
- **Mobile**: Solana Mobile Wallet Adapter
- **Build Tools**: React App Rewired, Webpack
- **Styling**: Tailwind CSS with custom animations

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Solana wallet (Phantom, Solflare, Backpack, etc.)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nft-verification-portal.git
   cd nft-verification-portal/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=https://api-server-wcjc.onrender.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📱 Available Scripts

- `npm start` - Start development server
- `npm run dev` - Start development server (alias)
- `npm run build` - Build for production
- `npm run build:production` - Build with production optimizations
- `npm run build:render` - Build for Render deployment
- `npm run serve:build` - Serve built files
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean and reinstall dependencies

## 🔧 Configuration

The application configuration is located in `src/config.js`:

```javascript
export const CONFIG = {
  TELEGRAM_GROUPS: {
    PRIVATE_KEY: 'https://t.me/MetaBettiesPrivateKey',
    MAIN_GROUP: 'https://t.me/bugsfixinggroup',
    SUPPORT: 'https://t.me/MetaBettiesSupport'
  },
  // ... other configuration options
};
```

## 🌐 Deployment

### Render
```bash
npm run build:render
```

### Vercel
```bash
npm run build
# Deploy build folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy build folder to Netlify
```

## 📱 Mobile Support

The application includes comprehensive mobile support:

- **Solana Mobile Wallet Adapter**: Native mobile wallet integration
- **Universal Links**: Deep linking to wallet apps
- **Responsive Design**: Optimized for all screen sizes
- **Touch-friendly UI**: Mobile-optimized interactions

## 🔐 Wallet Integration

### Supported Wallets
- **Phantom**: Most popular Solana wallet
- **Solflare**: Fast and secure wallet
- **Backpack**: Modern UI wallet
- **Coinbase Wallet**: Trusted exchange wallet
- **Mobile Wallets**: Native mobile wallet support

### Connection Methods
1. **Extension Wallets**: Direct connection via browser extensions
2. **Mobile Wallets**: Universal links and mobile wallet adapter
3. **Fallback**: App store redirects for uninstalled wallets

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Build Configuration

The project uses `react-app-rewired` for custom build configuration:

- **Source Maps**: Disabled in production for security
- **Polyfills**: Buffer, crypto, and stream polyfills for Web3
- **Optimizations**: Production build optimizations

## 🔍 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure wallet extension is installed
   - Check browser console for errors
   - Try refreshing the page

2. **Mobile Connection Issues**
   - Use external browser instead of in-app browser
   - Ensure wallet app is installed
   - Check mobile wallet adapter support

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Developer

**Jharna Khanam** - [@mushfiqmoon](https://t.me/mushfiqmoon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **Telegram Support**: [@MetaBettiesSupport](https://t.me/MetaBettiesSupport)
- **Main Group**: [@bugsfixinggroup](https://t.me/bugsfixinggroup)
- **Private Group**: [@MetaBettiesPrivateKey](https://t.me/MetaBettiesPrivateKey) (NFT holders only)

## 🔗 Links

- **Live Demo**: [Your deployed URL]
- **API Documentation**: [API docs URL]
- **Solana Docs**: [https://docs.solana.com](https://docs.solana.com)
- **Wallet Adapter Docs**: [https://github.com/solana-labs/wallet-adapter](https://github.com/solana-labs/wallet-adapter)

---

Built with ❤️ for the Meta Betties community 