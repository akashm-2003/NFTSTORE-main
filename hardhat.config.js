require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.API_URL_SEPOLIA,
      accounts: [process.env.PRIVATE_KEY],
    },
    holesky:{
      url: process.env.API_URL_HOLESKY,
      accounts: [process.env.PRIVATE_KEY],
    }
  },
};
