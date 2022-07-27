import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack} from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import { Form, Button } from "react-bootstrap";
import Identicon from "../../ui/Identicon";
// NFT Cards Functionality
const NftCard = ({ nft, send, contractOwner, address, buyNft, sellNft }) => {
  const { image, description, owner, seller, name, index, price,sold } = nft;

  const handleSend = (index, owner) => {
    if (!sendAddrss) return;
    send(sendAddrss, index, owner);
  };
  const [sendAddrss, setSendAddrss] = useState("");
  const [newPrice, SetNewPrice] = useState(0);

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
          {address === owner && sold ? (
            <>
              <Form.Control
                className={"pt-2 mb-2"}
                type="text"
                placeholder="Send Address"
                onChange={(e) => {
                  setSendAddrss(e.target.value);
                }}
              />
              <Button
                variant="secondary"
                onClick={() => handleSend(index, owner)}
                className="mb-2"
              >
                Send
              </Button>
            </>
              ) : ""}

            {!sold && address !== seller  ? (
              <Button variant="secondary" onClick={buyNft}>
                Buy
              </Button>
            ) : address === owner ? (
              <>
              <Form.Control
              className={"pt-2 mb-2"}
              type="number"
              placeholder="Send Address"
              onChange={(e) => {
                SetNewPrice(e.target.value);
              }}
            />
              <Button variant="danger" onClick={() => sellNft(newPrice)}>
                Sell
              </Button>
              </>
            ) : (
              <Button variant="danger" disabled>
              {address === seller? "On Sale" : "Sold"}
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
