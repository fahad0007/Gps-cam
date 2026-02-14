import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import Footer from "./Footer";

const GpsCamera = () => {
  const webcamRef = useRef(null);

  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===============================
  // Get Location
  // ===============================
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCoords({ lat, lng });

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
      }
    );
  }, []);

  // ===============================
  // Wrap Text Helper
  // ===============================
  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    if (!text) return;
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
  };

  // ===============================
  // Capture
  // ===============================
  const capture = () => {
    if (!webcamRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) {
      alert("Camera not ready");
      return;
    }

    const img = new Image();
    img.src = screenshot;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const width = img.width;
      const height = width * 0.75; // 4:3 ratio

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      // Responsive sizing
      const padding = Math.max(width * 0.04, 12);
      const overlayHeight = Math.max(height * 0.38, 180);

      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, height - overlayHeight, width, overlayHeight);

      ctx.fillStyle = "#ffffff";

      const titleSize = Math.min(Math.max(width * 0.05, 18), 42);
      const textSize = Math.min(Math.max(width * 0.035, 14), 28);
      const smallSize = Math.min(Math.max(width * 0.03, 12), 22);

      let currentY = height - overlayHeight + padding + titleSize;

      // City
      ctx.font = `bold ${titleSize}px sans-serif`;
      ctx.fillText(
        address?.split(",")[0] || "Location",
        padding,
        currentY
      );

      // Address
      ctx.font = `${textSize}px sans-serif`;
      currentY += 15;
      wrapText(
        ctx,
        address,
        padding,
        currentY + textSize,
        width - padding * 2,
        textSize + 6
      );

      // Bottom Info
      ctx.font = `${smallSize}px sans-serif`;

      ctx.fillText(
        `Lat: ${coords?.lat?.toFixed(6) || "-"}`,
        padding,
        height - padding - 40
      );

      ctx.fillText(
        `Lng: ${coords?.lng?.toFixed(6) || "-"}`,
        padding,
        height - padding - 20
      );

      ctx.fillText(
        new Date().toLocaleString(),
        padding,
        height - padding - 60
      );

      // Download
      const image = canvas.toDataURL("image/jpeg", 1);
      const link = document.createElement("a");
      link.href = image;
      link.download = `gps-photo-${Date.now()}.jpg`;
      link.click();
    };
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>GPS Camera</h2>

      {loading && <p>Getting location...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: { ideal: "environment" }
        }}
        style={styles.webcam}
      />

      <button onClick={capture} style={styles.button}>
        Capture Photo
      </button>
      <Footer/>
    </div>
  );
};

// ===============================
// Responsive Styles
// ===============================
const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    maxWidth: "600px",
    margin: "auto",
  },
  title: {
    marginBottom: "15px",
  },
  webcam: {
    width: "100%",
    aspectRatio: "4 / 3",
    objectFit: "cover",
    borderRadius: "12px",
  },
  button: {
    marginTop: "15px",
    padding: "12px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
  },
};

export default GpsCamera;
