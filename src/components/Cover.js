import React from 'react';
import { Button } from "react-bootstrap";
import PropTypes from 'prop-types';

const myStyle={
  backgroundImage: 
  "url('https://i.ibb.co/wNS7kBy/relic-store.png')",
  height:'100vh',
  marginTop:'0px',
  fontSize:'18px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  opacity: 1

};
const Cover = ({ connect }) => {
    return (
      <div
          className="text-center "
          style={myStyle}
        >
          <div className="mt-auto text-light mb-0 ">
            <div
              className=" ratio ratio-1x1 mx-auto mb-2"
              style={{ maxWidth: "320px" }}
            >
            </div>
            
  
            <p className='text-info fw-bold' style={{marginTop:170}}>Please connect your wallet to continue.</p>
            <Button
              onClick={() => connect().catch((e) => console.log(e))}
              variant="btn btn-outline-light"
              className="rounded-pill px-3 mt-0 mb-0"
            >
              Connect Wallet
            </Button>
          </div>

        </div>
    );
  

  return null;
};



export default Cover;
