import React from "react";
import Cover from "./components/Cover";
import { Notification } from "./components/ui/Notifications";
import Wallet from "./components/wallet";
import { useBalance, useMinterContract } from "./hooks";

import Nfts from "./components/minter/nfts";
import { useContractKit } from "@celo-tools/use-contractkit";

import "./App.css";

import { Container, Nav } from "react-bootstrap";
const myStyle={
  height:'100vh',
  marginTop:'0px',
  fontSize:'18px',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundImage: `url("https://i.ibb.co/wNS7kBy/relic-store.png")` 
};
const App = function AppWrapper() {
  
  const { address, destroy, connect } = useContractKit();

  //  fetch user's celo balance using hook
  const { balance, getBalance } = useBalance();

  // initialize the NFT mint contract
  const minterContract = useMinterContract();

  return (
    <>
      <Notification />

      {address ? (
        <Container fluid="md">
          <Nav className="justify-content-end pt-3 pb-5">
            <Nav.Item>
              {/*display user wallet*/}
              <Wallet
                address={address}
                amount={balance.CELO}
                symbol="CELO"
                destroy={destroy}
              />
            </Nav.Item>
          </Nav>
          <main style={{myStyle}}>
            {/*list NFTs*/}
            <Nfts className="bg-dark text-dark"
              name="Relic NFT Store"
              updateBalance={getBalance}
              minterContract={minterContract}
            />
          </main>
        </Container>
      ) : (
        <Cover name="Relic NFT Store" coverDescription ="An NFT Marketplace for ancient discovered items" connect={connect} />
      )}
    </>
  );
};

export default App;
