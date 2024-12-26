"use client";
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import ContractAbi from '../Abi/voting.json'


const VOTING_ABI = ContractAbi;

interface Candidate {
  name: string;
  voteCount: number;
  index: number;
}

interface VotingResults {
    winner: Candidate | null;
    totalVotes: number;
    winningPercentage: number;
  }

const VotingContract: React.FC = () => {
  const { account, provider, signer } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [votingActive, setVotingActive] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<VotingResults | null>(null);

 
  const contractAddress = "0x23c9347b2b530e0306eb04f8624d289dff350e5a";

  useEffect(() => {
    if (provider && signer) {
      const votingContract = new ethers.Contract(contractAddress, VOTING_ABI, provider);
      const votingWithSigner = votingContract.connect(signer);
      setContract(votingWithSigner);
      loadContractData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, signer]);

  useEffect(() => {
    if (!votingActive && candidates.length > 0) {
      calculateResults();
    } else {
      setResults(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votingActive, candidates]);

  const calculateResults = () => {
    if (candidates.length === 0) return;

    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    const winner = candidates.reduce((prev, current) => 
      (current.voteCount > prev.voteCount) ? current : prev
    );

    const winningPercentage = totalVotes > 0 
      ? (winner.voteCount / totalVotes) * 100 
      : 0;

    setResults({
      winner,
      totalVotes,
      winningPercentage
    });
  };

  const loadContractData = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      
      // Get admin status
      const adminAddress = await contract.admin();
      setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());

      // Get voting status
      const isVotingActive = await contract.votingActive();
      setVotingActive(isVotingActive);

      // Get voter status
      const voter = await contract.voters(account);
      setUserHasVoted(voter.hasVoted);

      // Get candidates
      const totalCandidates = await contract.getTotalCandidates();
      const candidatesData: Candidate[] = [];

      for (let i = 0; i < totalCandidates.toNumber(); i++) {
        const [name, voteCount] = await contract.getCandidate(i);
        candidatesData.push({
          name,
          voteCount: voteCount.toNumber(),
          index: i
        });
      }

      setCandidates(candidatesData);
      setError(null);
    } catch (err) {
      setError('Error loading contract data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    if (!contract || !newCandidateName.trim()) return;

    try {
      setLoading(true);
      const tx = await contract.addCandidate(newCandidateName);
      await tx.wait();
      setNewCandidateName('');
      await loadContractData();
    } catch (err) {
      setError('Error adding candidate');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateIndex: number) => {
    if (!contract) return;

    try {
      setLoading(true);
      const tx = await contract.vote(candidateIndex);
      await tx.wait();
      await loadContractData();
    } catch (err) {
      setError('Error casting vote');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoting = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const tx = await contract[votingActive ? 'endVoting' : 'startVoting']();
      await tx.wait();
      await loadContractData();
    } catch (err) {
      setError(`Error ${votingActive ? 'ending' : 'starting'} voting`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4 text-black">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-wide">
          🗳️ Safe Voting System
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Secure. Transparent. Decentralized.
        </p>
      </header>
  
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-lg shadow-sm">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}
  
        {/* Results Section */}
        {!votingActive && results && results.winner && (
         <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-xl border border-green-300">
         <h2 className="text-3xl font-bold text-green-900 mb-6">🎉 Voting Results</h2>
         <div className="space-y-4">
           <p className="text-lg text-green-900">
             <span className="font-semibold text-gray-700">Winner:</span>{" "}
             <span className="font-bold text-green-800">{results.winner.name}</span>
           </p>
           <p className="text-lg text-green-900">
             <span className="font-semibold text-gray-700">Winning Votes:</span>{" "}
             <span className="font-bold text-green-900">{results.winner.voteCount}</span>{" "}
             <span className="text-gray-900">
               (<span className="font-bold text-green-600">{results.winningPercentage.toFixed(2)}%</span>)
             </span>
           </p>
           <p className="text-lg text-green-900">
             <span className="font-semibold text-gray-700">Total Votes Cast:</span>{" "}
             <span className="font-bold text-green-900">{results.totalVotes}</span>
           </p>
         </div>
       </div>
        )}
  
        {/* Admin Controls */}
        {isAdmin && (
          <div className="p-8 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">🔧 Admin Controls</h2>
  
            <div className="flex items-center gap-4 mb-6">
              <input
                type="text"
                value={newCandidateName}
                onChange={(e) => setNewCandidateName(e.target.value)}
                placeholder="Enter Candidate Name"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                onClick={handleAddCandidate}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105 focus:ring-2 focus:ring-blue-300"
              >
                Add Candidate
              </button>
            </div>
  
            <button
              onClick={toggleVoting}
              className={`w-full py-4 rounded-lg text-white font-bold text-lg shadow-md transform transition ${
                votingActive
                  ? "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-300 hover:scale-105"
                  : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-300 hover:scale-105"
              }`}
            >
              {votingActive ? "End Voting" : "Start Voting"}
            </button>
          </div>
        )}
  
        {/* Candidate Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🗳️ Candidates {votingActive ? "(Voting Active)" : "(Voting Closed)"}
          </h2>
  
          <div className="grid gap-6">
            {candidates.map((candidate) => (
              <div
                key={candidate.index}
                className="p-6 bg-white border border-gray-200 rounded-lg shadow-md flex justify-between items-center transition-transform transform hover:scale-105"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{candidate.name}</h3>
                  <p className="text-sm text-gray-600">Votes: {candidate.voteCount}</p>
                </div>
  
                {votingActive && !userHasVoted && (
                  <button
                    onClick={() => handleVote(candidate.index)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 transform transition-transform hover:scale-105"
                  >
                    Vote
                  </button>
                )}
              </div>
            ))}
  
            {userHasVoted && (
              <div className="text-center py-4 bg-green-50 border border-green-400 text-green-700 rounded-lg shadow-md">
                <p className="font-semibold text-lg">✅ You have already cast your vote!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
    
  
  
};

export default VotingContract;