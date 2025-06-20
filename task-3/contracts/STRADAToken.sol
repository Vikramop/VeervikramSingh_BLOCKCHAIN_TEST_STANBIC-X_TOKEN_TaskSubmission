// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract STRADAToken is ERC20, Ownable, EIP712 {
    using ECDSA for bytes32;

    uint256 public maxTxAmount;
    uint256 public cooldownTime = 60; // 60 seconds cooldown
    mapping(address => uint256) private lastTxTime;

    // EIP-712 nonces for `permit` function
    mapping(address => uint256) public nonces;

    // testing purpose
    mapping(address => bool) private _isExcludedFromCooldown;
    mapping(address => bool) private _isExcludedFromMaxTx;

    // EIP-712 Domain Separator name and version
    string private constant NAME = "STRADA Token";
    string private constant VERSION = "1";

    constructor(uint256 initialSupply) Ownable() ERC20(NAME, "STRADA") EIP712(NAME, VERSION) {
        _mint(msg.sender, initialSupply);
        maxTxAmount = initialSupply / 100; // 1% of initial supply (with decimals)

        // testing purpose
        _isExcludedFromCooldown[msg.sender] = true;
        _isExcludedFromMaxTx[msg.sender] = true;
    }

    modifier antiWhale(address sender, uint256 amount) {
        if (!_isExcludedFromMaxTx[sender]) {
            require(
                amount <= maxTxAmount,
                "STRADA: Transfer amount exceeds maxTxAmount"
            );
        }
        _;
    }

    modifier antiBot(address sender) {
        if (!_isExcludedFromCooldown[sender]) {
            require(
                block.timestamp - lastTxTime[sender] >= cooldownTime,
                "STRADA: Please wait before making another transaction"
            );
            _;
            lastTxTime[sender] = block.timestamp;
        } else {
            _; // Skip cooldown check for excluded addresses
        }
    }

    function transfer(
        address to,
        uint256 amount
    )
        public
        override
        antiWhale(msg.sender, amount)
        antiBot(msg.sender)
        returns (bool)
    {
        return super.transfer(to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override antiWhale(from, amount) antiBot(from) returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function setMaxTxAmount(uint256 newMaxTxAmount) external onlyOwner {
        maxTxAmount = newMaxTxAmount;
    }

    function setCooldownTime(uint256 newCooldownTime) external onlyOwner {
        cooldownTime = newCooldownTime;
    }

    function setCooldownExcluded(
        address account,
        bool excluded
    ) external onlyOwner {
        _isExcludedFromCooldown[account] = excluded;
    }

    /**
     * @dev Allows approvals via EIP-712 signatures (gasless approvals).
     * @param owner The owner of the tokens.
     * @param spender The spender to approve.
     * @param value The amount to approve.
     * @param deadline The deadline for the signature.
     * @param v The recovery id.
     * @param r The first 32 bytes of the signature.
     * @param s The second 32 bytes of the signature.
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(block.timestamp <= deadline, "STRADA: Signature expired");

        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                owner,
                spender,
                value,
                nonces[owner],
                deadline
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, v, r, s);

        require(signer == owner, "STRADA: Invalid signature");

        nonces[owner]++;
        _approve(owner, spender, value);
    }
}
