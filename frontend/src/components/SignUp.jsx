import React, { useState } from "react";
import { Link } from "react-router-dom";

const SignUp = () => {

const [role, setRole] = useState("seeker");

return (
<div className="signup-page">

<header className="top-header">
<div className="logo">
<span className="logo-icon">🧳</span>
JobBoard
</div>
</header>

<div className="signup-container">

<h1>Welcome to JobBoard</h1>
<p className="subtitle">Every Job on the market, Only for you</p>

<p className="role-label">I want to sign up as:</p>

<div className="role-toggle">
<button
className={role === "seeker" ? "active" : ""}
onClick={() => setRole("seeker")}
>
Job Seeker
</button>

<button
className={role === "employer" ? "active" : ""}
onClick={() => setRole("employer")}
>
Employer
</button>
</div>

<form className="signup-form">

<label>Name:</label>
<input type="text" placeholder="Enter your name" />

<label>Email:</label>
<input type="email" placeholder="name@company.com" />

<label>Password:</label>
<input type="password" placeholder="Enter your password" />

<label>Confirm Password:</label>
<input type="password" placeholder="Confirm your password" />

<button className="signup-btn">Sign Up</button>

</form>

<div className="divider">
<span>or</span>
</div>

<p className="login-link">
Already have an account? <Link to="/login">Login here</Link>
</p>

</div>

<style>{`

.signup-page{
background:#f6f8fb;
min-height:100vh;
font-family:system-ui;
}

.top-header{
background:white;
border-bottom:1px solid #ddd;
padding:18px 30px;
}

.logo{
font-weight:700;
font-size:20px;
display:flex;
align-items:center;
gap:8px;
}

.signup-container{
max-width:500px;
margin:auto;
padding-top:80px;
text-align:center;
}

h1{
font-size:36px;
margin-bottom:10px;
}

.subtitle{
color:#6b7280;
margin-bottom:30px;
}

.role-label{
margin-bottom:10px;
}

.role-toggle{
display:flex;
gap:15px;
justify-content:center;
margin-bottom:25px;
}

.role-toggle button{
padding:12px 24px;
border-radius:10px;
border:1px solid #ddd;
background:#f1f1f1;
cursor:pointer;
font-weight:500;
}

.role-toggle button.active{
background:linear-gradient(90deg,#2563eb,#1d4ed8);
color:white;
border:none;
}

.signup-form{
display:flex;
flex-direction:column;
gap:12px;
text-align:left;
}

.signup-form input{
padding:12px;
border-radius:8px;
border:1px solid #ddd;
background:#f5f5f5;
}

.signup-btn{
margin-top:10px;
padding:14px;
border:none;
border-radius:10px;
background:linear-gradient(90deg,#2563eb,#1d4ed8);
color:white;
font-size:16px;
cursor:pointer;
}

.divider{
margin:30px 0;
display:flex;
align-items:center;
justify-content:center;
color:#9ca3af;
}

.divider::before,
.divider::after{
content:"";
flex:1;
height:1px;
background:#e5e7eb;
margin:0 10px;
}

.login-link{
color:#6b7280;
}

.login-link a{
color:#2563eb;
font-weight:600;
}

`}</style>

</div>
);
};

export default SignUp;