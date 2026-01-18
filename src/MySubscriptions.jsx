function MySubscriptions({ merchants, subscribed }) {
  const active = merchants.filter(m => subscribed.includes(m.id));

  if (active.length === 0) {
    return (
      <div style={{ marginTop: "32px" }}>
        <h3>My Subscriptions</h3>
        <p>No active subscriptions</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "32px" }}>
      <h3>My Subscriptions</h3>

      {active.map((m) => (
        <div
          key={m.id}
          style={{
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "12px",
            marginTop: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={m.logo} alt={m.name} style={{ width: 32, height: 32 }} />
            <b>{m.name}</b>
          </div>

          <p>{m.price}</p>
          <p>Status: Active</p>
        </div>
      ))}
    </div>
  );
}

export default MySubscriptions;
