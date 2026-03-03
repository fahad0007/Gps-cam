import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const GpsCamera = () => {
  const webcamRef = useRef(null);

  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const [gallery, setGallery] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // =============================
  // LOAD & SAVE GALLERY
  // =============================
  useEffect(() => {
    const saved = localStorage.getItem("fahad-gps-gallery");
    if (saved) setGallery(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("fahad-gps-gallery", JSON.stringify(gallery));
  }, [gallery]);

  // =============================
  // GET LOCATION
  // =============================
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
      },
      () => {
        setError("Location permission denied");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // =============================
  // SHARE FUNCTION
  // =============================
  const shareImage = async (image) => {
    try {
      if (navigator.share) {
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], "F-GPS.jpg", { type: "image/jpeg" });

        await navigator.share({
          files: [file],
          title: "F-GPS Camera Image",
          text: "Captured using Pro F-GPS Camera v1.0.19",
        });
      } else {
        alert("Sharing not supported on this device");
      }
    } catch (err) {
      console.log("Share failed:", err);
    }
  };

  // =============================
  // CAPTURE IMAGE
  // =============================
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
    const textSize = Math.min(width * 0.028, 45);
    const lineSpacing = textSize + 12;

    const now = new Date();

    const lines = [
      address,
      `Lat: ${coords?.lat?.toFixed(6)} | Lng: ${coords?.lng?.toFixed(6)}`,
      `Accuracy: ±${accuracy?.toFixed(2)} meters`,
      `Secure Time: ${now.toLocaleString()}`,
      `Date: ${now}`,
      `Version 2.1.01`,
      `Pro F-Gps by Fahad`,
    ];

    const overlayHeight = padding * 2 + lineSpacing * lines.length + 20;

    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, height - overlayHeight, width, overlayHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = `${textSize}px sans-serif`;

    let currentY = height - overlayHeight + padding + textSize;

    lines.forEach((line) => {
      ctx.fillText(line, padding, currentY);
      currentY += lineSpacing;
    });

    const image = canvas.toDataURL("image/jpeg", 0.95);

    setGallery((prev) => [image, ...prev]);

    const link = document.createElement("a");
    link.href = image;
    link.download = `F-GPS-${Date.now()}.jpg`;
    link.click();
  };

  const deletePhoto = (index) => {
    const updated = [...gallery];
    updated.splice(index, 1);
    setGallery(updated);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "black",
        overflow: "hidden",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* CAMERA */}
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: { ideal: "environment" } }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* HEADER */}
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
          color: "white",
        }}
      >
        <div>
          <div style={{ fontVariant: "small-caps" }}>
            Pro F-Gps Camera
          </div>
          <div style={{ fontSize: "11px", opacity: 0.8 }}>
            Version 2.1.01 • Designed & Developed by Fahad
          </div>
        </div>

        <span
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            fontSize: "11px",
            background: error
              ? "rgba(255,0,0,0.7)"
              : "rgba(0,180,0,0.8)",
          }}
        >
          {error ? "GPS ERROR" : "GPS LIVE"}
        </span>
      </div>

      {/* ACCURACY METER */}
      {accuracy && (
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "8px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "5px",
          }}
        >
          <div
            style={{
              width: `${Math.max(5, 100 - accuracy)}%`,
              height: "100%",
              background: "#00ff88",
              borderRadius: "5px",
            }}
          />
        </div>
      )}

      {/* BOTTOM CONTROLS */}
      <div
        style={{
          position: "absolute",
          bottom: "60px",
          left: "40%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Gallery Button */}
        <button
          onClick={() => setShowGallery(true)}
          style={{
            fontSize:"40px",
            width: "65px",
            height: "65px",
            borderRadius: "12px",
            border: "none",
            background: "rgba(0,0,0,0.6)",
            color: "white",
            cursor: "pointer",
          }}
        >
          📁
        </button>

        {/* Capture Button */}
        <button type="button"
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
          }}
        >
          <button type="button"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#1e88e5",
              border: "none",
              cursor: "pointer"
            }}
          /> 
        </button>
      </div>

      {/* GALLERY SCREEN */}
      {showGallery && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "black",
            zIndex: 9999,
            overflowY: "auto",
            padding: "20px",
          }}
        >
          <button
            onClick={() => setShowGallery(false)}
            style={{
              position: "fixed",
              top: "15px",
              right: "20px",
              background: "red",
              color: "white",
              border: "none",
              padding: "8px 12px",
            }}
          >
            Close
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))",
              gap: "10px",
              marginTop: "60px",
            }}
          >
            {gallery.map((img, index) => (
              <div key={index}>
                <img
                  src={img}
                  alt="captured"
                  style={{ width: "100%", borderRadius: "6px" }}
                  onClick={() => setSelectedImage(img)}
                />

                <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                  <button
                    onClick={() => shareImage(img)}
                    style={{
                      flex: 1,
                      background: "#1e88e5",
                      color: "white",
                      border: "none",
                      padding: "6px",
                    }}
                  >
                    Share
                  </button>

                  <button
                    onClick={() => deletePhoto(index)}
                    style={{
                      flex: 1,
                      background: "darkred",
                      color: "white",
                      border: "none",
                      padding: "6px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULLSCREEN VIEW */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
          }}
        >
          <img
            src={selectedImage}
            alt="full"
            style={{
              maxWidth: "95%",
              maxHeight: "95%",
              borderRadius: "10px",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default GpsCamera;