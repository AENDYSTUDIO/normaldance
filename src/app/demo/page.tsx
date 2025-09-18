export const dynamic = 'force-dynamic'

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-8">NormalDance Demo</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">🎵 Music NFTs</h2>
              <p className="opacity-90 mb-4">Mint your tracks as NFTs on Solana blockchain with automatic metadata generation.</p>
              <div className="bg-white/20 rounded p-3 text-sm">
                <code>Coming Soon: Web3 Integration</code>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">🔥 Deflationary Tokenomics</h2>
              <p className="opacity-90 mb-4">2% automatic burn on every transaction with smart distribution to staking rewards.</p>
              <div className="bg-white/20 rounded p-3 text-sm">
                <code>Token: NDT (NormalDance Token)</code>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">🌐 IPFS Streaming</h2>
              <p className="opacity-90 mb-4">Multi-gateway IPFS streaming with automatic redundancy and CDN fallback.</p>
              <div className="bg-white/20 rounded p-3 text-sm">
                <code>Gateways: ipfs.io, pinata.cloud, cloudflare-ipfs.com</code>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">💰 Revenue Sharing</h2>
              <p className="opacity-90 mb-4">Earn from streams, NFT sales, and staking rewards with transparent distribution.</p>
              <div className="bg-white/20 rounded p-3 text-sm">
                <code>20% to staking, 30% to treasury, 50% to artists</code>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6">🚀 Features Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎧</span>
                <span>Audio Player with Web Audio API</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔗</span>
                <span>Solana Wallet Integration</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📱</span>
                <span>React Native Mobile App</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎨</span>
                <span>NFT Marketplace</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚡</span>
                <span>Real-time Chat & Social</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🛡️</span>
                <span>Advanced Security & Analytics</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <a 
              href="/" 
              className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-md hover:bg-gray-100 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
