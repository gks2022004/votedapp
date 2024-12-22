import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Voting", function () {
  async function deployVotingFixture() {
    // Get the signers
    const [admin, voter1, voter2] = await hre.ethers.getSigners();

    // Deploy the contract
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    return { voting, admin, voter1, voter2 };
  }

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      expect(await voting.admin()).to.equal(admin.address);
    });

    it("Should start with voting inactive", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      expect(await voting.votingActive()).to.equal(false);
    });
  });

  describe("Candidate Management", function () {
    it("Should allow admin to add candidates", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      await voting.addCandidate("Candidate 1");
      
      const [name, voteCount] = await voting.getCandidate(0);
      expect(name).to.equal("Candidate 1");
      expect(voteCount).to.equal(0);
    });

    it("Should not allow non-admin to add candidates", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      await expect(
        voting.connect(voter1).addCandidate("Candidate 1")
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should correctly return total number of candidates", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      expect(await voting.getTotalCandidates()).to.equal(0);
      
      await voting.addCandidate("Candidate 1");
      expect(await voting.getTotalCandidates()).to.equal(1);
      
      await voting.addCandidate("Candidate 2");
      expect(await voting.getTotalCandidates()).to.equal(2);
    });
  });

  describe("Voting Control", function () {
    it("Should allow admin to start voting", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      await voting.startVoting();
      expect(await voting.votingActive()).to.equal(true);
    });

    it("Should allow admin to end voting", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      await voting.startVoting();
      await voting.endVoting();
      expect(await voting.votingActive()).to.equal(false);
    });

    it("Should not allow non-admin to start voting", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      await expect(
        voting.connect(voter1).startVoting()
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should not allow non-admin to end voting", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      await expect(
        voting.connect(voter1).endVoting()
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });

  describe("Voting Process", function () {
    it("Should allow voting when active", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      await voting.addCandidate("Candidate 1");
      await voting.startVoting();
      
      await voting.connect(voter1).vote(0);
      const [, voteCount] = await voting.getCandidate(0);
      expect(voteCount).to.equal(1);
    });

    it("Should not allow voting when inactive", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      await voting.addCandidate("Candidate 1");
      
      await expect(
        voting.connect(voter1).vote(0)
      ).to.be.revertedWith("Voting is not active");
    });

    it("Should not allow voting for invalid candidate index", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      await voting.addCandidate("Candidate 1");
      await voting.startVoting();
      
      await expect(
        voting.connect(voter1).vote(1)
      ).to.be.revertedWith("Invalid candidate index");
    });

    it("Should not allow voting twice", async function () {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      await voting.addCandidate("Candidate 1");
      await voting.startVoting();
      
      await voting.connect(voter1).vote(0);
      await expect(
        voting.connect(voter1).vote(0)
      ).to.be.revertedWith("You have already voted");
    });

    it("Should record votes correctly", async function () {
      const { voting, voter1, voter2 } = await loadFixture(deployVotingFixture);
      await voting.addCandidate("Candidate 1");
      await voting.startVoting();
      
      await voting.connect(voter1).vote(0);
      await voting.connect(voter2).vote(0);
      
      const [, voteCount] = await voting.getCandidate(0);
      expect(voteCount).to.equal(2);
    });
  });

  describe("Candidate Information", function () {
    it("Should fail to get non-existent candidate", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      await expect(
        voting.getCandidate(0)
      ).to.be.revertedWith("Invalid candidate index");
    });

    it("Should return correct candidate information", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      await voting.addCandidate("Candidate 1");
      
      const [name, voteCount] = await voting.getCandidate(0);
      expect(name).to.equal("Candidate 1");
      expect(voteCount).to.equal(0);
    });
  });
});