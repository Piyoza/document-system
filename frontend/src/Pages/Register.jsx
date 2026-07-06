import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleRegister(e) {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://worker.sfundo-xulu-digifycx.workers.dev/api/register",
        form
      );

      alert(res.data.message);

      navigate("/");
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message || "Registration failed."
      );
    }
  }

  return (
  <div className="register-page">
    <div className="register-card">

      <h1> Create Account</h1>

      <p>Register to access the Document Management System</p>

      <form className="register-form" onSubmit={handleRegister}>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="user"> User</option>
          <option value="manager"> Manager</option>
          <option value="finance"> Finance</option>
        </select>

        <button
          type="submit"
          className="register-btn"
        >
          Create Account
        </button>

      </form>

      <div className="login-link">
        Already have an account?{" "}
        <Link to="/">Login</Link>
      </div>

    </div>
  </div>
);
}