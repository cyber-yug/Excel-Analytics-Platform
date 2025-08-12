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
      <nav className="navbar-bg">
        <div className="navbar-container">
          <div className="navbar-brand">
            <BarChart3 size={24} />
            <span>Excel Analytics</span>
          </div>
          <ul className="navbar-list">
            {navItems.map(({ path, icon: Icon, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`navbar-link${location.pathname === path ? ' navbar-link-active' : ''}`}
                >
                  <Icon size={20} className="navbar-link-icon" />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
  );
};

export default Navbar;
