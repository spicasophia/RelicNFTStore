import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { ethers } from "ethers";

// initialize IPFS
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

// mint an NFT
export const createNft = async (
  minterContract,
  performActions,
  { name,price, description, year, ipfsImage, ownerAddress }
) => {
  await performActions(async (kit) => {
    if (!name || !description || !year|| !ipfsImage) return;
    const { defaultAccount } = kit;

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,
      price,
      description,
      year,
      image: ipfsImage,
      owner: defaultAccount
    });

    try {
      // save NFT metadata to IPFS
      const added = await client.add(data);

      // IPFS url for uploaded metadata
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      const _price = ethers.utils.parseUnits(String(price), "ether");


      // mint the NFT and save the IPFS url to the blockchain
      let transaction = await minterContract.methods
        .safeMint(url, _price)
        .send({ from: defaultAccount });

      return transaction;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  });
};

// function to upload a file to IPFS
export const uploadToIpfs = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const added = await client.add(file, {
      progress: (prog) => console.log(`received: ${prog}`),
    });
    return `https://ipfs.infura.io/ipfs/${added.path}`;
  } catch (error) {
    console.log("Error uploading file: ", error);
  }
};

// fetch all NFTs on the smart contract
export const getNfts = async (minterContract) => {
  try {
    const nfts = [];
    const nftsLength = await minterContract.methods.getImageLength().call();
    for (let i = 0; i < Number(nftsLength); i++) {
      const nft = new Promise(async (resolve) => {
        const image = await minterContract.methods.getImage(i).call();
        const res = await minterContract.methods.tokenURI(i).call();
        const meta = await fetchNftMeta(res);
        const owner = await fetchNftOwner(minterContract, i);
        resolve({
          index: i,
          tokenId: i,
          owner,
          price: image.price,
          sold: image.sold,
          name: meta.data.name,
          image: meta.data.image,
          description: meta.data.description,
          year:meta.data.description        });
      });
      nfts.push(nft);
    }
    return Promise.all(nfts);
  } catch (e) {
    console.log({ e });
  }
};

// get the metedata for an NFT from IPFS
export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    const meta = await axios.get(ipfsUrl);
    return meta;
  } catch (e) {
    console.log({ e });
  }
};

// get the owner address of an NFT
export const fetchNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods.ownerOf(index).call();
  } catch (e) {
    console.log({ e });
  }
};

// get the address that deployed the NFT contract
export const fetchNftContractOwner = async (minterContract) => {
  try {
    let owner = await minterContract.methods.owner().call();
    return owner;
  } catch (e) {
    console.log({ e });
  }
};

export const transferOwnership = async (
  minterContract,
  ownerAddress,
  newAddress,
  tokenId,
  performActions
) => {
  try {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      // console.log(ownerAddress, newAddress, tokenId, defaultAccount);
      await minterContract.methods
        .makeTransfer(ownerAddress, newAddress, tokenId)
        .send({ from: defaultAccount });
    });
  } catch (error) {
    console.log({ error });
  }
};
export const buyImage = async (
  minterContract,
  index,
  tokenId,
  performActions
) => {
  try {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      // console.log(ownerAddress, newAddress, tokenId, defaultAccount);
      const image = await minterContract.methods.getImage(index).call();
      await minterContract.methods
        .buyImage(tokenId)
        .send({ from: defaultAccount, value: image.price });
    });
  } catch (error) {
    console.log({ error });
  }
};
export const sellImage = async (minterContract, tokenId, performActions) => {
  try {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      await minterContract.methods
        .sellImage(tokenId)
        .send({ from: defaultAccount });
    });
  } catch (error) {
    console.log({ error });
  }
};
export const getOwners = async (minterContract) => {
  try {
    const ownerCount = await minterContract.methods.getOwners().call();
    return ownerCount;
  } catch (error) {
    console.log({ error });
  }
};
