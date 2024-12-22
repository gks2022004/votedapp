import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("VotingModule", (m) => {
  
  const Votingdapp = m.contract("Voting");

  return {Votingdapp};
});

export default DeployModule;

//  npx hardhat ignition deploy ./ignition/modules/deploy.ts --network localhost