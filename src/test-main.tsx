// src/test-main.tsx
import React from "react";
import { createRoot } from "react-dom/client";

const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Minimal React Test</h1>
      <p>This is a minimal React app without Redux, Router, or any complex dependencies.</p>
      <button onClick={() => alert('Button clicked!')}>Test Button</button>
    </div>
  );
};

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

const root = createRoot(container);
root.render(<TestApp />);
