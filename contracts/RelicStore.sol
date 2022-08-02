// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RelicNFTStore is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _tradeCount;

    uint mintFee;
    // min value to start implementing a mintFee
    uint implementFee = 100;  

    bool public paused; 
    string public pauseReason;
    constructor() ERC721("RelicNFTStore", "RSNFT") {
    }

    struct Image {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => Image) private images;

    mapping(uint => string) private reason;
    mapping(string => bool) private takenUri;
    event Create(address seller, uint tokenId);

    event Sold(address seller, address buyer, uint tokenId);
    
    event Sell(address seller, uint tokenId);

    event Deleted(string reason, uint tokenId);
    
    event Pause(bool paused);

    modifier exist(uint tokenId) {
        require(_exists(tokenId), "Enter valid token id");
        _;
    }

    modifier isPause(){
        require(!paused, "Transactions have been paused");
        _;
    }

    modifier onlyOwner(uint tokenId){
        require(msg.sender == images[tokenId].owner, "Only the owner can access this function");
    }

    // mint an NFt
    function safeMint(string memory uri, uint256 price)
        public
        payable isPause
        returns (uint256)
    {
        require(bytes(uri).length > 0, "Enter valid uri");
        require(!takenUri[uri], "URI already in use");
        require(price > 0, "Price must be at least 1 wei");
        uint256 tokenId = _tokenIdCounter.current();
        if(_tradeCount.current() >= implementFee){
            mintFee = 1 ether;
            require(msg.value == mintFee, "You need to pay to mint");
            (bool success,) = payable(owner()).call{value: mintFee}("");
            require(success, "Failed to pay mint fee");
        }
        _tokenIdCounter.increment();
        takenUri[uri] = true;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        createImage(tokenId, price);
        emit Create(msg.sender, tokenId);
        return tokenId;
    }
    // NFT Transfer Functionality

    function makeTransfer
    (address to, uint256 tokenId)public exist(tokenId) isPause(){
        require(msg.sender == ownerOf(tokenId) || msg.sender == getApproved(tokenId), "Only the owner or an approved operator can perform this action");
        require(to != address(0), "Enter a valid address");
        require(images[tokenId].sold, "Token is currently on sale");
        _transfer(msg.sender, to, tokenId);
        images[tokenId].owner = payable(to);
        _tradeCount.increment();
    }

    //Create NFT Functionality
    function createImage(uint256 tokenId, uint256 price) private {
        images[tokenId] = Image(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
    }

    //Buy NFT Functionality
    function buyImage(uint256 tokenId) public payable exist(tokenId) isPause(){
        
        require(msg.sender != images[tokenId].seller, "You can't buy your own NFT");
        uint256 price = images[tokenId].price;
        address seller = images[tokenId].seller;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );
        images[tokenId].owner = payable(msg.sender);
        images[tokenId].sold = true;
        images[tokenId].seller = payable(address(0));
        _tradeCount.increment();
        _transfer(address(this), msg.sender, tokenId);

        (bool success,) = seller.call{value: price}("");
        require(success, "Payment failed");
        emit Sold(seller, msg.sender, tokenId);
        
    }

    //Sell NFT Functionality
    function sellImage(uint256 tokenId) public payable exist(tokenId) isPause() onlyOwner(tokenId){
        Image storage currentImage = images[tokenId];
        require( currentImage.seller == address(0), "NFT is already on sale");
        require(currentImage.sold, "NFT is already on sale");
        currentImage.sold = false;
        currentImage.seller = payable(msg.sender);
        currentImage.owner = payable(address(this));

        _transfer(msg.sender, address(this), tokenId);
        emit Sell(msg.sender, tokenId);
    }

    //Function using which the owner can change the price of the relic
    function changePrice(uint256 tokenId, uint256 price) public onlyOwner(tokenId){
        images[tokenId].price = price;
    }

    function pause(string memory _pauseReason) external onlyOwner {
        require(!paused, "Already paused");
        require(bytes(_pauseReason).length > 0, "Invalid pause reason");
        paused = true;
        pauseReason = _pauseReason;
        emit Pause(paused);
    }

    function unPause() external onlyOwner {
        require(paused, "Not paused");
        paused = false;
        pauseReason = "";
        emit Pause(paused);
    }

    function removeImage(uint tokenId, string memory _reason) public payable exist(tokenId) onlyOwner{
        require(bytes(_reason).length > 0, "Enter a valid reason");
        reason[tokenId] = _reason;
        delete images[tokenId];
        _burn(tokenId);
        emit Deleted(_reason, tokenId);
    }

    function getImage(uint256 tokenId) public view exist(tokenId) returns (Image memory) {
        return images[tokenId];
    }

    function getImageLength() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function getTradeCount() public view returns (uint256) {
        return _tradeCount.current();
    }

   function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
