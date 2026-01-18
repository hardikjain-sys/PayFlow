import { useEffect, useState } from "react";

function Subscriptions({ onSubscribe, onCancel, isSubscribed, approved }) {
  const merchants = [
    {
      id: 1,
      name: "Netflix",
      price: "0.5",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png",
      address: "0xadc23c3B197DcbF5923Ed300789dB79AD30dB7c0",
    },
    {
      id: 2,
      name: "YouTube",
      price: "0.3",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/YouTube_2024.svg",
      address: "0x7f3FD668ec4Ea4569F39c31AeE67F120328641d5",
    },
    {
      id: 3,
      name: "Spotify",
      price: "0.4",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
      address: "0x72CfE14a9f6aC4f0BC4abD8988Aa327b4f8CAF62",
    },
  ];

  const [activeSubs, setActiveSubs] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const refreshStatus = async () => {
    const status = {};
    for (const m of merchants) {
      status[m.id] = await isSubscribed(m.address);
    }
    setActiveSubs(status);
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleSubscribe = async (m) => {
    if (!approved) {
      alert("Approve USDC first");
      return;
    }

    const already = await isSubscribed(m.address);
    if (already) {
      alert("Already subscribed");
      return;
    }

    try {
      setLoadingId(m.id);
      await onSubscribe(m.address, m.price);
      await refreshStatus();
    } catch (e) {
      console.error(e);
      alert("Transaction failed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (m) => {
    const already = await isSubscribed(m.address);
    if (!already) {
      alert("Subscription already cancelled");
      return;
    }

    try {
      setLoadingId(m.id);
      await onCancel(m.address);
      await refreshStatus();
    } catch (e) {
      console.error(e);
      alert("Transaction failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <h3>Subscriptions</h3>

      {merchants.map((m) => {
        const isActive = activeSubs[m.id];
        const isLoading = loadingId === m.id;

        return (
          <div
            key={m.id}
            style={{
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "12px",
              marginTop: "12px",
              opacity: !approved && !isActive ? 0.6 : 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src={m.logo} alt={m.name} style={{ width: 32 }} />
              <b>{m.name}</b>
            </div>

            <p>{m.price} USDC/2 minutes (monthly in production)</p>

            {isActive ? (
              <button
                disabled={isLoading}
                onClick={() => handleCancel(m)}
                style={{
                    marginTop: "10px", width: "100%", display: "inline", padding: "10px", borderRadius: "80px", border: "none", background: "#ff6b6b", fontWeight: "500"  
                }}
              >
                {isLoading ? "Cancelling..." : "Cancel"}
              </button>
            ) : (
              <button
                disabled={!approved || isLoading}
                onClick={() => handleSubscribe(m)}
                style={{
                  cursor: approved ? "pointer" : "not-allowed",
                    marginTop: "10px", width: "100%", display: "inline", padding: "10px", borderRadius: "80px", border: "none", background: "#1db954", fontWeight: "500"               }}
              >
                {isLoading
                  ? "Processing..."
                  : approved
                  ? "Subscribe"
                  : "Approve USDC first"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Subscriptions;
