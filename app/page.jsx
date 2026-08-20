"use client";

import { useRef, useState } from "react";
import QRCode from "qrcode";
import { BrowserQRCodeReader } from "@zxing/browser";

const SAMPLE = JSON.stringify({ id: "user-42", name: "Nguyen Van A", ts: Date.now() }, null, 2);

export default function Page() {
  const [json, setJson] = useState(SAMPLE);
  const [png, setPng] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const video = useRef(null);
  const controls = useRef(null);

  async function gen() {
    setErr("");
    try {
      // validate trước khi gen, tránh QR chứa rác
      const payload = JSON.stringify(JSON.parse(json));
      setPng(await QRCode.toDataURL(payload, { width: 320, errorCorrectionLevel: "M" }));
    } catch (e) {
      setPng("");
      setErr("JSON không hợp lệ: " + e.message);
    }
  }

  function show(text) {
    setErr("");
    try {
      setOut(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      setOut(text); // ponytail: QR không phải JSON thì hiện raw
    }
  }

  async function decodeUrl(url) {
    setErr("");
    try {
      show((await new BrowserQRCodeReader().decodeFromImageUrl(url)).getText());
    } catch (e) {
      setOut("");
      setErr("Không đọc được QR: " + e.message);
    }
  }

  async function camera() {
    setErr("");
    controls.current?.stop();
    try {
      controls.current = await new BrowserQRCodeReader().decodeFromVideoDevice(
        undefined,
        video.current,
        (result) => {
          if (!result) return;
          show(result.getText());
          controls.current?.stop();
          controls.current = null;
        }
      );
    } catch (e) {
      setErr("Camera lỗi: " + e.message);
    }
  }

  return (
    <main>
      <h2>1. Generate</h2>
      <textarea rows={8} value={json} onChange={(e) => setJson(e.target.value)} style={{ width: "100%", fontFamily: "monospace" }} />
      <button onClick={gen}>Gen QR</button>
      {png && (
        <div>
          <img src={png} alt="qr" width={320} height={320} />
          <div>
            <a href={png} download="qr.png">Tải PNG</a>
          </div>
        </div>
      )}

      <h2>2. Scan</h2>
      <button onClick={() => decodeUrl(png)} disabled={!png}>Giải mã QR vừa gen</button>{" "}
      <button onClick={camera}>Quét bằng camera</button>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) decodeUrl(URL.createObjectURL(f));
          }}
        />
      </div>
      <video ref={video} style={{ width: "100%", maxWidth: 320 }} muted />

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {out && <pre style={{ background: "#f4f4f4", padding: "0.75rem", overflowX: "auto" }}>{out}</pre>}
    </main>
  );
}
