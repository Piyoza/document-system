import {useState} from "react";
import {login} from "../api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Login.css";


function App(){

const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
const navigate = useNavigate();


async function handleLogin(e) {
  e.preventDefault();

  try {
    const result = await login(email, password);

    console.log("Login response:", result);

    if (result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      alert("Login successful");

      const role = result.user.role;

      if (role === "user") {
        navigate("/dashboard");
      } else if (role === "manager") {
        navigate("/manager");
      } else if (role === "finance") {
        navigate("/finance");
      } else if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      alert(result.message || "Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("Could not connect to server");
  }
}


return (

<div className="login-page">

<div className="login-card">

<h1> Document System</h1>

<p>Welcome Back</p>

<form className="login-form" onSubmit={handleLogin}>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
required
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>

<button className="login-btn">

Login

</button>

</form>

<div className="register-link">

Don't have an account?

{" "}

<Link to="/register">

Register

</Link>

</div>

</div>

</div>

);

}


export default App;