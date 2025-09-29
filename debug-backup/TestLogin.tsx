// src/app/pages/auth/TestLogin.tsx
import React from "react";

const TestLogin: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Login Page</h1>
      <p>This is a minimal test page.</p>
      <p>If you can see this without browser freezing, the issue is not in routing.</p>
      <form>
        <div>
          <label>Email: </label>
          <input type="email" />
        </div>
        <br />
        <div>
          <label>Password: </label>
          <input type="password" />
        </div>
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default TestLogin;
