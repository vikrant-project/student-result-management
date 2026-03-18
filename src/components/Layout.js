import { Outlet, NavLink } from "react-router-dom";

function Layout({ onLogout }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span className="sidebar-title-icon">📚</span>
            SRMS
          </div>
        </div>

        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                data-testid="nav-dashboard"
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/students"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                data-testid="nav-students"
              >
                <span className="nav-icon">👥</span>
                Students
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/subjects"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                data-testid="nav-subjects"
              >
                <span className="nav-icon">📖</span>
                Subjects
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/results"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                data-testid="nav-results"
              >
                <span className="nav-icon">📝</span>
                Results
              </NavLink>
            </li>
          </ul>
        </nav>

        <button
          className="logout-btn"
          onClick={onLogout}
          data-testid="logout-btn"
        >
          <span>🚪</span>
          Logout
        </button>

        <div className="footer">
          <p>
            Developed by <span className="footer-highlight">Vikrant Rana</span>
          </p>
          <p>BCA Aspirant, Delhi</p>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
