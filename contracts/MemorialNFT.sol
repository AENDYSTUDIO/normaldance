// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Memorial NFT Contract
 * @dev G.rave - Digital Legacy System for Musicians
 * @author NORMAL DANCE Team
 * 
 * This contract manages eternal digital memorials for DJs and musicians.
 * Each memorial is an NFT that contains their musical legacy and can be
 * managed by heirs or the community.
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MemorialNFT is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _memorialIdCounter;
    
    // Memorial structure
    struct Memorial {
        uint256 id;
        string artistName;        // Stage name
        string realName;         // Real name (optional)
        string birthDate;        // Birth date
        string deathDate;        // Death date
        string bio;              // Biography
        string avatar;           // IPFS hash of avatar
        string banner;           // IPFS hash of banner
        string lastMix;          // IPFS hash of last mix
        string lastTrack;        // IPFS hash of last track
        uint256 totalTracks;     // Total tracks created
        uint256 totalPlays;      // Total plays
        uint256 totalLikes;      // Total likes
        MemorialType memorialType; // Type of memorial
        Status status;           // Memorial status
        address creator;         // Who created the memorial
        uint256 createdAt;       // Creation timestamp
        uint256 updatedAt;       // Last update timestamp
        
        // Blockchain data
        string blockchainHash;   // Blockchain hash for verification
        string eternalStorage;   // IPFS hash for eternal storage
        
        // Financial data
        uint256 memorialFund;    // Total funds in memorial
        uint256 totalDonations;  // Total donations received
        
        // Social data
        uint256 visitors;        // Number of visitors
        uint256 tributes;        // Number of tributes
        uint256 memories;        // Number of memories
    }
    
    // Heir structure for managing memorials
    struct Heir {
        address wallet;
        string name;
        string relationship;
        uint256 percentage;      // Percentage of memorial fund
        bool isActive;
        uint256 addedAt;
    }
    
    // Donation structure
    struct Donation {
        address donor;
        uint256 amount;
        string message;
        uint256 timestamp;
        bool isProcessed;
    }
    
    // Tribute structure
    struct Tribute {
        address author;
        string message;
        string trackId;          // IPFS hash of tribute track
        uint256 timestamp;
        uint256 likes;
        bool isVerified;
    }
    
    // Memory structure
    struct Memory {
        address author;
        string title;
        string description;
        string mediaUrl;         // IPFS hash of media
        MediaType mediaType;
        uint256 timestamp;
        bool isVerified;
    }
    
    // Enums
    enum MemorialType { DJ, PRODUCER, ARTIST, COLLECTIVE }
    enum Status { PENDING, ACTIVE, VERIFIED, ARCHIVED }
    enum MediaType { IMAGE, VIDEO, AUDIO, DOCUMENT }
    
    // Mappings
    mapping(uint256 => Memorial) public memorials;
    mapping(uint256 => Heir[]) public memorialHeirs;
    mapping(uint256 => Donation[]) public memorialDonations;
    mapping(uint256 => Tribute[]) public memorialTributes;
    mapping(uint256 => Memory[]) public memorialMemories;
    mapping(address => uint256[]) public userMemorials;
    mapping(string => uint256) public artistToMemorial;
    
    // Memorial fund management
    mapping(uint256 => uint256) public memorialFunds;
    mapping(uint256 => uint256) public totalDonations;
    
    // Events
    event MemorialCreated(
        uint256 indexed memorialId,
        string indexed artistName,
        address indexed creator,
        MemorialType memorialType
    );
    
    event HeirAdded(
        uint256 indexed memorialId,
        address indexed heir,
        uint256 percentage
    );
    
    event DonationReceived(
        uint256 indexed memorialId,
        address indexed donor,
        uint256 amount,
        string message
    );
    
    event TributeAdded(
        uint256 indexed memorialId,
        address indexed author,
        string message
    );
    
    event MemoryAdded(
        uint256 indexed memorialId,
        address indexed author,
        string title
    );
    
    event MemorialFundDistributed(
        uint256 indexed memorialId,
        address indexed heir,
        uint256 amount
    );
    
    constructor() ERC721("G.rave Memorial", "GRAVE") {}
    
    /**
     * @dev Create a new memorial NFT
     * @param artistName Stage name of the artist
     * @param realName Real name (optional)
     * @param birthDate Birth date
     * @param deathDate Death date
     * @param bio Biography
     * @param avatar IPFS hash of avatar
     * @param banner IPFS hash of banner
     * @param lastMix IPFS hash of last mix
     * @param lastTrack IPFS hash of last track
     * @param totalTracks Total tracks created
     * @param totalPlays Total plays
     * @param totalLikes Total likes
     * @param memorialType Type of memorial
     */
    function createMemorial(
        string memory artistName,
        string memory realName,
        string memory birthDate,
        string memory deathDate,
        string memory bio,
        string memory avatar,
        string memory banner,
        string memory lastMix,
        string memory lastTrack,
        uint256 totalTracks,
        uint256 totalPlays,
        uint256 totalLikes,
        MemorialType memorialType
    ) external {
        require(bytes(artistName).length > 0, "Artist name required");
        require(bytes(deathDate).length > 0, "Death date required");
        require(artistToMemorial[artistName] == 0, "Memorial already exists");
        
        uint256 memorialId = _memorialIdCounter.current();
        _memorialIdCounter.increment();
        
        memorials[memorialId] = Memorial({
            id: memorialId,
            artistName: artistName,
            realName: realName,
            birthDate: birthDate,
            deathDate: deathDate,
            bio: bio,
            avatar: avatar,
            banner: banner,
            lastMix: lastMix,
            lastTrack: lastTrack,
            totalTracks: totalTracks,
            totalPlays: totalPlays,
            totalLikes: totalLikes,
            memorialType: memorialType,
            status: Status.PENDING,
            creator: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            blockchainHash: "",
            eternalStorage: "",
            memorialFund: 0,
            totalDonations: 0,
            visitors: 0,
            tributes: 0,
            memories: 0
        });
        
        artistToMemorial[artistName] = memorialId;
        userMemorials[msg.sender].push(memorialId);
        
        // Mint NFT to creator
        _safeMint(msg.sender, memorialId);
        
        emit MemorialCreated(memorialId, artistName, msg.sender, memorialType);
    }
    
    /**
     * @dev Add an heir to manage the memorial
     * @param memorialId ID of the memorial
     * @param heirAddress Address of the heir
     * @param name Name of the heir
     * @param relationship Relationship to the artist
     * @param percentage Percentage of memorial fund
     */
    function addHeir(
        uint256 memorialId,
        address heirAddress,
        string memory name,
        string memory relationship,
        uint256 percentage
    ) external {
        require(_exists(memorialId), "Memorial does not exist");
        require(ownerOf(memorialId) == msg.sender, "Not memorial owner");
        require(percentage > 0 && percentage <= 100, "Invalid percentage");
        
        memorialHeirs[memorialId].push(Heir({
            wallet: heirAddress,
            name: name,
            relationship: relationship,
            percentage: percentage,
            isActive: true,
            addedAt: block.timestamp
        }));
        
        emit HeirAdded(memorialId, heirAddress, percentage);
    }
    
    /**
     * @dev Donate to a memorial fund
     * @param memorialId ID of the memorial
     * @param message Optional message with donation
     */
    function donateToMemorial(
        uint256 memorialId,
        string memory message
    ) external payable {
        require(_exists(memorialId), "Memorial does not exist");
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        memorialFunds[memorialId] += msg.value;
        totalDonations[memorialId] += 1;
        
        memorialDonations[memorialId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            message: message,
            timestamp: block.timestamp,
            isProcessed: false
        }));
        
        // Update memorial data
        memorials[memorialId].memorialFund += msg.value;
        memorials[memorialId].totalDonations += 1;
        memorials[memorialId].updatedAt = block.timestamp;
        
        emit DonationReceived(memorialId, msg.sender, msg.value, message);
    }
    
    /**
     * @dev Add a tribute to a memorial
     * @param memorialId ID of the memorial
     * @param message Tribute message
     * @param trackId IPFS hash of tribute track (optional)
     */
    function addTribute(
        uint256 memorialId,
        string memory message,
        string memory trackId
    ) external {
        require(_exists(memorialId), "Memorial does not exist");
        require(bytes(message).length > 0, "Message required");
        
        memorialTributes[memorialId].push(Tribute({
            author: msg.sender,
            message: message,
            trackId: trackId,
            timestamp: block.timestamp,
            likes: 0,
            isVerified: false
        }));
        
        memorials[memorialId].tributes += 1;
        memorials[memorialId].updatedAt = block.timestamp;
        
        emit TributeAdded(memorialId, msg.sender, message);
    }
    
    /**
     * @dev Add a memory to a memorial
     * @param memorialId ID of the memorial
     * @param title Memory title
     * @param description Memory description
     * @param mediaUrl IPFS hash of media
     * @param mediaType Type of media
     */
    function addMemory(
        uint256 memorialId,
        string memory title,
        string memory description,
        string memory mediaUrl,
        MediaType mediaType
    ) external {
        require(_exists(memorialId), "Memorial does not exist");
        require(bytes(title).length > 0, "Title required");
        
        memorialMemories[memorialId].push(Memory({
            author: msg.sender,
            title: title,
            description: description,
            mediaUrl: mediaUrl,
            mediaType: mediaType,
            timestamp: block.timestamp,
            isVerified: false
        }));
        
        memorials[memorialId].memories += 1;
        memorials[memorialId].updatedAt = block.timestamp;
        
        emit MemoryAdded(memorialId, msg.sender, title);
    }
    
    /**
     * @dev Distribute memorial fund to heirs
     * @param memorialId ID of the memorial
     */
    function distributeMemorialFund(uint256 memorialId) external nonReentrant {
        require(_exists(memorialId), "Memorial does not exist");
        require(ownerOf(memorialId) == msg.sender, "Not memorial owner");
        
        uint256 totalFund = memorialFunds[memorialId];
        require(totalFund > 0, "No funds to distribute");
        
        Heir[] memory heirs = memorialHeirs[memorialId];
        require(heirs.length > 0, "No heirs defined");
        
        for (uint256 i = 0; i < heirs.length; i++) {
            if (heirs[i].isActive) {
                uint256 amount = (totalFund * heirs[i].percentage) / 100;
                if (amount > 0) {
                    payable(heirs[i].wallet).transfer(amount);
                    emit MemorialFundDistributed(memorialId, heirs[i].wallet, amount);
                }
            }
        }
        
        // Reset memorial fund
        memorialFunds[memorialId] = 0;
        memorials[memorialId].memorialFund = 0;
    }
    
    /**
     * @dev Verify a memorial (admin only)
     * @param memorialId ID of the memorial
     * @param blockchainHash Blockchain hash for verification
     * @param eternalStorage IPFS hash for eternal storage
     */
    function verifyMemorial(
        uint256 memorialId,
        string memory blockchainHash,
        string memory eternalStorage
    ) external onlyOwner {
        require(_exists(memorialId), "Memorial does not exist");
        
        memorials[memorialId].status = Status.VERIFIED;
        memorials[memorialId].blockchainHash = blockchainHash;
        memorials[memorialId].eternalStorage = eternalStorage;
        memorials[memorialId].updatedAt = block.timestamp;
    }
    
    /**
     * @dev Get memorial details
     * @param memorialId ID of the memorial
     */
    function getMemorial(uint256 memorialId) external view returns (Memorial memory) {
        require(_exists(memorialId), "Memorial does not exist");
        return memorials[memorialId];
    }
    
    /**
     * @dev Get memorial heirs
     * @param memorialId ID of the memorial
     */
    function getMemorialHeirs(uint256 memorialId) external view returns (Heir[] memory) {
        return memorialHeirs[memorialId];
    }
    
    /**
     * @dev Get memorial donations
     * @param memorialId ID of the memorial
     */
    function getMemorialDonations(uint256 memorialId) external view returns (Donation[] memory) {
        return memorialDonations[memorialId];
    }
    
    /**
     * @dev Get memorial tributes
     * @param memorialId ID of the memorial
     */
    function getMemorialTributes(uint256 memorialId) external view returns (Tribute[] memory) {
        return memorialTributes[memorialId];
    }
    
    /**
     * @dev Get memorial memories
     * @param memorialId ID of the memorial
     */
    function getMemorialMemories(uint256 memorialId) external view returns (Memory[] memory) {
        return memorialMemories[memorialId];
    }
    
    /**
     * @dev Get user's memorials
     * @param user User address
     */
    function getUserMemorials(address user) external view returns (uint256[] memory) {
        return userMemorials[user];
    }
    
    /**
     * @dev Get memorial by artist name
     * @param artistName Artist name
     */
    function getMemorialByArtist(string memory artistName) external view returns (uint256) {
        return artistToMemorial[artistName];
    }
    
    /**
     * @dev Update memorial visitor count
     * @param memorialId ID of the memorial
     */
    function visitMemorial(uint256 memorialId) external {
        require(_exists(memorialId), "Memorial does not exist");
        memorials[memorialId].visitors += 1;
    }
    
    /**
     * @dev Withdraw contract balance (emergency only)
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Override tokenURI to return memorial metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        Memorial memory memorial = memorials[tokenId];
        
        // Return JSON metadata for the memorial
        return string(abi.encodePacked(
            '{"name":"', memorial.artistName, ' Memorial",',
            '"description":"', memorial.bio, '",',
            '"image":"ipfs://', memorial.avatar, '",',
            '"attributes":[',
            '{"trait_type":"Type","value":"', _memorialTypeToString(memorial.memorialType), '"},',
            '{"trait_type":"Status","value":"', _statusToString(memorial.status), '"},',
            '{"trait_type":"Total Tracks","value":', _uint2str(memorial.totalTracks), '},',
            '{"trait_type":"Total Plays","value":', _uint2str(memorial.totalPlays), '},',
            '{"trait_type":"Total Likes","value":', _uint2str(memorial.totalLikes), '},',
            '{"trait_type":"Visitors","value":', _uint2str(memorial.visitors), '}',
            ']}'
        ));
    }
    
    // Helper functions
    function _memorialTypeToString(MemorialType memorialType) internal pure returns (string memory) {
        if (memorialType == MemorialType.DJ) return "DJ";
        if (memorialType == MemorialType.PRODUCER) return "Producer";
        if (memorialType == MemorialType.ARTIST) return "Artist";
        if (memorialType == MemorialType.COLLECTIVE) return "Collective";
        return "Unknown";
    }
    
    function _statusToString(Status status) internal pure returns (string memory) {
        if (status == Status.PENDING) return "Pending";
        if (status == Status.ACTIVE) return "Active";
        if (status == Status.VERIFIED) return "Verified";
        if (status == Status.ARCHIVED) return "Archived";
        return "Unknown";
    }
    
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
