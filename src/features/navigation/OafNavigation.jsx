// src/features/navigation/OafNavigation.jsx
import { useState } from "react";
import { useOaf } from "../oaf/useOaf";

export default function OafNavigation() {
  const [input, setInput] = useState("");
  const { oafNavigatePath } = useOaf();

  const handleClick = async () => {
    if (!input.trim()) return;
    await oafNavigatePath(input);
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>OAF Navigation</h3>

      <input
        style={styles.input}
        placeholder="Enter Coupa path (e.g., /requisition_headers)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        style={styles.button}
        onClick={handleClick}
      >
        Navigate to Path
      </button>

      <div style={styles.help}>
        <p>Examples:</p>
        <ul>
          <li>/requisition_headers</li>
          <li>/order_headers/1</li>
          <li>quotes/requests</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  card: { padding: 20, background: "#fff", border: "1px solid #ddd", borderRadius: 8 },
  title: { marginBottom: 15 },
  input: { width: "100%", padding: 10, borderRadius: 4, border: "1px solid #bbb", marginBottom: 10 },
  button: { padding: "10px 16px", background: "#0d6efd", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer" },
  help: { fontSize: 12, marginTop: 10, opacity: 0.8 }
};