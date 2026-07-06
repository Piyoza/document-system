import { Link, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "250px",
          background: "#111827",
          color: "white",
          padding: "25px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2>📄 Document System</h2>
          <hr />

          <p>
            <Link style={linkStyle} to="/dashboard">
              📊 Dashboard
            </Link>
          </p>

         {user?.role !== "finance" && (
  <p>
    <Link style={linkStyle} to="/documents">
      📁 Documents
    </Link>
  </p>
)}

          <p>
            <Link style={linkStyle} to="/upload">
              📤 Upload
            </Link>
          </p>

          {/* Admin Only */}
          {user?.role === "admin" && (
            <>
              <p>
                <Link style={linkStyle} to="/admin">
                  👤 Admin Dashboard
                </Link>
              </p>

              <p>
                <Link style={linkStyle} to="/admin/users">
                  👥 User Management
                </Link>
              </p>
            </>
          )}

          {/* Manager Only */}
          {user?.role === "manager" && (
            <p>
              <Link style={linkStyle} to="/manager">
                👔 Manager Dashboard
              </Link>
            </p>
          )}

          {/* Finance Only */}
          {user?.role === "finance" && (
            <p>
              <Link style={linkStyle} to="/finance">
                💰 Finance Dashboard
              </Link>
            </p>
          )}

          {/* Admin, Manager and Finance */}
          {["admin", "manager", "finance"].includes(user?.role) && (
            <p>
              <Link style={linkStyle} to="/export-report">
                📥 Export Reports
              </Link>
            </p>
          )}
        </div>

        <button
          onClick={logout}
          style={{
            padding: "12px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🚪 Logout
        </button>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "30px",
          background: "#f3f4f6",
        }}
      >
        {children}
      </main>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "18px",
};

export default Layout;