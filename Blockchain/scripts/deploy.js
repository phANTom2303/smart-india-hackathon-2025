// scripts/deploy.js

// This is the correct way to import ethers in a Hardhat script when using ES Modules.
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the BlueCarbonRegistry contract
  const registry = await ethers.deployContract("BlueCarbonRegistry");
  await registry.waitForDeployment();
  console.log(`✅ BlueCarbonRegistry deployed to: ${registry.target}`);

  // Deploy the CarbonCreditNFT contract
  const nft = await ethers.deployContract("CarbonCreditNFT");
  await nft.waitForDeployment();
  console.log(`CarbonCreditNFT deployed to:   ${nft.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});