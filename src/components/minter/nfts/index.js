import { useContractKit } from "@celo-tools/use-contractkit";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import AddNfts from "./Add";
import Nft from "./Card";
import Loader from "../../ui/Loader";
import { NotificationSuccess, NotificationError } from "../../ui/Notifications";
import {
  getNfts,
  buyImage,
  sellImage,
  createNft,
  fetchNftContractOwner,
  transferOwnership
} from "../../../utils/minter";
import { Row } from "react-bootstrap";

const NftList = ({ minterContract, name }) => {
  const { performActions, address, kit } = useContractKit();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nftOwner, setNftOwner] = useState(null);
  const  {defaultAccount} = kit;

  const addNft = async (data) => {
    try {
      setLoading(true);

      // create an nft functionality
      await createNft(minterContract, performActions, data);
      toast(<NotificationSuccess text="Updating NFT list...." />);
      getAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create an NFT." />);
    } finally {
      setLoading(false);
    }
  };
  const buyNft = async (index, tokenId) => {
    try {
      setLoading(true);

      // Create a buy NFT functionality
      await buyImage(minterContract, index, tokenId, performActions);
      getAssets();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const sellNft = async (index) => {
    try {
      setLoading(true);
      // Create a sell NFT functionality
      await sellImage(minterContract, index, performActions);
      getAssets();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const sendNft = async (address, tokenId, owner)=>{
    try {
      setLoading(true);
      // Create a send/transfer NFT functionality
      await transferOwnership(minterContract,owner, address, tokenId, performActions)
      toast(<NotificationSuccess text="Updating Relic NFT Markeplace Store...." />);
      getAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to send NFT." />);
    } finally {
      setLoading(false);
    }
  }

  const fetchContractOwner = useCallback(async (minterContract) => {
    // get the address that deployed the NFT contract
    const _address = await fetchNftContractOwner(minterContract);
    setNftOwner(_address);
  }, []);

  const getAssets = useCallback(async () => {
    try {
      setLoading(true);

      // fetch all nfts from the smart contract
      const allNfts = await getNfts(minterContract);
      if (!allNfts) return;


      setNfts(allNfts);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [minterContract]);


  useEffect(() => {
    try {
      if (address && minterContract) {
        getAssets();
        fetchContractOwner(minterContract);
      }
    } catch (error) {
      console.log({ error });
    }
  }, [minterContract, address, getAssets, fetchContractOwner]);

  if (address) {
    return (
      <>
        {!loading ? (
          <>
            <div className="bg-dark text-light" style={{'--color-1': 'deepskyblue','--color-2': 'navy',
      background: `
      linear-gradient(
        170deg,
        var(--color-1),
        var(--color-2) 80%
      )
    `,

    // Unrelated styles:
    color: 'white',
    textAlign: 'center',
    padding: 30,
    borderRadius: 12,
  }}>
              <h1 className="fs-4 fw-bold mb-2">{name}</h1>

            </div>
            <div>
            <AddNfts save={addNft} address={address} />
            </div>
            <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5 bg-dark mt-2 pb-4">

              {/* display all NFTs */}
              {nfts.map((_nft) => (
                <Nft
                  key={_nft.index}
                  contractOwner = {defaultAccount}
                  buyNft={() => buyNft(_nft.index, _nft.tokenId)}
                  sellNft={() => sellNft(_nft.tokenId)}
                  send = {sendNft}
                  nft={{
                    ..._nft,
                  }}
                />
              ))}
            </Row>
          </>
        ) : (
          <Loader />
        )}
      </>
    );
  }
  return null;
};

NftList.propTypes = {
  // props passed into this component
  minterContract: PropTypes.instanceOf(Object),
  updateBalance: PropTypes.func.isRequired,
};

NftList.defaultProps = {
  minterContract: null,
};

export default NftList;
