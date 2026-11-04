import { useState } from "react";
import { setStatus } from "../api";

const FACILITY_TYPES = ["lift", "restroom", "food"];

export default function AdminPanel({ nodes, onChanged }) {
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState("");

  const facilities = nodes.filter((n) => FACILITY_TYPES.includes(n.category));

  const toggle = async (n) => {
    setMsg("");
    try {
      await setStatus(n.code, !n.is_active, key);
      await onChanged();
      setMsg(`${n.name_en} is now ${n.is_active ? "OUT OF SERVICE" : "active"}`);
    } catch (e) {
      setMsg(e.response && e.response.status === 401 ? "Wrong admin key" : "Update failed");
    }
  };

  return (
    <div style={{ border: "2px solid #e65100", borderRadius: 8, padding: 12, marginTop: 20 }}>
      <h3>🛠 Admin panel (station staff)</h3>
      <label>Admin key: </label>
      <input type="password" value={key} onChange={(e) => setKey(e.target.value)} />

      <table style={{ marginTop: 10, borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr><th align="left">Facility</th><th align="left">Status</th><th></th></tr>
        </thead>
        <tbody>
          {facilities.map((n) => (
            <tr key={n.code}>
              <td>{n.name_en}</td>
              <td style={{ color: n.is_active ? "green" : "#e65100" }}>
                {n.is_active ? "Active" : "Out of service"}
              </td>
              <td>
                <button onClick={() => toggle(n)}>
                  {n.is_active ? "Mark out of service" : "Mark active"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {msg && <p><b>{msg}</b></p>}
    </div>
  );
}