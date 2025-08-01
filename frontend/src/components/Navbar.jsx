import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Upload, FileText, Home } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/history', icon: FileText, label: 'History' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <BarChart3 size={24} />
        <span>Excel Analytics</span>
      </div>
      
      <div className="navbar-menu">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`navbar-item ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
