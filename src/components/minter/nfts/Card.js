import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack, Row } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import { Form, Button } from "react-bootstrap";
import Identicon from "../../ui/Identicon";
// NFT Cards Functionality
const NftCard = ({ nft, send, contractOwner, buyNft, sellNft }) => {
  const { image, description, owner, name, index, price,sold } = nft;

  const handleSend = (index, owner) => {
    if (!sendAddrss) return;
    send(sendAddrss, index, owner);
  };
  const [sendAddrss, setSendAddrss] = useState("");
  {
    console.log(sold);
  }
  return (
    <Col key={index}>
      <Card className="h-100 bg-dark text-light">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={owner} size={28} />
            <span className="font-monospace text-secondary">
              {truncateAddress(owner)}
            </span>
            <Badge bg="secondary" className="ms-auto">
              {price / 10 ** 18} CELO
            </Badge>
          </Stack>
        </Card.Header>

        <div className=" ratio ratio-4x3">
          <img src={image} alt={description} style={{ objectFit: "cover" }} />
        </div>

        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="flex-grow-1">{description}</Card.Text>
          <div>
          
          </div>
          {contractOwner === owner && (
            <>
              <Form.Control
                className={"pt-2"}
                type="text"
                placeholder="Send Address"
                onChange={(e) => {
                  setSendAddrss(e.target.value);
                }}
              />
              <Button
                variant="secondary"
                onClick={() => handleSend(index, owner)}
              >
                Send
              </Button>
            </>
              )}

            {!sold ? (
              <Button variant="secondary" onClick={buyNft}>
                Buy
              </Button>
            ) : contractOwner === owner ? (
              <Button variant="danger" onClick={sellNft}>
                Sell
              </Button>
            ) : (
              <Button variant="danger" disabled>
              Sold
              </Button>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

NftCard.propTypes = {
  // props passed into this component
  nft: PropTypes.instanceOf(Object).isRequired,
};

export default NftCard;
