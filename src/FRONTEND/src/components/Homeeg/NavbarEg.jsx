import './navbareg.css'
import logo from "./logo.png"
import { NavLink,Link } from 'react-router-dom'

const NavbarEg = ({ className = "" }) => {
    return (
        <header className={`modern-navbar ${className}`}>
            <div className="navbar-content">
                <div className="navbar-logo">
                    <NavLink to={'/'}>
                        <img src={logo} alt="logo" />
                    </NavLink>
                </div>
                <nav className="navbar-links">
                    <NavLink to={'/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
                    <NavLink to={'/about'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>About Us</NavLink>
                    <NavLink to={'/contact'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Contact Us</NavLink>
                </nav>
                <div className="navbar-actions">
                    <Link to={'/start'}>
                        <button className="navbar-btn" role="button">Log In</button>
                    </Link>
                    <Link to={'/register'}>
                        <button className="navbar-btn primary" role="button">Get Started</button>
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default NavbarEg