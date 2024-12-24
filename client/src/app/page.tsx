import ConnectWallet from "./components/ConnectWallet";
import VotingContract from "./components/Voting";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <ConnectWallet />
            <VotingContract />
          </div>
        </div>
      </div>
  )
}
