// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RelicNFTStore is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _tradeCount;

    uint public mintFee = 1 ether;
    // min value to start implementing a mintFee
    uint implementFee = 100;

    bool public paused;
    string public pauseReason;

    constructor() ERC721("RelicNFTStore", "RSNFT") {}

    struct Relic {
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => Relic) private relics;
    // keeps track of the reason why an Relic was deleted
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

    modifier isPause() {
        require(!paused, "Transactions have been paused");
        _;
    }

    modifier checkPrice(uint price) {
        require(price > 0, "Price must be at least 1 wei");
        _;
    }

    modifier checkReason(string memory _reason) {
        require(bytes(_reason).length > 0, "you need to provide a reason");
        _;
    }

    /// @dev checks if Relic can be transferred
    modifier canTransfer(uint tokenId, address to) {
        require(to != address(0), "Enter a valid address");
        require(relics[tokenId].sold, "Token is currently on sale");
        _;
    }

    /// @dev mint a Relic NFT
    function safeMint(string memory uri, uint256 price)
        external
        payable
        isPause
        checkPrice(price)
    {
        require(bytes(uri).length > 0, "Enter valid uri");
        require(!takenUri[uri], "URI already in use");
        uint256 tokenId = _tokenIdCounter.current();
        if (_tradeCount.current() >= implementFee) {
            require(msg.value == mintFee, "You need to pay to mint");
            (bool success, ) = payable(owner()).call{value: mintFee}("");
            require(success, "Failed to pay mint fee");
        }
        _tokenIdCounter.increment();
        takenUri[uri] = true;
        _mint(address(this), tokenId);
        _setTokenURI(tokenId, uri);
        createRelic(tokenId, price);
        emit Create(msg.sender, tokenId);
    }

    /// @dev Create NFT Functionality
    function createRelic(uint256 tokenId, uint256 price) private {
        relics[tokenId] = Relic(
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );
    }

    /// @dev Buy NFT Functionality
    function buyRelic(uint256 tokenId) external payable isPause exist(tokenId) {
        require(
            msg.sender != relics[tokenId].seller,
            "You can't buy your own NFT"
        );
        require(
            msg.value == relics[tokenId].price,
            "Please submit the asking price in order to complete the purchase"
        );
        uint256 price = relics[tokenId].price;
        address seller = relics[tokenId].seller;
        relics[tokenId].owner = payable(msg.sender);
        relics[tokenId].sold = true;
        relics[tokenId].seller = payable(address(0));
        relics[tokenId].price = 0;
        _tradeCount.increment();
        _transfer(address(this), msg.sender, tokenId);

        (bool success, ) = seller.call{value: price}("");
        require(success, "Payment failed");
        emit Sold(seller, msg.sender, tokenId);
    }

    /// @dev Sell NFT Functionality
    function sellRelic(uint256 tokenId, uint price)
        external
        payable
        isPause
        exist(tokenId)
        checkPrice(price)
    {
        Relic storage currentRelic = relics[tokenId];
        require(
            currentRelic.owner == msg.sender,
            "Only the owner of this NFT can perform this operation"
        );
        require(
            currentRelic.sold && currentRelic.seller == address(0),
            "NFT is already on sale"
        );
        currentRelic.sold = false;
        currentRelic.price = price;
        currentRelic.seller = payable(msg.sender);
        currentRelic.owner = payable(address(this));

        _transfer(msg.sender, address(this), tokenId);
        emit Sell(msg.sender, tokenId);
    }

    function pause(string calldata _pauseReason)
        public
        onlyOwner
        checkReason(_pauseReason)
    {
        require(!paused, "Already paused");
        paused = true;
        pauseReason = _pauseReason;
        emit Pause(paused);
    }

    function unPause() public onlyOwner {
        require(paused, "Not paused");
        paused = false;
        pauseReason = "";
        emit Pause(paused);
    }

    function removeRelic(uint tokenId, string calldata _reason)
        public
        payable
        exist(tokenId)
        onlyOwner
        checkReason(_reason)
    {
        reason[tokenId] = _reason;
        delete relics[tokenId];
        _burn(tokenId);
        emit Deleted(_reason, tokenId);
    }

    function getRelic(uint256 tokenId)
        public
        view
        exist(tokenId)
        returns (Relic memory)
    {
        return relics[tokenId];
    }

    function getRelicLength() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function getTradeCount() public view returns (uint256) {
        return _tradeCount.current();
    }

    /**
     * @dev See {IERC721-transferFrom}.
     * @notice Changes is made to transferFrom to update respective states
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override isPause canTransfer(tokenId, to) {
        relics[tokenId].owner = payable(to);
        _tradeCount.increment();
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     * @notice Changes is made to transferFrom to update respective states
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override isPause canTransfer(tokenId, to) {
        relics[tokenId].owner = payable(to);
        _tradeCount.increment();
        _safeTransfer(from, to, tokenId, data);
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
