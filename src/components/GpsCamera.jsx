import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import Footer from "./Footer";

const GpsCamera = () => {
  const webcamRef = useRef(null);

  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================
  // GET LOCATION
  // ============================
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;

        setCoords({ lat, lng });
        setAccuracy(acc);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          setAddress(data.display_name || "Unknown location");
        } catch {
          setAddress("Address unavailable");
        }

        setLoading(false);
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // ============================
  // TEXT WRAP
  // ============================
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    if (!text) return y;

    const words = text.split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, y);
    return y + lineHeight;
  };

  // ============================
  // CAPTURE
  // ============================
const capture = () => {
  if (!webcamRef.current) return;

  const video = webcamRef.current.video;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(video, 0, 0, width, height);

  const padding = width * 0.04;

  // SAFE font sizes (capped)
  const titleSize = Math.min(width * 0.04, 70);
  const textSize = Math.min(width * 0.028, 45);
  const smallSize = Math.min(width * 0.025, 38);

  ctx.fillStyle = "#ffffff";

  let lines = [];

  const now = new Date();
  const isoTime = now.toLocaleTimeString();
  const epoch = now;

  lines.push(address?.split(",")[0] || "Location");
  lines.push(address);
  lines.push(`Lat: ${coords?.lat?.toFixed(6)}  |  Lng: ${coords?.lng?.toFixed(6)}`);
  lines.push(`GPS Accuracy: ±${accuracy?.toFixed(2)} meters`);
  lines.push(`SECURE-TIME: ${isoTime}`);
  lines.push(`Date: ${epoch}`);

  // CALCULATE OVERLAY HEIGHT DYNAMICALLY
  const lineSpacing = textSize + 12;
  const overlayHeight = padding * 2 + lineSpacing * lines.length + 20;

  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(0, height - overlayHeight, width, overlayHeight);

  ctx.fillStyle = "#ffffff";

  let currentY = height - overlayHeight + padding + titleSize;

  // TITLE
  ctx.font = `bold ${titleSize}px sans-serif`;
  ctx.fillText(lines[0], padding, currentY);

  currentY += lineSpacing;

  // REST OF TEXT
  ctx.font = `${textSize}px sans-serif`;

  for (let i = 1; i < lines.length; i++) {
    ctx.fillText(lines[i], padding, currentY);
    currentY += lineSpacing;
  }

  const image = canvas.toDataURL("image/jpeg", 1);
  const link = document.createElement("a");
  link.href = image;
  link.download = `gov-gps-photo-${Date.now()}.jpg`;
  link.click();
};


return (
  <div
    style={{
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      backgroundColor: "black",
      fontFamily: "system-ui, sans-serif",
    }}
  >
    {/* CAMERA */}
    <Webcam
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      screenshotQuality={1}
      videoConstraints={{
        facingMode: { ideal: "environment" },
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />

    {/* TOP HEADER */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "14px 16px",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        fontWeight: "600",
        fontSize: "14px",
        boxSizing: "border-box",
      }}
    >

      {/* TOP HEADER */}
<div
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: "14px 16px",
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(8px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
    boxSizing: "border-box",
  }}
>
  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
    <span>Pro F-GPS CAMERA</span>
    <span
      style={{
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        background: "rgba(0,180,0,0.8)",
        whiteSpace: "nowrap",
      }}
    >
      READY
    </span>
  </div>

  {/* Version + Credit */}
  <div
    style={{
      marginTop: "4px",
      fontSize: "11px",
      opacity: 0.85,
      fontWeight: "400",
    }}
  >
    Version 1.0.19 • Designed & Developed by Fahad
  </div>
</div>

      <span>Pro F-GPS CAMERA</span>

      <span
        style={{
          padding: "5px 10px",
          borderRadius: "20px",
          fontSize: "11px",
          background: error
            ? "rgba(255,0,0,0.7)"
            : "rgba(0,180,0,0.8)",
          whiteSpace: "nowrap",
        }}
      >
        {error ? "GPS ERROR" : "GPS LIVE"}
      </span>
    </div>

    {/* GPS INFO CENTER BADGE */}
    {/* {!loading && !error && coords && (
      <div
        style={{
          position: "absolute",
          top: "70px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.65)",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: "12px",
          fontSize: "12px",
          textAlign: "center",
          backdropFilter: "blur(6px)",
          maxWidth: "90%",
        }}
      >
        <div>
          Lat: {coords.lat.toFixed(6)} | Lng: {coords.lng.toFixed(6)}
        </div>
        <div>Accuracy: ±{accuracy?.toFixed(1)}m</div>
      </div>
    )} */}

    {/* BOTTOM GRADIENT + BUTTON */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "160px",
        background:
          "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingBottom: "35px",
      }}
    >
      <div
        onClick={capture}
        style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          border: "4px solid white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 0 25px rgba(0,0,0,0.6)",
          marginBottom:"60px"
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "#1e88e5",
          }}
        />
      </div>
    </div>
    <div
  style={{
    position: "absolute",
    bottom: "50px",
    right: "15px",
    color: "rgba(255,255,255,0.7)",
    fontSize: "11px",
    fontWeight: "500",
    letterSpacing: "0.5px",
    textShadow: "0 0 5px rgba(0,0,0,0.6)",
    fontSize: "10px",
textTransform: "uppercase",
letterSpacing: "1px",


  }}
>
  Designed & Developed by Fahad
</div>

  </div>
);


};

export default GpsCamera;
