// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StanbicXLiquidStaking is ERC20, ReentrancyGuard {
    IERC20 public immutable sxtToken;
    IERC20 public immutable rewardToken;

    // Total SXT tokens staked (including rewards)
    uint256 public totalSXTStaked;

    // Reward tracking
    uint256 public rewardPerTokenStored;
    uint256 public lastUpdateTime;
    uint256 public rewardRate;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(
        address _sxtToken,
        address _rewardToken,
        uint256 _rewardRate
    ) ERC20("Staked SXT", "stSXT") {
        sxtToken = IERC20(_sxtToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) /
                totalSupply());
    }

    function earned(address account) public view returns (uint256) {
        return
            ((balanceOf(account) *
                (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }

    function stake(
        uint256 amount
    ) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake zero");
        require(
            sxtToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        uint256 stSXTToMint;
        if (totalSupply() == 0 || totalSXTStaked == 0) {
            stSXTToMint = amount;
        } else {
            stSXTToMint = (amount * totalSupply()) / totalSXTStaked;
        }

        _mint(msg.sender, stSXTToMint);
        totalSXTStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(
        uint256 stSXTAmount
    ) external nonReentrant updateReward(msg.sender) {
        require(stSXTAmount > 0, "Cannot unstake zero");
        require(balanceOf(msg.sender) >= stSXTAmount, "Insufficient stSXT");

        uint256 sxtAmount = (stSXTAmount * totalSXTStaked) / totalSupply();

        _burn(msg.sender, stSXTAmount);
        totalSXTStaked -= sxtAmount;

        // Claim rewards
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            require(
                rewardToken.transfer(msg.sender, reward),
                "Reward transfer failed"
            );
            emit RewardPaid(msg.sender, reward);
        }

        require(sxtToken.transfer(msg.sender, sxtAmount), "Transfer failed");
        emit Unstaked(msg.sender, stSXTAmount);
    }

    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            require(
                rewardToken.transfer(msg.sender, reward),
                "Reward transfer failed"
            );
            emit RewardPaid(msg.sender, reward);
        }
    }

    // Admin function to update reward rate
    function setRewardRate(uint256 newRate) external {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        rewardRate = newRate;
    }

    // Exchange rate: how much SXT each stSXT token is worth
    function exchangeRate() external view returns (uint256) {
        if (totalSupply() == 0) return 1e18;
        return (totalSXTStaked * 1e18) / totalSupply();
    }
}
