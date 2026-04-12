import React from "react";
import { Link } from "react-router-dom";

const SideBar = () => {

const items = [
{ name: "Dashboard", path: "/dashboard" },
{ name: "Browse Jobs", path: "/jobs" },
{ name: "My Applications", path: "/my-applications" },
{ name: "My Comments", path: "/my-comments" },
{ name: "Industries", path: "/industries" }
];

return (

<div className="sidebar">

<div className="sidebar-logo">
JobBoard
</div>

<nav>

{items.map((item) => (

<Link
key={item.path}
to={item.path}
className="sidebar-item"
>
{item.name}
</Link>

))}

</nav>

<div className="sidebar-footer">
<Link to="/logout">Logout</Link>
</div>

<style>{`

.sidebar{
width:240px;
height:100vh;
background:white;
border-right:1px solid #e5e7eb;
padding:25px;
display:flex;
flex-direction:column;
}

.sidebar-logo{
font-size:20px;
font-weight:700;
margin-bottom:30px;
}

.sidebar-item{
display:block;
padding:12px;
border-radius:8px;
margin-bottom:6px;
text-decoration:none;
color:#374151;
font-weight:500;
}

.sidebar-item:hover{
background:#f3f4f6;
}

.sidebar-footer{
margin-top:auto;
}

.sidebar-footer a{
display:block;
padding:12px;
background:#2563eb;
color:white;
text-align:center;
border-radius:8px;
text-decoration:none;
}

`}</style>

</div>

);
};

export default SideBar;