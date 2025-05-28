import React from 'react';
import './App.css';
import TetraMaster from './TetraMaster';

function App() {
  // Determine navbar height (fully minimal for compact visual)
  const NAVBAR_HEIGHT = 36; // px (matching CSS below)

  return (
    <div
      className="app"
      style={{
        minHeight: "100vh",
        padding: 0,
        margin: 0,
        background: "var(--kavia-dark)",
      }}
    >
      <nav
        className="navbar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 100,
          padding: "0 0",
          minHeight: NAVBAR_HEIGHT,
          height: NAVBAR_HEIGHT,
          lineHeight: `${NAVBAR_HEIGHT}px`,
          background: "var(--kavia-dark)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="container" style={{ padding: 0, minHeight: 0, height: NAVBAR_HEIGHT }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', height: NAVBAR_HEIGHT }}>
            <div className="logo" style={{ margin: 0, padding: 0, fontSize: "1.06rem", height: NAVBAR_HEIGHT, display: 'flex', alignItems: 'center' }}>
              <span className="logo-symbol">*</span> KAVIA AI
            </div>
          </div>
        </div>
      </nav>
      {/* Main TetraMaster Game Area - minimized vertical and horizontal whitespace */}
      <main
        style={{
          marginTop: NAVBAR_HEIGHT, // right below navbar, no gap
          paddingTop: 0,
          paddingBottom: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100vw",
          background: "var(--kavia-dark)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* No extra spacers */}
        <TetraMaster />
      </main>
    </div>
  );
}

export default App;