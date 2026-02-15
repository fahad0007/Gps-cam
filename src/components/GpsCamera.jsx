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
    <div style={{ position: "fixed", width: "100%", height:"100vh" ,display:"flex", justifyContent:"center" }}>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        screenshotQuality={1}
        videoConstraints={{
          facingMode: { ideal: "environment" },
          aspectRatio: 4 / 3,
        }}
        style={{ position:"absolute",left:"-10px",width: "100%", height: "100%", objectFit: "cover" }}
      />

      <div style={{
        position: "absolute",
        top: 0,

        width: "100%",
        background: "rgba(0,0,0,0.6)",
        color: "white",
        textAlign: "center",
        padding: "12px",
        fontWeight: "bold",
        letterSpacing: "1px"
      }}>
        Pro F-GPS CAMERA
      </div>

      <div style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        padding: "20px",
        // background: "rgba(0,0,0,0.85)",
        display: "flex",
        justifyContent: "center"
      }}>
        <button
          onClick={capture}
          style={{
            marginBottom:"15px",
            width: "85px",
            height: "85px",
            borderRadius: "50%",
            border: "6px solid white",
            background: "#1e88e5",
            color: "white",
            fontWeight: "bold"
          }}
        >
          CAPTURE
        </button>
      </div>

    </div>
  );
};

export default GpsCamera;
