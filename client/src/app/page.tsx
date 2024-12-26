import ConnectWallet from "./components/ConnectWallet";
import VotingContract from "./components/Voting";
import { FaWallet, FaVoteYea } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-gray-900 text-white flex items-center justify-center py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-opacity-70 backdrop-blur-lg bg-white rounded-3xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <header className="relative bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 text-white py-12 px-8 shadow-lg">
            <h1 className="text-5xl font-extrabold text-center tracking-wide">
              🌐 Decentralized Voting System
            </h1>
            <p className="text-lg text-center mt-4 text-gray-200">
              Secure, transparent, and trustless voting powered by blockchain.
            </p>
            {/* Floating Highlight */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 animate-ping"></div>
          </header>

          {/* Main Content */}
          <main className="p-10 space-y-12">
            {/* Wallet Section */}
            <section
              className="bg-gradient-to-r from-indigo-800 to-purple-900 bg-opacity-80 p-8 rounded-2xl shadow-xl border border-purple-700"
              data-aos="fade-up"
            >
              <div className="flex items-center mb-6">
                <FaWallet className="text-purple-400 text-4xl mr-4" />
                <h2 className="text-3xl font-bold text-purple-300">
                  Connect Your Wallet
                </h2>
              </div>
              <p className="text-gray-300 mb-8">
                Access the voting platform securely by connecting your wallet.
              </p>
              <ConnectWallet />
            </section>

            

            {/* Voting Section */}
            <section
              className="bg-gradient-to-r from-blue-800 to-teal-900 bg-opacity-80 p-8 rounded-2xl shadow-xl border border-teal-700"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="flex items-center mb-6">
                <FaVoteYea className="text-teal-400 text-4xl mr-4" />
                <h2 className="text-3xl font-bold text-teal-300">
                  Voting System
                </h2>
              </div>
              <p className="text-gray-300 mb-8">
                Participate in the voting process and view results in real time.
              </p>
              <VotingContract />
            </section>
          </main>

          {/* Footer */}
          <footer className="relative bg-gray-800 py-6 px-4 text-center border-t border-gray-700">
            <div className="absolute inset-x-0 -top-5 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
            <p className="text-sm text-gray-400">
              Built with ❤️ on blockchain
              technology
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
