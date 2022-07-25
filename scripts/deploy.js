const hre = require("hardhat");

async function main() {
  const RelicNFTStore = await hre.ethers.getContractFactory("RelicNFTStore");
  const relicNFTStore = await RelicNFTStore.deploy();

  await relicNFTStore.deployed();

  console.log("RelicNFTStore deployed to:", relicNFTStore.address);
  storeContractData(relicNFTStore)
}

function storeContractData(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/RelicNFTStore-address.json",
    JSON.stringify({ RelicNFTStore: contract.address }, undefined, 2)
  );

  const RelicNFTStoreArtifact = artifacts.readArtifactSync("RelicNFTStore");

  fs.writeFileSync(
    contractsDir + "/RelicStoreNFT.json",
    JSON.stringify(RelicNFTStoreArtifact, null, 2)
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
