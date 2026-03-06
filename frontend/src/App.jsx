import PropTypes from 'prop-types';
import { Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import LoginForm from './components/LoginForm';

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<Placeholder title="Register" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
