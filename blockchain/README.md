# Blockchain Service — Academic Certificate Smart Contract

Smart contracts and local node automation powered by Hardhat.

## Structure
- `contracts/CertificateVerification.sol`: Solidity 0.8.20 contract.
- `scripts/deploy.js`: Deploys contract and outputs deployment JSON metadata.
- `test/CertificateVerification.test.js`: Contract test suite.
- `hardhat.config.cjs`: Local node and compiler configuration.

## Commands

```powershell
# Start local EVM node (port 8545)
npm run node

# Compile Solidity contracts
npm run compile

# Run smart contract unit tests
npm test

# Deploy to local node
npm run deploy:local
```
