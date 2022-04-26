// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract CoveyLedger is Initializable {
    struct CoveyContent {
        address analyst;
        string content;
        uint256 created_at;
    }

    mapping(address => CoveyContent[]) analystContent;
    CoveyContent[] allContent;
    address owner;

    function initialize() public initializer {
        owner = msg.sender;
    }

    event ContentCreated(
        address indexed analyst,
        string content,
        uint256 indexed created_at
    );

    event AddressSwapped(
        address indexed oldAddress,
        address indexed newAddress
    );

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function createContent(string memory content) public {
        CoveyContent memory c = CoveyContent({
            analyst: msg.sender,
            content: content,
            created_at: block.timestamp
        });
        analystContent[msg.sender].push(c);
        allContent.push(c);

        emit ContentCreated(msg.sender, content, block.timestamp);
    }

    function getAnalystContent(address _adr)
        public
        view
        returns (CoveyContent[] memory)
    {
        return analystContent[_adr];
    }

    function getAllContent() public view returns (CoveyContent[] memory) {
        return allContent;
    }

    function AddressSwitch(address oldAddress, address newAddress) public {
        require(msg.sender == oldAddress);
        CoveyContent[] storage copyContent = analystContent[msg.sender];

        CoveyContent[] storage newAddressContent = analystContent[newAddress];

        if (newAddressContent.length > 0) {
            CoveyContent[] memory fullCopy;
            for (uint256 i = 0; i < copyContent.length; i++) {
                if (
                    copyContent[i].created_at < newAddressContent[0].created_at
                ) {
                    fullCopy[i] = copyContent[i];
                }
            }

            for (uint256 j = 0; j < newAddressContent.length; j++) {
                fullCopy[j] = newAddressContent[j];
            }

            delete analystContent[newAddress];

            for (uint256 k = 0; k < fullCopy.length; k++) {
                analystContent[newAddress][k] = fullCopy[k];
            }
        } else {
            analystContent[newAddress] = copyContent;
        }

        emit AddressSwapped(oldAddress, newAddress);
    }
}
