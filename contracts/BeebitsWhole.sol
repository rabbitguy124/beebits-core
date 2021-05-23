// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./interfaces/IERC721.sol";
import "./interfaces/IBinanceBunksMarket.sol";
import "./interfaces/IERC721TokenReceiver.sol";
import "./interfaces/ILinkSwapper.sol";

import "./libraries/SafeMath.sol";
import "./utils/ReentrancyGuard.sol";

import "@chainlink/contracts/src/v0.7/dev/VRFConsumerBase.sol";
import "./LinkSwapper.sol";

contract BeebitsWhole is ReentrancyGuard, IERC721, VRFConsumerBase {
  using SafeMath for uint256;

  /// Events
  event RequestedMint(address indexed minter, bytes32 requestId);
  event Mint(uint256 indexed index, address indexed minter, uint256 createdVia);
  event Trade(
    bytes32 indexed hash,
    address indexed maker,
    address taker,
    uint256 makerWei,
    uint256[] makerIds,
    uint256 takerWei,
    uint256[] takerIds
  );
  event Deposit(address indexed account, uint256 amount);
  event Withdraw(address indexed account, uint256 amount);
  event OfferCancelled(bytes32 hash);
  event DevMintToggled(bool mode);
  event SaleBegins();
  event CommunityGrantEnds();
  event BeebitListed(
    uint256 tokenId,
    uint256 askingPrice,
    address buyerAddress
  );
  event BeebitDelisted(uint256 tokenId);
  event BeebitBought(
    uint256 tokenId,
    uint256 price,
    address seller,
    address buyer
  );

  event BeebitBidPlaced(uint256 tokenId, uint256 bidValue, address bidder);
  event BeebitBidWithdrawn(uint256 tokenId, uint256 bidValue, address bidder);
  bytes4 internal constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;
  uint256 private immutable LINK_FEE;

  // IPFS Hash to the NFT content
  string public contentHash = "QmfXYgfX1qNfzQ6NRyFnupniZusasFPMeiWn5aaDnx7YXo";

  uint256 public constant TOKEN_LIMIT = 20000;
  uint256 public SALE_LIMIT = 10000;

  struct MintRequest {
    bytes32 requestId;
    bool isClaiming;
    uint256 bunkIndex;
  }

  mapping(bytes4 => bool) internal supportedInterfaces;

  mapping(uint256 => uint256) public creatorNftMints;

  mapping(uint256 => address) internal idToApproval;

  mapping(address => mapping(address => bool)) internal ownerToOperators;

  mapping(uint256 => address) public idToOwner; // internal

  mapping(address => uint256[]) public ownerToIds; // internal

  mapping(uint256 => uint256) public idToOwnerIndex; // interna;

  mapping(address => MintRequest) public requesters; // private

  mapping(bytes32 => address) public requestToMinters; // private

  string internal nftName = "Beebits";
  string internal nftSymbol = unicode"⚇";

  uint256 internal numTokens = 0;
  uint256 internal numSales = 0;
  uint256 internal devMintQty = 0;

  // Cryptobunks contract
  address internal bunks;

  bytes32 internal vrfHash;
  address payable internal deployer;
  address payable internal beneficiary;
  ILinkSwapper internal linkSwapper;
  bool public communityGrant = true;
  bool public publicSale = false;
  bool private devMintMode = false;
  uint256 private price;
  uint256 public saleStartTime;
  uint256 public saleDuration;

  //// Market
  bool public marketPaused;
  bool public contractSealed;
  mapping(bytes32 => bool) public cancelledOffers;

  //// Listing and Bids
  mapping(uint256 => Listing) public beebitsListings;
  mapping(address => uint256) public bnbBalance;
  mapping(uint256 => Bid) public beebitsBids;
  mapping(bytes32 => bool) public cancelledListings;

  modifier onlyDeployer() {
    require(msg.sender == deployer, "Only deployer.");
    _;
  }

  /* Basic checks for token id */
  modifier isTokenValid(uint256 _tokenId) {
    require(!marketPaused, "market is paused");
    require(!contractSealed, "contract is sealed");
    require(_tokenId <= TOKEN_LIMIT && _tokenId > 0, "invalid token id");
    _;
  }

  modifier canOperate(uint256 _tokenId) {
    address tokenOwner = idToOwner[_tokenId];
    require(
      tokenOwner == msg.sender || ownerToOperators[tokenOwner][msg.sender],
      "Cannot operate."
    );
    _;
  }

  modifier canTransfer(uint256 _tokenId) {
    address tokenOwner = idToOwner[_tokenId];
    require(
      tokenOwner == msg.sender ||
        idToApproval[_tokenId] == msg.sender ||
        ownerToOperators[tokenOwner][msg.sender],
      "Cannot transfer."
    );
    _;
  }

  modifier validNFToken(uint256 _tokenId) {
    require(idToOwner[_tokenId] != address(0), "Invalid token.");
    _;
  }

  constructor(
    address _bunks,
    address payable _beneficiary,
    address _linkTokenAddress,
    address _vrfCoordinator,
    bytes32 _keyHash,
    uint256 _randomnessFee
  ) VRFConsumerBase(_vrfCoordinator, _linkTokenAddress) {
    supportedInterfaces[0x01ffc9a7] = true; // ERC165
    supportedInterfaces[0x80ac58cd] = true; // ERC721
    supportedInterfaces[0x780e9d63] = true; // ERC721 Enumerable
    supportedInterfaces[0x5b5e139f] = true; // ERC721 Metadata
    deployer = msg.sender;
    bunks = _bunks;
    beneficiary = _beneficiary;
    vrfHash = _keyHash;
    LINK_FEE = _randomnessFee;
  }

  function changeSaleCount(uint256 _newSaleCount) external onlyDeployer {
    SALE_LIMIT = _newSaleCount;
  }

  function setLinkSwapper(address _linkSwapperAddress) public onlyDeployer {
    linkSwapper = ILinkSwapper(_linkSwapperAddress);
  }

  function toggleDevMintMode(bool _mode) public onlyDeployer {
    devMintMode = _mode;
    emit DevMintToggled(_mode);
  }

  function startSale(uint256 _price, uint256 _saleDuration)
    external
    onlyDeployer
  {
    require(!publicSale);
    price = _price;
    saleDuration = _saleDuration;
    saleStartTime = block.timestamp;
    publicSale = true;
    emit SaleBegins();
  }

  function endCommunityGrant() external onlyDeployer {
    require(communityGrant);
    communityGrant = false;
    emit CommunityGrantEnds();
  }

  function pauseMarket(bool _paused) external onlyDeployer {
    require(!contractSealed, "Contract sealed.");
    marketPaused = _paused;
  }

  function sealContract() external onlyDeployer {
    contractSealed = true;
  }

  function isContract(address _addr) internal view returns (bool addressCheck) {
    uint256 size;
    assembly {
      size := extcodesize(_addr)
    } // solhint-disable-line
    addressCheck = size > 0;
  }

  function supportsInterface(bytes4 _interfaceID)
    external
    view
    override
    returns (bool)
  {
    return supportedInterfaces[_interfaceID];
  }

  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes calldata _data
  ) external override {
    _safeTransferFrom(_from, _to, _tokenId, _data);
  }

  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId
  ) external override {
    _safeTransferFrom(_from, _to, _tokenId, "");
  }

  function transferFrom(
    address _from,
    address _to,
    uint256 _tokenId
  ) external override canTransfer(_tokenId) validNFToken(_tokenId) {
    address tokenOwner = idToOwner[_tokenId];
    require(tokenOwner == _from, "Wrong from address.");
    require(_to != address(0), "Cannot send to 0x0.");
    _transfer(_to, _tokenId);
  }

  function approve(address _approved, uint256 _tokenId)
    external
    override
    canOperate(_tokenId)
    validNFToken(_tokenId)
  {
    address tokenOwner = idToOwner[_tokenId];
    require(_approved != tokenOwner);
    idToApproval[_tokenId] = _approved;
    emit Approval(tokenOwner, _approved, _tokenId);
  }

  function setApprovalForAll(address _operator, bool _approved)
    external
    override
  {
    ownerToOperators[msg.sender][_operator] = _approved;
    emit ApprovalForAll(msg.sender, _operator, _approved);
  }

  function balanceOf(address _owner) external view override returns (uint256) {
    require(_owner != address(0));
    return _getOwnerNFTCount(_owner);
  }

  function ownerOf(uint256 _tokenId)
    external
    view
    override
    returns (address _owner)
  {
    require(idToOwner[_tokenId] != address(0), "token not minted");
    _owner = idToOwner[_tokenId];
  }

  function getApproved(uint256 _tokenId)
    external
    view
    override
    validNFToken(_tokenId)
    returns (address)
  {
    return idToApproval[_tokenId];
  }

  function isApprovedForAll(address _owner, address _operator)
    external
    view
    override
    returns (bool)
  {
    return ownerToOperators[_owner][_operator];
  }

  function _transfer(address _to, uint256 _tokenId) internal {
    address from = idToOwner[_tokenId];
    _clearApproval(_tokenId);

    _removeNFToken(from, _tokenId);
    _addNFToken(_to, _tokenId);

    emit Transfer(from, _to, _tokenId);
  }

  function mintsRemaining() external view returns (uint256) {
    return SALE_LIMIT.sub(numSales);
  }

  function mintWithBunk(uint256 _createVia, uint256 _deadline)
    external
    payable
    nonReentrant
    returns (bytes32)
  {
    require(communityGrant, "community grant not started yet");
    require(!marketPaused, "market paused");
    require(_createVia > 0 && _createVia <= 10000, "invalid bunk index.");
    require(!requesters[msg.sender].isClaiming, "previous mint in progress");
    require(creatorNftMints[_createVia] == 0, "already minted with this bunk");

    uint256 bunkId = _createVia.sub(1);
    // Make sure the sender owns the bunk
    require(
      IBinanceBunksMarket(bunks).punkIndexToAddress(bunkId) == msg.sender,
      "not the owner of this bunk."
    );

    uint256 expectedBNBValue = linkSwapper.getWBNBAmountIn(LINK_FEE);
    require(msg.value >= expectedBNBValue, "insufficient funds to mint");
    if (msg.value > expectedBNBValue) {
      uint256 dustBNB = msg.value.sub(expectedBNBValue);
      (bool success, ) = msg.sender.call{value: dustBNB}("");
      require(success, "refund failure");
    }
    bool swapSuccess =
      linkSwapper.swap{value: expectedBNBValue}(_deadline, LINK_FEE);
    require(swapSuccess, "LINK Swap failure");
    creatorNftMints[_createVia] = creatorNftMints[_createVia].add(1);
    return _mint(msg.sender, _createVia);
  }

  /**
   * Public sale minting.
   */
  function mint(uint256 _deadline)
    external
    payable
    nonReentrant
    returns (bytes32)
  {
    require(publicSale, "sale not started.");
    require(!marketPaused, "market paused");
    require(numSales < SALE_LIMIT, "sale limit reached.");
    require(!requesters[msg.sender].isClaiming, "previous mint in progress");

    uint256 salePrice = 0.25 * 10**18;
    uint256 expectedBNBValue = linkSwapper.getWBNBAmountIn(LINK_FEE);
    uint256 totalPrice = salePrice.add(expectedBNBValue);

    require(msg.value >= totalPrice, "insufficient funds to purchase");
    if (msg.value > totalPrice) {
      (bool success, ) = msg.sender.call{value: msg.value.sub(totalPrice)}("");
      require(success, "refund failure");
    }

    bool swapSuccess =
      linkSwapper.swap{value: expectedBNBValue}(_deadline, LINK_FEE);
    require(swapSuccess, "LINK Swap failure");

    beneficiary.transfer(salePrice);
    numSales++;
    return _mint(msg.sender, 0);
  }

  function devMint(
    uint256 _quantity,
    address recipient,
    uint256 _deadline
  ) external payable onlyDeployer returns (bytes32) {
    require(devMintMode, "dev mode turned off");
    require(!requesters[recipient].isClaiming, "previous dev mint in process");
    require(
      _quantity <= TOKEN_LIMIT.sub(numTokens),
      "quantity exceeds mintable limit"
    );
    devMintQty = _quantity;
    uint256 expectedBNBValue = linkSwapper.getWBNBAmountIn(LINK_FEE);
    require(msg.value >= expectedBNBValue, "insufficient funds to mint");
    if (msg.value > expectedBNBValue) {
      (bool success, ) =
        msg.sender.call{value: msg.value.sub(expectedBNBValue)}("");
      require(success, "refund failure");
    }
    bool swapSuccess =
      linkSwapper.swap{value: expectedBNBValue}(_deadline, LINK_FEE);
    require(swapSuccess, "LINK Swap failure");
    return _mint(recipient, 0);
  }

  function _mint(address _to, uint256 _createdVia) internal returns (bytes32) {
    require(_to != address(0), "cannot mint to 0x0.");
    require(numTokens < TOKEN_LIMIT, "token limit reached.");
    require(
      LINK.balanceOf(address(this)) >= LINK_FEE,
      "insufficient link funds for request"
    );

    bytes32 rId =
      requestRandomness(vrfHash, LINK_FEE, uint256(blockhash(block.number)));

    requesters[_to] = MintRequest({
      requestId: rId,
      isClaiming: true,
      bunkIndex: _createdVia
    });

    requestToMinters[rId] = _to;
    emit RequestedMint(_to, rId);
    return rId;
  }

  function fulfillRandomness(bytes32 requestId, uint256 randomness)
    internal
    override
  {
    address minter = requestToMinters[requestId];
    if (devMintMode && devMintQty > 0) {
      for (
        uint256 quantityCounter = 1;
        quantityCounter <= devMintQty;
        quantityCounter++
      ) {
        uint256 expandedRandomness =
          uint256(keccak256(abi.encode(randomness, quantityCounter)));
        _processMintRequest(minter, expandedRandomness);
      }
      devMintQty = 0;
    } else {
      _processMintRequest(minter, randomness);
    }
    delete requesters[minter];
  }

  function _processMintRequest(address _minter, uint256 _randValue) internal {
    uint256 totalSize = TOKEN_LIMIT.sub(numTokens);
    uint256 id = _randValue.mod(totalSize).add(1);
    numTokens = numTokens.add(1);
    require(_minter != address(0), "got 0x0 as minter");
    _addNFToken(_minter, id);
    emit Transfer(address(0), _minter, id);
    emit Mint(id, _minter, requesters[_minter].bunkIndex);
  }

  function _addNFToken(address _to, uint256 _tokenId) internal {
    require(idToOwner[_tokenId] == address(0), "cannot add, already owned.");
    idToOwner[_tokenId] = _to;

    ownerToIds[_to].push(_tokenId);
    idToOwnerIndex[_tokenId] = ownerToIds[_to].length.sub(1);
  }

  function _removeNFToken(address _from, uint256 _tokenId) internal {
    require(idToOwner[_tokenId] == _from, "incorrect owner.");
    delete idToOwner[_tokenId];

    uint256 tokenToRemoveIndex = idToOwnerIndex[_tokenId];
    uint256 lastTokenIndex = ownerToIds[_from].length.sub(1);

    if (lastTokenIndex != tokenToRemoveIndex) {
      uint256 lastToken = ownerToIds[_from][lastTokenIndex];
      ownerToIds[_from][tokenToRemoveIndex] = lastToken;
      idToOwnerIndex[lastToken] = tokenToRemoveIndex;
    }

    ownerToIds[_from].pop();
  }

  function _getOwnerNFTCount(address _owner) internal view returns (uint256) {
    return ownerToIds[_owner].length;
  }

  function _safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes memory _data
  ) private canTransfer(_tokenId) validNFToken(_tokenId) {
    address tokenOwner = idToOwner[_tokenId];
    require(tokenOwner == _from, "incorrect owner.");
    require(_to != address(0), "sender zero address");

    _transfer(_to, _tokenId);

    if (isContract(_to)) {
      bytes4 retval =
        IERC721TokenReceiver(_to).onERC721Received(
          msg.sender,
          _from,
          _tokenId,
          _data
        );
      require(retval == MAGIC_ON_ERC721_RECEIVED);
    }
  }

  function _clearApproval(uint256 _tokenId) private {
    if (idToApproval[_tokenId] != address(0)) {
      delete idToApproval[_tokenId];
    }
  }

  function totalSupply() public view returns (uint256) {
    return numTokens;
  }

  function tokenByIndex(uint256 index) public pure returns (uint256) {
    require(index >= 0 && index < TOKEN_LIMIT);
    return index + 1;
  }

  function tokenOfOwnerByIndex(address _owner, uint256 _index)
    external
    view
    returns (uint256)
  {
    require(_index < ownerToIds[_owner].length);
    return ownerToIds[_owner][_index];
  }

  function toString(uint256 value) internal pure returns (string memory) {
    if (value == 0) {
      return "0";
    }
    uint256 temp = value;
    uint256 digits;
    while (temp != 0) {
      digits++;
      temp /= 10;
    }
    bytes memory buffer = new bytes(digits);
    uint256 index = digits - 1;
    temp = value;
    while (temp != 0) {
      buffer[index--] = bytes1(uint8(48 + (temp % 10)));
      temp /= 10;
    }
    return string(buffer);
  }

  function name() external view returns (string memory _name) {
    _name = nftName;
  }

  function symbol() external view returns (string memory _symbol) {
    _symbol = nftSymbol;
  }

  function tokenURI(uint256 _tokenId)
    external
    view
    validNFToken(_tokenId)
    returns (string memory)
  {
    return
      string(
        abi.encodePacked("https://beebits.xyz/beebits/", toString(_tokenId))
      );
  }

  //// MARKET

  struct Offer {
    address maker;
    address taker;
    uint256 makerWei;
    uint256[] makerIds;
    uint256 takerWei;
    uint256[] takerIds;
    uint256 expiry;
    uint256 salt;
  }

  struct Listing {
    bool isForSale;
    uint256 tokenId;
    address seller;
    uint256 minimumValue;
    address sellTo;
  }

  struct Bid {
    bool hasBid;
    uint256 beebitTokenId;
    address bidder;
    uint256 bidValue;
  }

  function listBeebit(uint256 _askerTokenId, uint256 _askerMinPrice)
    public
    isTokenValid(_askerTokenId)
    returns (bool)
  {
    require(idToOwner[_askerTokenId] == msg.sender, "caller not beebit owner");
    require(
      beebitsListings[_askerTokenId].isForSale == false,
      "token already in sale"
    );

    Listing memory listing =
      Listing({
        isForSale: true,
        tokenId: _askerTokenId,
        seller: msg.sender,
        minimumValue: _askerMinPrice,
        sellTo: address(0)
      });

    bytes32 listingHash = hashListing(listing, _askerTokenId);
    beebitsListings[_askerTokenId] = listing;
    cancelledListings[listingHash] = false;

    emit BeebitListed(_askerTokenId, _askerMinPrice, address(0));
    return true;
  }

  function deListBeebit(
    uint256 _tokenId,
    address _newSeller,
    bytes32 _listingHash
  ) public isTokenValid(_tokenId) returns (bool) {
    require(idToOwner[_tokenId] == msg.sender, "caller not beebit owner");
    require(beebitsListings[_tokenId].isForSale, "token not in sale already");

    beebitsListings[_tokenId] = Listing(
      false,
      _tokenId,
      _newSeller,
      0,
      address(0)
    );
    cancelledListings[_listingHash] = true;
    emit BeebitDelisted(_tokenId);
    return true;
  }

  function bidForListing(uint256 _tokenId)
    public
    payable
    isTokenValid(_tokenId)
  {
    require(idToOwner[_tokenId] != address(0), "bid to invalid token");
    require(idToOwner[_tokenId] != msg.sender, "cannot bid to own listing");
    require(msg.value > 0, "empty bid received");

    require(
      msg.value > beebitsBids[_tokenId].bidValue,
      "bid value not high enough"
    );

    if (beebitsBids[_tokenId].bidValue > 0) {
      bnbBalance[beebitsBids[_tokenId].bidder] = bnbBalance[
        beebitsBids[_tokenId].bidder
      ]
        .add(beebitsBids[_tokenId].bidValue);
    }

    beebitsBids[_tokenId] = Bid(true, _tokenId, msg.sender, msg.value);
    emit BeebitBidPlaced(_tokenId, msg.value, msg.sender);
  }

  function withdrawBeebitBid(uint256 _tokenId)
    public
    nonReentrant
    isTokenValid(_tokenId)
    returns (bool)
  {
    require(idToOwner[_tokenId] != address(0), "bid to invalid token");
    require(
      idToOwner[_tokenId] != msg.sender,
      "bid withdraw cannot be done when owning a beebit"
    );

    require(beebitsBids[_tokenId].bidder == msg.sender, "caller not bidder");
    beebitsBids[_tokenId] = Bid(false, _tokenId, address(0), 0);
    (bool success, ) =
      msg.sender.call{value: beebitsBids[_tokenId].bidValue}("");
    require(success, "transaction failed");
    emit BeebitBidWithdrawn(
      _tokenId,
      beebitsBids[_tokenId].bidValue,
      msg.sender
    );
    return true;
  }

  function acceptBeebitBid(uint256 _tokenId, uint256 minPrice)
    public
    nonReentrant
    isTokenValid(_tokenId)
    returns (bool)
  {
    require(idToOwner[_tokenId] == msg.sender, "caller not owner");
    require(beebitsBids[_tokenId].hasBid, "invalid bid");
    require(
      beebitsBids[_tokenId].bidValue >= minPrice,
      "bid value not equal or greater than listed price"
    );

    Listing memory listing = beebitsListings[_tokenId];
    require(listing.isForSale, "token not listed");
    require(
      listing.seller == idToOwner[_tokenId],
      "seller no longer owner of beebit"
    );

    bytes32 listingHash = hashListing(listing, _tokenId);
    require(cancelledListings[listingHash] == false, "listing not found");

    bnbBalance[msg.sender] = bnbBalance[msg.sender].add(
      beebitsBids[_tokenId].bidValue
    );
    deListBeebit(_tokenId, beebitsBids[_tokenId].bidder, listingHash);

    _transfer(beebitsBids[_tokenId].bidder, _tokenId);

    beebitsBids[_tokenId] = Bid(false, _tokenId, address(0), 0);
    emit BeebitBought(
      _tokenId,
      beebitsBids[_tokenId].bidValue,
      msg.sender,
      beebitsBids[_tokenId].bidder
    );

    return true;
  }

  function buyBeebit(uint256 _tokenId)
    public
    payable
    nonReentrant
    isTokenValid(_tokenId)
    returns (bool)
  {
    Listing memory listing = beebitsListings[_tokenId];
    bytes32 listingHash = hashListing(listing, _tokenId);

    require(listing.seller != msg.sender, "cannot buy one's own beebit");
    require(listing.isForSale, "token not listed");
    require(cancelledListings[listingHash] == false, "listing not found");

    if (msg.value > 0) {
      bnbBalance[msg.sender] = bnbBalance[msg.sender].add(msg.value);
      emit Deposit(msg.sender, msg.value);
    }

    require(
      listing.sellTo == address(0) || listing.sellTo == msg.sender,
      "unauthorized"
    );
    require(
      bnbBalance[msg.sender] >= listing.minimumValue,
      "insufficient funds to execute trade."
    );
    require(
      listing.seller == idToOwner[_tokenId],
      "seller no longer owner of beebit"
    );

    // Transfer BNB
    bnbBalance[msg.sender] = bnbBalance[msg.sender].sub(listing.minimumValue);
    bnbBalance[listing.seller] = bnbBalance[listing.seller].add(
      listing.minimumValue
    );

    _transfer(msg.sender, _tokenId);

    deListBeebit(_tokenId, msg.sender, listingHash);

    emit BeebitBought(
      _tokenId,
      listing.minimumValue,
      listing.seller,
      msg.sender
    );

    if (
      beebitsBids[_tokenId].hasBid && beebitsBids[_tokenId].bidder == msg.sender
    ) {
      bnbBalance[msg.sender] = bnbBalance[msg.sender].add(
        beebitsBids[_tokenId].bidValue
      );
      beebitsBids[_tokenId] = Bid(false, _tokenId, address(0), 0);
    }

    return true;
  }

  function hashListing(Listing memory _listing, uint256 _tokenId)
    private
    pure
    returns (bytes32)
  {
    return
      keccak256(
        abi.encodePacked(
          _listing.isForSale,
          _listing.seller,
          _listing.minimumValue,
          _listing.sellTo,
          _tokenId
        )
      );
  }

  function hashOffer(Offer memory offer) private pure returns (bytes32) {
    return
      keccak256(
        abi.encodePacked(
          offer.maker,
          offer.taker,
          offer.makerWei,
          keccak256(abi.encodePacked(offer.makerIds)),
          offer.takerWei,
          keccak256(abi.encodePacked(offer.takerIds)),
          offer.expiry,
          offer.salt
        )
      );
  }

  function hashToSign(
    address maker,
    address taker,
    uint256 makerWei,
    uint256[] memory makerIds,
    uint256 takerWei,
    uint256[] memory takerIds,
    uint256 expiry,
    uint256 salt
  ) public pure returns (bytes32) {
    return
      hashOffer(
        Offer(
          maker,
          taker,
          makerWei,
          makerIds,
          takerWei,
          takerIds,
          expiry,
          salt
        )
      );
  }

  function hashToVerify(Offer memory offer) private pure returns (bytes32) {
    return
      keccak256(
        abi.encodePacked("\x19Ethereum Signed Message:\n32", hashOffer(offer))
      );
  }

  function verify(
    address signer,
    bytes32 hash,
    bytes memory signature
  ) internal pure returns (bool) {
    require(signer != address(0));
    require(signature.length == 65);

    bytes32 r;
    bytes32 s;
    uint8 v;

    assembly {
      r := mload(add(signature, 32))
      s := mload(add(signature, 64))
      v := byte(0, mload(add(signature, 96)))
    }

    if (v < 27) {
      v += 27;
    }

    require(v == 27 || v == 28);

    return signer == ecrecover(hash, v, r, s);
  }

  function tradeValid(
    address maker,
    address taker,
    uint256 makerWei,
    uint256[] memory makerIds,
    uint256 takerWei,
    uint256[] memory takerIds,
    uint256 expiry,
    uint256 salt,
    bytes memory signature
  ) public view returns (bool) {
    Offer memory offer =
      Offer(maker, taker, makerWei, makerIds, takerWei, takerIds, expiry, salt);
    bytes32 hash = hashOffer(offer);
    require(cancelledOffers[hash] == false, "trade offer was cancelled.");
    bytes32 verifyHash = hashToVerify(offer);
    require(verify(offer.maker, verifyHash, signature), "signature not valid.");
    require(block.timestamp < offer.expiry, "trade offer expired.");
    require(makerWei == 0 || takerWei == 0, "only one side of trade must pay.");
    require(
      makerIds.length > 0 || takerIds.length > 0,
      "one side must offer tokens."
    );
    require(
      bnbBalance[offer.maker] >= offer.makerWei,
      "maker does not have sufficient balance."
    );
    for (uint256 i = 0; i < offer.makerIds.length; i++) {
      require(
        idToOwner[offer.makerIds[i]] == offer.maker,
        "at least one maker token doesn't belong to maker."
      );
    }
    // If the taker can be anybody, then there can be no taker tokens
    if (offer.taker == address(0)) {
      // If taker not specified, then can't specify IDs
      require(
        offer.takerIds.length == 0,
        "if trade is offered to anybody, cannot specify tokens from taker."
      );
    } else {
      // Ensure the taker owns the taker tokens
      for (uint256 i = 0; i < offer.takerIds.length; i++) {
        require(
          idToOwner[offer.takerIds[i]] == offer.taker,
          "at least one taker token doesn't belong to taker."
        );
      }
    }
    return true;
  }

  function cancelOffer(
    address maker,
    address taker,
    uint256 makerWei,
    uint256[] memory makerIds,
    uint256 takerWei,
    uint256[] memory takerIds,
    uint256 expiry,
    uint256 salt
  ) external {
    require(maker == msg.sender, "only the maker can cancel this offer.");
    Offer memory offer =
      Offer(maker, taker, makerWei, makerIds, takerWei, takerIds, expiry, salt);
    bytes32 hash = hashOffer(offer);
    cancelledOffers[hash] = true;
    emit OfferCancelled(hash);
  }

  function acceptTrade(
    address maker,
    address taker,
    uint256 makerWei,
    uint256[] memory makerIds,
    uint256 takerWei,
    uint256[] memory takerIds,
    uint256 expiry,
    uint256 salt,
    bytes memory signature
  ) external payable nonReentrant {
    require(!marketPaused, "market is paused.");
    require(msg.sender != maker, "can't accept ones own trade.");
    Offer memory offer =
      Offer(maker, taker, makerWei, makerIds, takerWei, takerIds, expiry, salt);
    if (msg.value > 0) {
      bnbBalance[msg.sender] = bnbBalance[msg.sender].add(msg.value);
      emit Deposit(msg.sender, msg.value);
    }
    require(
      offer.taker == address(0) || offer.taker == msg.sender,
      "not the recipient of this offer."
    );
    require(
      tradeValid(
        maker,
        taker,
        makerWei,
        makerIds,
        takerWei,
        takerIds,
        expiry,
        salt,
        signature
      ),
      "trade not valid."
    );
    require(
      bnbBalance[msg.sender] >= offer.takerWei,
      "insufficient funds to execute trade."
    );
    // Transfer ETH
    bnbBalance[offer.maker] = bnbBalance[offer.maker].sub(offer.makerWei);
    bnbBalance[msg.sender] = bnbBalance[msg.sender].add(offer.makerWei);
    bnbBalance[msg.sender] = bnbBalance[msg.sender].sub(offer.takerWei);
    bnbBalance[offer.maker] = bnbBalance[offer.maker].add(offer.takerWei);
    // Transfer maker ids to taker (msg.sender)
    for (uint256 i = 0; i < makerIds.length; i++) {
      _transfer(msg.sender, makerIds[i]);
    }
    // Transfer taker ids to maker
    for (uint256 i = 0; i < takerIds.length; i++) {
      _transfer(maker, takerIds[i]);
    }
    // Prevent a replay attack on this offer
    bytes32 hash = hashOffer(offer);
    cancelledOffers[hash] = true;
    emit Trade(
      hash,
      offer.maker,
      msg.sender,
      offer.makerWei,
      offer.makerIds,
      offer.takerWei,
      offer.takerIds
    );
  }

  function withdraw(uint256 amount) external nonReentrant {
    require(amount <= bnbBalance[msg.sender], "insufficient funds");
    bnbBalance[msg.sender] = bnbBalance[msg.sender].sub(amount);
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "transaction failed");
    emit Withdraw(msg.sender, amount);
  }

  function deposit() external payable {
    bnbBalance[msg.sender] = bnbBalance[msg.sender].add(msg.value);
    emit Deposit(msg.sender, msg.value);
  }
}
