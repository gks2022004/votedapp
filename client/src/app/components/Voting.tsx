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
  }, [provider, signer]);

  useEffect(() => {
    if (!votingActive && candidates.length > 0) {
      calculateResults();
    } else {
      setResults(null);
    }
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
    <div className="max-w-2xl mx-auto p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Safe Voting System</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-6">
          {error}
        </div>
      )}

{!votingActive && results && results.winner && (
  <div className="mb-8 p-8 bg-gradient-to-r from-green-50 to-green-100 border border-green-300 rounded-lg shadow-lg">
    <h2 className="text-2xl font-semibold text-green-800 mb-4">Voting Results</h2>
    <div className="space-y-4">
      <p className="text-xl text-green-800">
        Winner: <span className="font-bold text-green-600">{results.winner.name}</span>
      </p>
      <p className="text-lg text-green-700">
        Winning Votes: <span className="font-bold">{results.winner.voteCount}</span> (
        <span className="font-bold text-green-600">{results.winningPercentage.toFixed(2)}%</span>)
      </p>
      <p className="text-lg text-gray-700">
        Total Votes Cast: <span className="font-semibold">{results.totalVotes}</span>
      </p>
    </div>
  </div>
)}
  
      {isAdmin && (
        <div className="mb-8 p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Controls</h2>
          
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={newCandidateName}
              onChange={(e) => setNewCandidateName(e.target.value)}
              placeholder="Candidate Name"
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <button
              onClick={handleAddCandidate}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Candidate
            </button>
          </div>
  
          <button
            onClick={toggleVoting}
            className={`px-6 py-3 rounded-lg ${
              votingActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {votingActive ? 'End Voting' : 'Start Voting'}
          </button>
        </div>
      )}
  
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Candidates {votingActive ? '(Voting Active)' : '(Voting Closed)'}
        </h2>
        
        {candidates.map((candidate) => (
          <div
            key={candidate.index}
            className="p-4 border border-gray-200 rounded-lg flex justify-between items-center bg-white shadow-sm"
          >
            <div>
              <h3 className="font-medium text-gray-800">{candidate.name}</h3>
              <p className="text-sm text-gray-600">Votes: {candidate.voteCount}</p>
            </div>
            
            {votingActive && !userHasVoted && (
              <button
                onClick={() => handleVote(candidate.index)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Vote
              </button>
            )}
          </div>
        ))}
  
        {userHasVoted && (
          <p className="text-center text-green-600 font-semibold">
            You have already cast your vote
          </p>
        )}
      </div>
    </div>
  );
  
};

export default VotingContract;