"use client";
import { useState } from "react";
import Supervise from "./Supervise";
import Unsupervise from "./Unsupervise";

export default function Home() {
  const [tab, setTab] = useState("home");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav className="navbar">
        <div className="nav-pill">
          <button
            className={`nav-item ${tab === "supervise" ? "active" : ""}`}
            onClick={() => setTab("supervise")}
          >
            Supervise
          </button>
          <button
            className={`nav-item ${tab === "home" ? "active" : ""}`}
            onClick={() => setTab("home")}
          >
            Home
          </button>
          <button
            className={`nav-item ${tab === "unsupervise" ? "active" : ""}`}
            onClick={() => setTab("unsupervise")}
          >
            Unsupervise
          </button>
        </div>
      </nav>

      <div className="content">
        {tab === "home" && (
          <div className="home-cards">
            <div className="card">
              <h2>Supervise</h2>
            </div>
            <div className="card">
              <h2>Unsupervise</h2>
            </div>
          </div>
        )}

        {tab === "supervise" && (
          <Supervise />
        )}

        {tab === "unsupervise" && (
          <Unsupervise />
        )}
      </div>
    </div>
  );
}
