// src/features/navigation/OafNavigation.jsx
import { useEffect, useState } from "react";
import { useOaf } from "../oaf/useOaf";

export default function OafNavigation() {
  const [input, setInput] = useState("/requisition_headers");
  const [log, setLog] = useState("Ready.");
  const {
    oafNavigatePath,
    oafGetPageContext,
    // expose getUserContext via useOaf if you prefer; we'll call client directly for now:
  } = useOaf();

  // lazy import to avoid circulars
  const [client, setClient] = useState(null);
  useEffect(() => {
    import("../oaf/oafClient").then(mod => setClient(mod));
  }, []);

  const append = (line) => setLog((prev) => `${prev}\n${line}`);

  const doDiagnostics = async () => {
    setLog("Running diagnostics...");
    try {
      const userCtx = await client.getUserContext();
      append(`getUserContext: ${userCtx.status || "ok"}`);
      append(JSON.stringify(userCtx, null, 2));

      const pageCtx = await oafGetPageContext();
      append(`getPageContext: ${pageCtx.status || "ok"}`);
      append(JSON.stringify(pageCtx, null, 2));
    } catch (e) {
      append(`Diagnostics error: ${e?.message || e}`);
    }
  };

  const handleNavigate = async (path) => {
    setLog(`Navigating to ${path} ...`);
    const resp = await oafNavigatePath(path);
    append(`navigateToPath response: ${resp?.status || "unknown"}`);
    if (resp?.message) append(resp.message);
    if (resp?.rawError) append(JSON.stringify(resp.rawError, null, 2));
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>OAF Navigation</h3>

      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="Enter Coupa path"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button style={styles.button} onClick={() => handleNavigate(input)}>
          Navigate to Path
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Quick tests (from Coupa boilerplate):</strong>
        <div style={styles.testRow}>
          <button onClick={() => handleNavigate("/purchase-orders")} style={styles.testBtn}>
            /purchase-orders
          </button>
          <button onClick={() => handleNavigate("/suppliers/new")} style={styles.testBtn}>
            /suppliers/new
          </button>
          <button onClick={() => handleNavigate("/invoices?status=pending")} style={styles.testBtn}>
            /invoices?status=pending
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={doDiagnostics} style={styles.buttonGhost}>
          Run Diagnostics (connection & context)
        </button>
      </div>

      <textarea readOnly value={log} style={styles.log} />
    </div>
  );
}

const styles = {
  card: { padding: 16, background: "#fff", border: "1px solid #e6e8eb", borderRadius: 8 },
  title: { margin: 0, marginBottom: 12 },
  row: { display: "flex", gap: 8, alignItems: "center" },
  input: { flex: 1, padding: "8px 10px", border: "1px solid #c9cdd2", borderRadius: 6 },
  button: { padding: "8px 12px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  buttonGhost: { padding: "8px 12px", background: "transparent", color: "#0d6efd", border: "1px solid #0d6efd", borderRadius: 6, cursor: "pointer" },
  testRow: { display: "flex", gap: 8, marginTop: 6 },
  testBtn: { padding: "6px 10px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" },
  log: { width: "100%", height: 140, marginTop: 12, padding: 10, border: "1px solid #d1d5db", borderRadius: 6, fontFamily: "monospace", fontSize: 12, whiteSpace: "pre" },
};