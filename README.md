# NFTeam Smart Contracts



![Develop](https://github.com/holonic-pod/smartcontracts-nfteam-01/actions/workflows/tests.yaml/badge.svg)

## Install pre-requirements

`npm install`

## Compile contracts

`truffle compile`

## Linting code

`solhint contracts/**/*.sol`

## Test contracts

`truffle test --network development`

## Code coverage

`truffle run coverage --testfiles "test/*.js" --network development`

- Reports are written to terminal and ./coverage/ folder

- You don't need to start ganache in order to execute this command

## Configure env variables

Caution: Never push this file to git.

source .env

## Migrate contracts

`truffle migrate --network development`

## Verify contracts

`truffle run verify NovaNFT --network polygon_infura_testnet --debug`

`truffle run verify AuctionNFT --network polygon_infura_testnet --debug`

- This allows you to automatically verify your smart contracts' source code on Etherscan, straight from the Truffle CLI. More information at [truffle-plugin-verify](https://www.npmjs.com/package/truffle-plugin-verify)

## Truffle dashboard

`truffle dashboard`

- Truffle Dashboard connects directly to MetaMask it is also possible to use it in combination with hardware wallets like Ledger or Trezor. By default, the command above starts a dashboard at http://localhost:24012 and opens the dashboard in a new tab in your default browser. More information at [Using the Truffle Dashboard](https://trufflesuite.com/docs/truffle/getting-started/using-the-truffle-dashboard/)

## Polygon faucet

Get test MATIC at [Polygon Faucet](https://faucet.polygon.technology/)

## NatSpec format

The documentation included in the Solidity source code was written using the Ethereum Natural Language Specification Format (NatSpec).
More information at [NatSpec Format](https://docs.soliditylang.org/en/latest/natspec-format.html)

## Contract Addresses

NovaNFT address: [0x21fcB96F5271B69deFbd4233630CFF0217D9e8fd](https://mumbai.polygonscan.com/address/0x21fcB96F5271B69deFbd4233630CFF0217D9e8fd)

AuctionNFT address: [0x6DD6B8e6B2533502A92FDFE843Bd7b89e68EB2Bb](https://mumbai.polygonscan.com/address/0x6DD6B8e6B2533502A92FDFE843Bd7b89e68EB2Bb)
