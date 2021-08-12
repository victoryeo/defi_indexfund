This is an early prototype of DeFi indexed fund. It is designed to track a mixture of tokens and stocks. It tracks minimum two tokens/shares, maximum eight tokens/shares. It is composed of price oracles + smart contracts.

Decentralised price oracles:
- For any asset in the set of index fund, F = asset1 + asset2 + asset3...
miners submit a vote for what they believe to be the current price in the target asset.
- Every n blocks the vote is tallied by taking the weighted medians as the true price.
- Some amount of token is rewarded to those who voted within 1 standard deviation of the
elected median. Those who voted outside may be punished via slashing of their stakes. The
ratio of those that are punished and rewarded may be calibrated by the system in every vote to ensure that a sufficiently large portion of the miners vote.

The smart contract source code is in src/contracts folder.
The smart contract test code is in test/ folder.

Run "truffle compile" to compile the smart contracts.
Run "truffle test" to test the smart contracts.

The code is tested with Ganache. The idea is inspired by balancer.
