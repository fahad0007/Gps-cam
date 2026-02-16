import React, { useRef } from "react";
import Webcam from "react-webcam";

const GpsCamera = () => {
  const webcamRef = useRef(null);

  // ============================
  // CAPTURE (GPS ONLY WHEN CLICKED)
  // ============================
  const capture = () => {
    if (!webcamRef.current) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;

        let fullAddress = "Address unavailable";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          fullAddress = data.display_name || "Unknown location";
        } catch {}

        const video = webcamRef.current.video;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const width = video.videoWidth;
        const height = video.videoHeight;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(video, 0, 0, width, height);

        const padding = width * 0.04;
        const textSize = Math.min(width * 0.03, 50);
        const lineSpacing = textSize + 12;

        const now = new Date();

        const lines = [
          fullAddress?.split(",")[0] || "Location",
          fullAddress,
          `Lat: ${lat.toFixed(6)} | Lng: ${lng.toFixed(6)}`,
          `GPS Accuracy: ±${acc.toFixed(2)} meters`,
          `SECURE-TIME: ${now.toLocaleTimeString()}`,
          `Date: ${now.toLocaleDateString()}`,
        ];

        const overlayHeight =
          padding * 2 + lineSpacing * lines.length + 20;

        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, height - overlayHeight, width, overlayHeight);

        ctx.fillStyle = "#ffffff";
        ctx.font = `${textSize}px sans-serif`;

        let currentY = height - overlayHeight + padding + textSize;

        lines.forEach((line) => {
          ctx.fillText(line, padding, currentY);
          currentY += lineSpacing;
        });

        const image = canvas.toDataURL("image/jpeg", 1);
        const link = document.createElement("a");
        link.href = image;
        link.download = `gov-gps-photo-${Date.now()}.jpg`;
        link.click();
      },
      () => {
        alert("Location permission denied");
      },
      {
        enableHighAccuracy: false, // ⚡ Faster GPS
        timeout: 5000,
        maximumAge: 0,
      }
    );
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
    </div>
  );
};

export default GpsCamera;
