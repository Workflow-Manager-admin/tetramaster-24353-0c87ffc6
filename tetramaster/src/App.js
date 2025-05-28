import React from 'react';
import './App.css';
import TetraMaster from './TetraMaster';

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> KAVIA AI
            </div>
          </div>
        </div>
      </nav>
      {/* Main TetraMaster Game Area */}
      <main style={{ marginTop: 0, paddingTop: 60 }}>
        <TetraMaster />
      </main>
    </div>
  );
}

export default App;