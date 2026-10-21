const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==================================================");
  console.log("Deploying CertificateVerification smart contract...");
  console.log("==================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const CertificateVerification = await hre.ethers.getContractFactory("CertificateVerification");
  const contract = await CertificateVerification.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(">> CertificateVerification deployed successfully!");
  console.log(">> Contract Address:", contractAddress);

  // Write deployment output to deployment folder
  const deployDir = path.join(__dirname, "..", "deployment");
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }

  const deploymentData = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(deployDir, "contract-address.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log(">> Deployment metadata written to blockchain/deployment/contract-address.json");
  console.log("==================================================");
  console.log("Add this to your backend application.properties or .env:");
  console.log(`BLOCKCHAIN_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
