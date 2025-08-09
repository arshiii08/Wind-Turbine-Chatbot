import React, { useState } from "react";
import { login } from "../api";

interface LoginFormProps {
  onLogin: (jwt: string) => void;
  onSwitch: (view: "login" | "signup" | "chat") => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      onLogin(res.data.access_token)
      localStorage.setItem("token", res.data.access_token);
      onLogin();
    } catch (err) {
      alert("❌ Login failed. Please check your credentials.");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <h2 className="text-xl font-bold">Log In</h2>
      <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border px-3 py-2 w-full" />
      <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border px-3 py-2 w-full" />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Log In</button>
      <p className="cursor-pointer text-blue-600" onClick={() => onSwitch("signup")}>Don't have an account? Sign up</p>
    </form>
  );
};

export default LoginForm;
