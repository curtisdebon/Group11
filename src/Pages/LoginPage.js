import React from 'react';

function LoginPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login Page</h2>
      <input type="text" placeholder="Email" /><br /><br />
      <input type="password" placeholder="Password" /><br /><br />
      <button>Login</button>
    </div>
  );
}

export default LoginPage;
