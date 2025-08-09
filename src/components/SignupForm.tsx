import React, { useState } from "react";
import { signup } from "../api";

interface SignupFormProps {
  onSwitch: (view: "login" | "signup" | "chat") => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password);
      alert("✅ Signup successful! You can now log in.");
      onSwitch("login");
    } catch (err: any) {
      alert(err.response?.data?.detail || "❌ Signup failed.");
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <h2 className="text-xl font-bold">Sign Up</h2>
      <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border px-3 py-2 w-full" />
      <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border px-3 py-2 w-full" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Account</button>
      <p className="cursor-pointer text-blue-600" onClick={() => onSwitch("login")}>Already have an account? Log in</p>
    </form>
  );
};

export default SignupForm;
