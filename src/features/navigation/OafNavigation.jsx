// src/features/navigation/OafNavigation.jsx
import { useEffect, useState } from "react";
import { useOaf } from "../oaf/useOaf";

// We import client functions directly for diagnostics
import { getUserContext, getPageContext, oafEvents } from "../oaf/oafClient";

export default function OafNavigation() {
  const [input, setInput] = useState("/purchase-orders");
  const [log, setLog] = useState("Ready.");
  const { oafNavigatePath } = useOaf();

  const append = (line) =>
    setLog((prev) => (prev ? `${prev}\n${line}` : line));

  // Subscribe to OAF events (some hosts emit errors/info via events)
  useEffect(() => {
    const ev = oafEvents && typeof oafEvents === "function" ? oafEvents() : null;
    const handler = (evt) => {
      console.log("[OAF EVENT]", evt?.type || evt, evt);
      append(`[OAF EVENT] ${evt?.type || "message"} ${JSON.stringify(evt)}`);
    };

    if (ev && ev.on) {
      ev.on("error", handler);
      ev.on("oafError", handler);
      ev.on("message", handler);
      ev.on("subscribedAttributeResponse", handler);
    }

    return () => {
      if (ev && ev.off) {
        ev.off("error", handler);
        ev.off("oafError", handler);
        ev.off("message", handler);
        ev.off("subscribedAttributeResponse", handler);
      }
    };
  }, []);

  // --- Diagnostics button action ---
  const runDiagnostics = async () => {
    setLog("Running diagnostics…");

    try {
      const uc = await getUserContext();
      append("getUserContext:");
      append(JSON.stringify(uc, null, 2));
    } catch (e) {
      append("getUserContext threw:");
      append(String(e?.message || e));
    }

    try {
      const pc = await getPageContext();
      append("getPageContext:");
      append(JSON.stringify(pc, null, 2));
    } catch (e) {
      append("getPageContext threw:");
      append(String(e?.message || e));
    }
  };

  // --- Navigate button action ---
  const handleNavigate = async () => {
    setLog(`Navigating to: ${input}`);
    const resp = await oafNavigatePath(input);
    append("navigateToPath response:");
    append(JSON.stringify(resp, null, 2));
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>OAF Navigation</h3>

      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="Enter Coupa path (e.g., /purchase-orders)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button style={styles.button} onClick={handleNavigate}>
          Navigate to Path
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button style={styles.buttonGhost} onClick={runDiagnostics}>
          Run Diagnostics (getUserContext & getPageContext)
        </button>
      </div>

      <textarea
        readOnly
        value={log}
        style={styles.log}
        aria-label="Diagnostics log"
      />
    </div>
  );
}

const styles = {
  card: {
    padding: 16,
    background: "#fff",
    border: "1px solid #e6e8eb",
    borderRadius: 8,
  },
  title: { margin: 0, marginBottom: 12 },
  row: { display: "flex", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    padding: "8px 10px",
    border: "1px solid #c9cdd2",
    borderRadius: 6,
  },
  button: {
    padding: "8px 12px",
    background: "#0d6efd",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  buttonGhost: {
    padding: "8px 12px",
    background: "transparent",
    color: "#0d6efd",
    border: "1px solid #0d6efd",
    borderRadius: 6,
    cursor: "pointer",
  },
  log: {
    width: "100%",
    height: 200,
    marginTop: 12,
    padding: 10,
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontFamily: "monospace",
    fontSize: 12,
    whiteSpace: "pre",
  },
};
