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
        analystContent[newAddress] = copyContent;

        emit AddressSwapped(oldAddress, newAddress);
    }

    function AddressCopy(
        address oldAddress,
        address newAddress,
        uint256[] memory indexes
    ) public {
        require(msg.sender == oldAddress);

        for (uint256 i = 0; i < indexes.length; i++) {
            require(
                analystContent[oldAddress][indexes[i]].created_at <
                    analystContent[newAddress][0].created_at,
                'Copied content cannot be after your first trade on your new ledger'
            );
            analystContent[newAddress].push(
                analystContent[oldAddress][indexes[i]]
            );
        }
    }
}
