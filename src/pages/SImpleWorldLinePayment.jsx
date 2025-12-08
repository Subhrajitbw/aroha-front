// src/pages/PaynimoTest.jsx
import React, { useEffect, useState, useCallback } from "react";

// Change this to match the active tunnel
const API_BASE = "https://f35f4ef2ab04.ngrok-free.app";

function useScript(src) {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  useEffect(() => {
    if (!src) return;
    let script = document.querySelector(`script[src="${src}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.type = "text/javascript";
      setStatus("loading");
      script.onload = () => setStatus("ready");
      script.onerror = () => setStatus("error");
      document.body.appendChild(script);
    } else {
      setStatus("ready");
    }
  }, [src]);
  return status;
}

export default function SimpleWorldlinePayment() {
  // Load jQuery and checkout.js exactly as in docs
  const jqStatus = useScript("https://www.paynimo.com/paynimocheckout/client/lib/jquery.min.js");
  const ckStatus = useScript("https://www.paynimo.com/paynimocheckout/server/lib/checkout.js");

  const [order, setOrder] = useState(null); // { txnId, amount, token, merchantId, currency, deviceId }
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);

  const addLog = (m) => setLog((x) => [...x, `[${new Date().toLocaleTimeString()}] ${m}`]);

  // Response handler as per Paynimo docs: statusCode 0300 success, 0398 initiated
  const handleResponse = useCallback((res) => {
    addLog(`responseHandler: ${JSON.stringify(res)}`);
    const code = res?.paymentMethod?.paymentTransaction?.statusCode;
    if (code === "0300") {
      alert("Payment Success (0300)");
    } else if (code === "0398") {
      alert("Payment Initiated (0398)");
    } else {
      const msg = res?.paymentMethod?.paymentTransaction?.statusMessage || "Payment failed or aborted";
      alert(`Payment Error: ${msg}`);
    }
  }, []);

  const createOrder = async () => {
    setBusy(true);
    addLog("Creating order/token via backend...");
    try {
      const r = await fetch(`${API_BASE}/api/paynimo/create`, { method: "POST" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setOrder(data);
      addLog(`Order created: ${JSON.stringify(data)}`);
    } catch (e) {
      addLog(`Create failed: ${e.message}`);
      alert("Failed to create order/token");
    } finally {
      setBusy(false);
    }
  };

  const payNow = () => {
    // Validate libraries and order
    if (jqStatus !== "ready" || ckStatus !== "ready") {
      addLog(`Libraries not ready. jQuery: ${jqStatus}, checkout.js: ${ckStatus}`);
      alert("Payment library not ready yet");
      return;
    }
    if (!window.$ || !window.$.pnCheckout) {
      addLog("window.$.pnCheckout is undefined");
      alert("pnCheckout missing");
      return;
    }
    if (!order?.token || !order?.txnId || !order?.merchantId) {
      addLog("Order/token missing");
      alert("Create order first");
      return;
    }

    // Build the request per docs
    const reqJson = {
      features: {
        enableAbortResponse: true,
        enableExpressPay: false,
        enableInstrumentDeRegistration: false,
        enableMerTxnDetails: true,
        showPGResponseMsg: true
      },
      consumerData: {
        deviceId: order.deviceId || "WEBSH2",
        token: order.token, // server-generated HASH
        returnUrl: `${API_BASE}/api/paynimo/return`, // backend returnUrl to receive msg
        responseHandler: handleResponse,
        paymentMode: "all",
        merchantLogoUrl: "",

        merchantId: order.merchantId,
        currency: order.currency || "INR",
        txnId: order.txnId,

        items: [{ itemId: "test", amount: String(order.amount || "1"), comAmt: "0" }],

        // Optional: embed instead of popup to avoid blockers
        // checkoutElement: "#checkoutElement"
      }
    };

    addLog("Calling $.pnCheckout...");
    try {
      window.$.pnCheckout(reqJson);
      addLog("pnCheckout invoked");
    } catch (e) {
      addLog(`pnCheckout error: ${e.message}`);
      alert("Failed to open checkout");
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "system-ui" }}>
      <h3>Worldline Paynimo Test</h3>
      <p>Scripts — jQuery: {jqStatus}, checkout.js: {ckStatus}</p>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={createOrder} disabled={busy}>Create Test Order</button>
        <button onClick={payNow} disabled={!order || busy}>Pay Now</button>
      </div>

      {/* Optional container if using checkoutElement */}
      {/* <div id="checkoutElement" style={{ marginTop: 16 }} /> */}

      <div style={{ marginTop: 16 }}>
        {order && (
          <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 8 }}>
            {JSON.stringify(order, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Logs</strong>
        <pre style={{ whiteSpace: "pre-wrap", background: "#000", color: "#0f0", padding: 8, minHeight: 140 }}>
          {log.join("\n")}
        </pre>
      </div>
    </div>
  );
}
