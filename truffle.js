// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    dev: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ropsten: {
      host: 'localhost',
      port: 8545,
      network_id: '3', // Match any network id
      from: '4dbe0e27e2a4e865f36d3710848529d2a8d8cd55',
      gas: '6713058 '
    }
  }
}
