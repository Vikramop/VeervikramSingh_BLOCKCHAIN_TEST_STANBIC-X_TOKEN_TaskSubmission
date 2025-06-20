// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IBLXToken {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

interface ISTRADAToken {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract SXToken is ERC20, Ownable, ReentrancyGuard {
    IBLXToken public blxToken;
    ISTRADAToken public stradaToken;

    uint256 public constant COLLATERAL_RATIO = 1; // 1 BLX + 1 STRADA per SXT
    uint256 public maxTxAmount;
    uint256 public cooldownTime = 60;
    mapping(address => uint256) private lastTxTime;
    mapping(address => bool) private _isExcludedFromCooldown;

    constructor(
        address _blxAddress,
        address _stradaAddress,
        uint256 initialSupply
    ) ERC20("Stanbic-X Token", "SXT") Ownable() {
        blxToken = IBLXToken(_blxAddress);
        stradaToken = ISTRADAToken(_stradaAddress);
        maxTxAmount = (initialSupply * 10 ** decimals()) / 100; // 1% maxTxAmount
        _isExcludedFromCooldown[msg.sender] = true;
    }

    // Deposit BLX and STRADA to mint SXT (1:1:1 ratio)
    function depositCollateral(
        uint256 blxAmount,
        uint256 stradaAmount
    ) external nonReentrant {
        require(blxAmount == stradaAmount, "SXT: Collateral ratio mismatch");
        require(blxAmount > 0, "SXT: Amount must be > 0");

        // Transfer collateral
        blxToken.transferFrom(msg.sender, address(this), blxAmount);
        stradaToken.transferFrom(msg.sender, address(this), stradaAmount);

        // Mint SXT
        _mint(msg.sender, blxAmount);
    }

    // Redeem SXT for BLX and STRADA
    function redeem(uint256 sxtAmount) external nonReentrant {
        require(
            balanceOf(msg.sender) >= sxtAmount,
            "SXT: Insufficient balance"
        );

        // Burn SXT
        _burn(msg.sender, sxtAmount);

        // Return collateral
        blxToken.transfer(msg.sender, sxtAmount);
        stradaToken.transfer(msg.sender, sxtAmount);
    }

    // Anti-whale and anti-bot logic (same as BLX)
    modifier antiWhale(address sender, uint256 amount) {
        require(amount <= maxTxAmount, "SXT: Exceeds maxTxAmount");
        _;
    }

    modifier antiBot(address sender) {
        if (!_isExcludedFromCooldown[sender]) {
            require(
                block.timestamp - lastTxTime[sender] >= cooldownTime,
                "SXT: Cooldown active"
            );
            lastTxTime[sender] = block.timestamp;
        }
        _;
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

    // Admin functions
    function setMaxTxAmount(uint256 newMaxTxAmount) external onlyOwner {
        maxTxAmount = newMaxTxAmount;
    }

    function setCooldownExcluded(
        address account,
        bool excluded
    ) external onlyOwner {
        _isExcludedFromCooldown[account] = excluded;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
