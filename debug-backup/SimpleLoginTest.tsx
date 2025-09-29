// src/app/pages/auth/SimpleLoginTest.tsx
import React from "react";

const SimpleLoginTest: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Simple Login Test</h1>
      <p>If you can see this, the basic routing works.</p>
      <form>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email:</label>
          <input type="email" style={{ marginLeft: '0.5rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password:</label>
          <input type="password" style={{ marginLeft: '0.5rem' }} />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default SimpleLoginTest;
