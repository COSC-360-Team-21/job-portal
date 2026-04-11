import PropTypes from 'prop-types';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import LoginForm from './components/LoginForm';
import SignUp from './components/SignUp';
import ApplicationForm from './components/ApplicationForm';

import JobListings from './pages/JobListings';
import JobSearch from './pages/JobSearch';
import MyApplications from './pages/MyApplications';
import JobDetail from './pages/JobDetail';
import Industries from './pages/Industries';

Placeholder.propTypes = { title: PropTypes.string.isRequired };
function Placeholder({ title }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>{title}</h2>
      <Link to="/">← Home</Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<><h1 style={{position:'absolute',width:'1px',height:'1px',padding:0,margin:'-1px',overflow:'hidden',clip:'rect(0,0,0,0)',whiteSpace:'nowrap',border:0}}>Job Portal</h1><Hero /></>} />
          <Route path="/login" element={<><Link to="/" style={{display:'inline-block',padding:'1rem 1.5rem',fontWeight:600,color:'#2563eb',textDecoration:'none'}}>← Home</Link><LoginForm /></>} />
          <Route path="/register" element={<><Link to="/" style={{display:'inline-block',padding:'1rem 1.5rem',fontWeight:600,color:'#2563eb',textDecoration:'none'}}>← Home</Link><SignUp /></>} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/search" element={<JobSearch />} />
          <Route path="/apply" element={<><Link to="/" style={{display:'inline-block',padding:'1rem 1.5rem',fontWeight:600,color:'#2563eb',textDecoration:'none'}}>← Home</Link><ApplicationForm /></>} />
          <Route path="/my-applications" element={<MyApplications />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </AuthProvider>
  );
}
