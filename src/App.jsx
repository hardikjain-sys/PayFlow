import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Subscriptions from "./Subscriptions";
import { Routes, Route } from "react-router-dom";
import MerchantDashboard from "./MerchantDashboard";
import { useNavigate } from "react-router-dom";

function App() {
  const SUBSCRIPTION_CONTRACT_ADDRESS =
    "0x4Cef27DBd0988dF14FeeFA4E26b63c99f83e5c67";

    const navigate = useNavigate();

  const SUBSCRIPTION_ABI = [
    "function subscribe(address merchant, uint256 amount, uint256 interval)",
    "function cancel(address merchant)",
    "function subscriptions(address user, address merchant) view returns (address,address,uint256,uint256,uint256,bool,bool)",
  ];

  const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const USDC_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
  ];

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);


  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAddress("");
        setApproved(false);
      } else {
        setAddress(accounts[0]);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);


  useEffect(() => {
    const init = async () => {
      const savedName = localStorage.getItem("name");
      if (savedName) setName(savedName);

      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!address) {
      setApproved(false);
      return;
    }

    const checkApproval = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

      const allowance = await usdc.allowance(
        address,
        SUBSCRIPTION_CONTRACT_ADDRESS
      );

      setApproved(allowance > 0n);
    };

    checkApproval();
  }, [address]);

  const actionBtn = {
  padding: "10px",
  borderRadius: "80px",
  border: "none",
  cursor: "pointer",
  fontWeight: "100",
    background: "#F5F5DC"
};

  const loginWithMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAddress(accounts[0]);

    localStorage.setItem("name", name);
  };

  const logout = () => {
    setAddress("");
    setName("");
    localStorage.removeItem("name");
  };

  const getSubscriptionContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(
      SUBSCRIPTION_CONTRACT_ADDRESS,
      SUBSCRIPTION_ABI,
      signer
    );
  };

  const approveUSDC = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

    const tx = await usdc.approve(
      SUBSCRIPTION_CONTRACT_ADDRESS,
      ethers.parseUnits("1000", 6)
    );
    await tx.wait();
    setApproved(true);
  };

  const revokeUSDC = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

    const tx = await usdc.approve(
      SUBSCRIPTION_CONTRACT_ADDRESS,
      0
    );
    await tx.wait();
    setApproved(false);
  };

  const subscribe = async (merchant, price) => {
    const contract = await getSubscriptionContract();
    await contract.subscribe(
      merchant,
      ethers.parseUnits(price, 6),
      120 
    );
  };

  const cancelSub = async (merchant) => {
    const contract = await getSubscriptionContract();
    await contract.cancel(merchant);
  };

  const isSubscribed = async (merchant) => {
    const contract = await getSubscriptionContract();
    const sub = await contract.subscriptions(address, merchant);
    return sub[5];
  };


  if (loading) return null;

  return (
  <Routes>
    <Route
      path="/"
      element={
        !address ? (
          <div style={{ minHeight: "100vh", background: "#111", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "360px", background: "#1a1a1a", padding: "24px", borderRadius: "12px" }}>
              <h2 style={{ color: "#fff", textAlign: "center" }}>Login</h2>

              <input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "12px" , 
                  borderRadius: "80px"
                }}
              />

              <button onClick={loginWithMetaMask} style={{ 


                  width: "100%",
                  padding: "10px",
                  borderRadius: "80px",
                  border: "none",
                  cursor: "pointer",
                  background: "#F5F5DC",
                  color: "black",
                  fontWeight: "200",

               }}>
                Login with MetaMask
              </button>
            </div>
          </div>
        ) : (
          <div style={{ minHeight: "100vh", background: "#111", color: "#fff", display: "flex", justifyContent: "center", padding: "16px" }}>
            <div style={{ width: "360px" }}>
              <h2>Dashboard</h2>
              <p><b>Name:</b> {name}</p>
              <p><b>Address:</b> {address}</p>

              <button
                onClick={approved ? revokeUSDC : approveUSDC}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: approved ? "#ff6b6b" : "#1db954",
                  color: "#000",
                  fontWeight: "600",
                }}
              >
                {approved ? "Revoke USDC Approval" : "Approve USDC for Autopay"}
              </button>
              <p><b style={{
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
              onClick={() => window.open("https://github.com/hardikjain-sys/PayFlow/blob/main/README.md", "_blank")}
              >Read this to know how to use it</b></p>
              <Subscriptions
                onSubscribe={subscribe}
                onCancel={cancelSub}
                isSubscribed={isSubscribed}
                approved={approved}
              />

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button onClick={() => window.open("https://merchantaccesscheck.netlify.app/", "_blank")} style={actionBtn}>
                    Access with subscriptions
                  </button>
                  <button onClick={() => window.open("https://github.com/hardikjain-sys/PayFlow/", "_blank")} style={actionBtn}>
                    Github
                  </button>
                </div>

              
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button onClick={() => navigate("/merchant/netflix")} style={actionBtn}>
                    Netflix Data
                  </button>
                  <button onClick={() => navigate("/merchant/youtube")} style={actionBtn}>
                    YouTube Data
                  </button>
                  <button onClick={() => navigate("/merchant/spotify")} style={actionBtn}>
                    Spotify Data
                  </button>
                </div>
              </div>

              <p style={{ opacity: 0.7, marginTop: "16px" }}>
                <b>Next payment in:</b> Coming soon
              </p>

              <button
                onClick={logout}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "80px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )
      }
    />

    <Route path="/merchant/:name" element={<MerchantDashboard />} />
    
  </Routes>
);

}

export default App;
