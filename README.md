# PayFlow
Blockchain autopay system


how to use:

This application is best used on a desktop or laptop browser with MetaMask installed.

First switch MetaMask to the Sepolia test network. The app uses test "USDC on Sepolia" along with Chainlink Automation.

Get Sepolia ETH from a faucet for gas fees and test USDC from a Sepolia USDC faucet. Once the wallet has funds, open the app in the browser and connect MetaMask.

get sepolia ETH without mainnet ETH - sepolia-faucet.pk910.de
get sepolia USDC - https://faucet.circle.com/

After logging in, click the Approve USDC button. This is a one time approval that allows the smart contract to automatically charge small amounts for subscriptions without asking for repeated signatures.

Once approved, select any subscription such as Netflix, YouTube, or Spotify and click Subscribe. The first payment happens instantly and future payments are handled automatically using Chainlink Automation.

You can revoke USDC approval at any time to stop all future payments. You can also cancel individual subscriptions directly from the dashboard.

Merchant pages can be accessed through the dashboard to verify whether the connected wallet has an active subscription. This simulates real world access control where services check on chain subscription status before allowing access.

This demo shows how crypto based autopay subscriptions can work securely without traditional wallets or recurring user signatures.
