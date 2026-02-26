import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { loginRequest } from "../api/api";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("seeded");
  const [error, setError] = useState("");
    const { setUser } = useAuth();
    const navigate = useNavigate();
    



  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const data = await loginRequest(email, password);

    login(data.token);
    setUser({ id: data.user.id, email: data.user.email });

    navigate("/");
  } catch (err: any) {
    setError(err.message);
  }
};

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}