import React from 'react';
import './App.css';
import TetraMaster from './TetraMaster';

function App() {
  return (
    <div className="app" style={{ minHeight: "100vh", padding: 0, margin: 0 }}>
      <nav className="navbar" style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 100, padding: "8px 0", minHeight: 0 }}>
        <div className="container" style={{ padding: 0, minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo" style={{ margin: 0, padding: 0 }}>
              <span className="logo-symbol">*</span> KAVIA AI
            </div>
          </div>
        </div>
      </nav>
      {/* Main TetraMaster Game Area */}
      <main
        style={{
          marginTop: 0,
          paddingTop: 0,
          minHeight: "0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "var(--kavia-dark)",
          boxSizing: "border-box"
        }}
      >
        <div style={{ height: 50 }} /> {/* small spacer to avoid overlap by navbar (navbar height is 40) */}
        <TetraMaster />
      </main>
    </div>
  );
}

export default App;