const connectMetamaskWallet = async () => {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    try {
      const [selectedAddress] = await window.ethereum
        .request({ method: 'eth_requestAccounts' })

      console.log(selectedAddress)
      return selectedAddress
    } catch (error) {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log('Please connect to MetaMask.');
      } else {
        console.error(error);
      }
    }
}

export default connectMetamaskWallet