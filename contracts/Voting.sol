// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
    address public admin;
    bool public votingActive;

    struct Candidate {
        string name;
        uint256 voteCount;
    }
    
    struct Voter {
        bool hasVoted;
        uint256 vote;
    }
    
    mapping(address => Voter) public voters;
    Candidate[] public candidates;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier votingOpen() {
        require(votingActive, "Voting is not active");
        _;
    }

    constructor() {
        admin = msg.sender;
        votingActive = false;
    }

    function addCandidate(string memory name) public onlyAdmin {
        candidates.push(Candidate(name, 0));
    }

    function startVoting() public onlyAdmin {
        votingActive = true;
    }

    function endVoting() public onlyAdmin {
        votingActive = false;
    }

    function vote(uint256 candidateIndex) public votingOpen {
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(candidateIndex < candidates.length, "Invalid candidate index");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].vote = candidateIndex;
        candidates[candidateIndex].voteCount++;
    }

    function getCandidate(uint256 index) public view returns (string memory, uint256) {
        require(index < candidates.length, "Invalid candidate index");
        Candidate memory candidate = candidates[index];
        return (candidate.name, candidate.voteCount);
    }

    function getTotalCandidates() public view returns (uint256) {
        return candidates.length;
    }
}



// 0x23c9347b2b530e0306eb04f8624d289dff350e5a