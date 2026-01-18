import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";


const SUBSCRIPTION_CONTRACT_ADDRESS =
  "0x4Cef27DBd0988dF14FeeFA4E26b63c99f83e5c67";

const SUBSCRIPTION_ABI = [
  "function getSubscribers(address merchant) view returns (address[])",
  "function subscriptions(address user, address merchant) view returns (address,address,uint256,uint256,uint256,bool,bool)",
];

const merchantMap = {
  netflix: {
    name: "Netflix",
    address: "0xadc23c3B197DcbF5923Ed300789dB79AD30dB7c0",
  },
  youtube: {
    name: "YouTube",
    address: "0x7f3FD668ec4Ea4569F39c31AeE67F120328641d5",
  },
  spotify: {
    name: "Spotify",
    address: "0x72CfE14a9f6aC4f0BC4abD8988Aa327b4f8CAF62",
  },
};

function MerchantDashboard() {
  const { name } = useParams();
  const merchant = merchantMap[name];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    if (!merchant) return;

    const load = async () => {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddr = await signer.getAddress();
      setCurrentUser(userAddr.toLowerCase());

      const contract = new ethers.Contract(
        SUBSCRIPTION_CONTRACT_ADDRESS,
        SUBSCRIPTION_ABI,
        provider
      );

      const users = await contract.getSubscribers(merchant.address);

      const data = [];

      for (const u of users) {
        const sub = await contract.subscriptions(u, merchant.address);

        if (sub[6]) {
          data.push({
            user: u,
            amount: Number(sub[2]) / 1e6,
            interval: Number(sub[3]),
            lastPaid: Number(sub[4]),
            active: sub[5],
          });
        }
      }

      setRows(data);
      setLoading(false);
    };

    load();
  }, [merchant]);

  if (!merchant) {
    return <p style={{ color: "white" }}>Invalid merchant</p>;
  }

  if (loading) {
    return <p style={{ color: "white" }}>Loading merchant data...</p>;
  }


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        padding: "24px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2>{merchant.name} — Merchant Dashboard</h2>

      <p style={{ opacity: 0.7 }}>
        Total Subscribers: <b>{rows.length}</b>
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "16px",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #333" }}>
            <th align="left">User</th>
            <th align="left">Amount (USDC)</th>
            <th align="left">Last Payment</th>
            <th align="left">Status</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => {
            const isYou = r.user.toLowerCase() === currentUser;

            return (
              <tr
                key={i}
                style={{
                  borderBottom: "1px solid #222",
                  background: isYou ? "#1db95422" : "transparent",
                }}
              >
                <td style={{ padding: "8px", wordBreak: "break-all" }}>
                  {r.user}
                  {isYou && (
                    <span
                      style={{
                        marginLeft: "8px",
                        padding: "2px 6px",
                        fontSize: "12px",
                        background: "#1db954",
                        color: "#000",
                        borderRadius: "6px",
                      }}
                    >
                      YOU
                    </span>
                  )}
                </td>

                <td>{r.amount}</td>

                <td>
                  {r.lastPaid === 0
                    ? "—"
                    : new Date(r.lastPaid * 1000).toLocaleString()}
                </td>

                <td>
                  {r.active ? (
                    <span style={{ color: "#1db954" }}>Active</span>
                  ) : (
                    <span style={{ color: "#ff6b6b" }}>Cancelled</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MerchantDashboard;
