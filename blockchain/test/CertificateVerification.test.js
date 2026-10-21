const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateVerification Smart Contract", function () {
  let contract;
  let owner;
  let issuer2;

  const validVerId = "VER-2027-000001";
  const validHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // 64 hex chars

  beforeEach(async function () {
    [owner, issuer2] = await ethers.getSigners();
    const CertificateVerification = await ethers.getContractFactory("CertificateVerification");
    contract = await CertificateVerification.deploy();
    await contract.waitForDeployment();
  });

  it("Should successfully issue a certificate and emit CertificateIssued event", async function () {
    const tx = await contract.issueCertificate(validVerId, validHash);
    const receipt = await tx.wait();

    expect(receipt.status).to.equal(1);
    expect(await contract.totalCertificates()).to.equal(1);
    expect(await contract.certificateExists(validVerId)).to.equal(true);

    const cert = await contract.getCertificate(validVerId);
    expect(cert.verificationId).to.equal(validVerId);
    expect(cert.certificateHash).to.equal(validHash);
    expect(cert.issuer).to.equal(owner.address);
    expect(cert.timestamp).to.be.gt(0);
  });

  it("Should reject duplicate certificate issuance with the same verification ID", async function () {
    await contract.issueCertificate(validVerId, validHash);

    const duplicateHash = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    await expect(
      contract.issueCertificate(validVerId, duplicateHash)
    ).to.be.revertedWith("Certificate already issued for this verification ID");
  });

  it("Should reject invalid hash length (not 64 characters)", async function () {
    const shortHash = "abcd1234";
    await expect(
      contract.issueCertificate("VER-TEST-002", shortHash)
    ).to.be.revertedWith("Certificate hash must be a valid 64-character SHA-256 hex string");
  });

  it("Should revert when retrieving a non-existent certificate", async function () {
    await expect(
      contract.getCertificate("NON-EXISTENT-ID")
    ).to.be.revertedWith("Certificate not found on blockchain");
  });
});
