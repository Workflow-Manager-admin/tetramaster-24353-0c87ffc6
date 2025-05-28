import React from 'react';
import './App.css';
import TetraMaster from './TetraMaster';

function App() {
  // Set super-compact navbar height
  const NAVBAR_HEIGHT = 36; // px

  return (
    <div
      className="app"
      style={{
        minHeight: "100vh",
        height: "100vh",
        width: "100vw",
        padding: 0,
        margin: 0,
        background: "var(--kavia-dark)",
        overflow: "hidden",
      }}
    >
      <nav
        className="navbar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          zIndex: 100,
          padding: 0,
          minHeight: NAVBAR_HEIGHT,
          height: NAVBAR_HEIGHT,
          lineHeight: `${NAVBAR_HEIGHT}px`,
          background: "var(--kavia-dark)",
          borderBottom: "1px solid var(--border-color)",
          margin: 0,
        }}
      >
        <div className="container" style={{ padding: 0, minHeight: 0, height: NAVBAR_HEIGHT, margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', height: NAVBAR_HEIGHT, margin: 0 }}>
            <div className="logo" style={{ margin: 0, padding: 0, fontSize: "1.06rem", height: NAVBAR_HEIGHT, display: 'flex', alignItems: 'center' }}>
              <span className="logo-symbol">*</span> KAVIA AI
            </div>
          </div>
        </div>
      </nav>
      {/* Game area: absolutely no whitespace above or around game, disables scroll */}
      <main
        style={{
          marginTop: NAVBAR_HEIGHT,
          padding: 0,
          minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          width: "100vw",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "var(--kavia-dark)",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <TetraMaster />
      </main>
    </div>
  );
}

export default App;