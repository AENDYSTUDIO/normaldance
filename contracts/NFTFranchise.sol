// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title NFT Franchise Contract
 * @dev NORMAL DANCE - NFT Franchise System
 * @author NORMAL DANCE Team
 * 
 * This contract manages NFT franchises for music tracks.
 * Each franchise represents a share in a music track's revenue.
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTFranchise is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Franchise structure
    struct Franchise {
        uint256 id;
        string trackId;           // IPFS hash of the track
        string artistName;        // Artist name
        string trackTitle;        // Track title
        uint256 totalShares;      // Total shares available (100 = 100%)
        uint256 soldShares;       // Shares sold
        uint256 pricePerShare;    // Price per share in wei
        uint256 totalRevenue;     // Total revenue generated
        bool isActive;            // Is franchise active
        address artist;           // Original artist address
        uint256 createdAt;        // Creation timestamp
    }
    
    // Mapping from token ID to franchise
    mapping(uint256 => Franchise) public franchises;
    
    // Mapping from track ID to franchise ID
    mapping(string => uint256) public trackToFranchise;
    
    // Mapping from user to their shares
    mapping(address => mapping(uint256 => uint256)) public userShares;
    
    // Revenue sharing
    uint256 public constant ARTIST_SHARE = 50;      // 50% to artist
    uint256 public constant PLATFORM_SHARE = 30;    // 30% to platform
    uint256 public constant FRANCHISE_SHARE = 20;   // 20% to franchise holders
    
    // Events
    event FranchiseCreated(
        uint256 indexed franchiseId,
        string indexed trackId,
        address indexed artist,
        uint256 totalShares,
        uint256 pricePerShare
    );
    
    event SharePurchased(
        uint256 indexed franchiseId,
        address indexed buyer,
        uint256 shares,
        uint256 totalPrice
    );
    
    event RevenueDistributed(
        uint256 indexed franchiseId,
        uint256 totalRevenue,
        uint256 artistAmount,
        uint256 platformAmount,
        uint256 franchiseAmount
    );
    
    constructor() ERC721("NORMAL DANCE Franchise", "NDF") {}
    
    /**
     * @dev Create a new franchise for a track
     * @param trackId IPFS hash of the track
     * @param artistName Name of the artist
     * @param trackTitle Title of the track
     * @param totalShares Total shares available (100 = 100%)
     * @param pricePerShare Price per share in wei
     */
    function createFranchise(
        string memory trackId,
        string memory artistName,
        string memory trackTitle,
        uint256 totalShares,
        uint256 pricePerShare
    ) external onlyOwner {
        require(totalShares > 0 && totalShares <= 100, "Invalid total shares");
        require(pricePerShare > 0, "Invalid price per share");
        require(trackToFranchise[trackId] == 0, "Franchise already exists");
        
        uint256 franchiseId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        franchises[franchiseId] = Franchise({
            id: franchiseId,
            trackId: trackId,
            artistName: artistName,
            trackTitle: trackTitle,
            totalShares: totalShares,
            soldShares: 0,
            pricePerShare: pricePerShare,
            totalRevenue: 0,
            isActive: true,
            artist: msg.sender,
            createdAt: block.timestamp
        });
        
        trackToFranchise[trackId] = franchiseId;
        
        emit FranchiseCreated(franchiseId, trackId, msg.sender, totalShares, pricePerShare);
    }
    
    /**
     * @dev Purchase shares in a franchise
     * @param franchiseId ID of the franchise
     * @param shares Number of shares to purchase
     */
    function purchaseShares(uint256 franchiseId, uint256 shares) external payable nonReentrant {
        require(franchises[franchiseId].isActive, "Franchise not active");
        require(shares > 0, "Invalid shares amount");
        require(
            franchises[franchiseId].soldShares + shares <= franchises[franchiseId].totalShares,
            "Not enough shares available"
        );
        
        uint256 totalPrice = shares * franchises[franchiseId].pricePerShare;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Update franchise
        franchises[franchiseId].soldShares += shares;
        
        // Update user shares
        userShares[msg.sender][franchiseId] += shares;
        
        // Mint NFT if this is the first share purchase
        if (userShares[msg.sender][franchiseId] == shares) {
            _safeMint(msg.sender, franchiseId);
        }
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit SharePurchased(franchiseId, msg.sender, shares, totalPrice);
    }
    
    /**
     * @dev Distribute revenue to franchise holders
     * @param franchiseId ID of the franchise
     * @param revenue Total revenue to distribute
     */
    function distributeRevenue(uint256 franchiseId, uint256 revenue) external onlyOwner {
        require(franchises[franchiseId].isActive, "Franchise not active");
        require(revenue > 0, "Invalid revenue amount");
        
        franchises[franchiseId].totalRevenue += revenue;
        
        uint256 artistAmount = (revenue * ARTIST_SHARE) / 100;
        uint256 platformAmount = (revenue * PLATFORM_SHARE) / 100;
        uint256 franchiseAmount = (revenue * FRANCHISE_SHARE) / 100;
        
        // Transfer to artist
        payable(franchises[franchiseId].artist).transfer(artistAmount);
        
        // Transfer to platform (owner)
        payable(owner()).transfer(platformAmount);
        
        // Franchise amount stays in contract for now (can be claimed by holders)
        
        emit RevenueDistributed(franchiseId, revenue, artistAmount, platformAmount, franchiseAmount);
    }
    
    /**
     * @dev Get franchise details
     * @param franchiseId ID of the franchise
     */
    function getFranchise(uint256 franchiseId) external view returns (Franchise memory) {
        return franchises[franchiseId];
    }
    
    /**
     * @dev Get user's shares in a franchise
     * @param user User address
     * @param franchiseId Franchise ID
     */
    function getUserShares(address user, uint256 franchiseId) external view returns (uint256) {
        return userShares[user][franchiseId];
    }
    
    /**
     * @dev Get franchise ID by track ID
     * @param trackId IPFS hash of the track
     */
    function getFranchiseByTrack(string memory trackId) external view returns (uint256) {
        return trackToFranchise[trackId];
    }
    
    /**
     * @dev Calculate user's share of revenue
     * @param user User address
     * @param franchiseId Franchise ID
     * @param totalRevenue Total revenue
     */
    function calculateUserRevenue(
        address user,
        uint256 franchiseId,
        uint256 totalRevenue
    ) external view returns (uint256) {
        uint256 userShareCount = userShares[user][franchiseId];
        if (userShareCount == 0) return 0;
        
        uint256 franchiseRevenue = (totalRevenue * FRANCHISE_SHARE) / 100;
        return (franchiseRevenue * userShareCount) / franchises[franchiseId].totalShares;
    }
    
    /**
     * @dev Withdraw contract balance (emergency only)
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Pause/unpause franchise
     * @param franchiseId Franchise ID
     * @param active Active status
     */
    function setFranchiseActive(uint256 franchiseId, bool active) external onlyOwner {
        franchises[franchiseId].isActive = active;
    }
}
