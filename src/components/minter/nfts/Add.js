/* eslint-disable react/jsx-filename-extension */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { uploadToIpfs } from "../../../utils/minter";


const AddNfts = ({ save, address }) => {
  const [name, setName] = useState("");
  const [ipfsImage, setIpfsImage] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");

  const [price, setPrice] = useState("")


  const [show, setShow] = useState(false);


  // check if all form data has been filled
  const isFormFilled = () =>{
   return name && ipfsImage && description && year;
  }
      

  // close the popup modal
  const handleClose = () => {
    setShow(false);
    // setAttributes([]);
  };

  // display the popup modal
  const handleShow = () => setShow(true);

  return (
    <>
      <Button type="button" variant="outline-dark" style={{margin:20, marginBotton: 10}}
        onClick={handleShow}>Add Relic Item NFT</Button>
      {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create NFT</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <FloatingLabel
              controlId="inputLocation"
              label="Name"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Name"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="inputDescription"
              label="Description"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="description"
                style={{ height: "80px" }}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputYear"
              label="Year"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="year"
                onChange={(e) => {
                  setYear(e.target.value);
                }}
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="inputLocation"
              label="Price"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Price of NFT"
                onChange={(e) => {
                  setPrice(e.target.value);
                }}
              />
            </FloatingLabel>

            <Form.Control
              type="file"
              className={"mb-3"}
              onChange={async (e) => {
                const imageUrl = await uploadToIpfs(e);
                if (!imageUrl) {
                  alert("failed to upload image");
                  return;
                }
                setIpfsImage(imageUrl);
              }}
              placeholder="Product name"
            ></Form.Control>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                name,
                price,
                ipfsImage,
                description,
                year,
                ownerAddress: address
              });
              handleClose();
            }}
            >
            Create NFT
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AddNfts.propTypes = {

  // props passed into this component
  save: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired,
};

export default AddNfts;
