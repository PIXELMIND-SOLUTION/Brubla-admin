import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const showAlert = (icon, title, text, timer) => {
    Swal.fire({
      icon,
      title,
      text,
      timer,
      showConfirmButton: false,
      background: "#071236",
      color: "#FFFFFF",
      customClass: {
        popup: "rounded-2xl",
      },
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validation
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // API Call
      const response = await axios.post(
        "http://31.97.228.17:4077/api/admin/login",
        {
          email: email,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if login was successful based on response structure
      if (response.data && response.data.success === true && response.data.token) {
        // Store token and admin data
        sessionStorage.setItem("adminToken", response.data.token);
        
        if (response.data.admin) {
          sessionStorage.setItem("admin", JSON.stringify(response.data.admin));
        }

        showAlert(
          "success",
          "Welcome Admin!",
          response.data.message || "Login successful. Redirecting to dashboard...",
          1500
        );

        // Redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setError(response.data?.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError("Invalid email or password");
        } else if (err.response.status === 404) {
          setError("API endpoint not found");
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Login failed. Please try again.");
        }
      } else if (err.request) {
        // Request was made but no response
        setError("Cannot connect to server. Please check your connection.");
      } else {
        // Something else happened
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials for testing
  const fillDemoCredentials = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
    setError("");
  };

  return (
    <div
      className="
        min-h-screen
        flex items-center justify-center
        px-6 py-10
        relative overflow-hidden
      "
      style={{
        background: "linear-gradient(135deg, #020617 0%, #071236 45%, #020617 100%)",
      }}
    >
      {/* Glow Effects - Using accent colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#C026D3]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-[#2563EB]/10 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md z-10">
        {/* Brand */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="
              w-14 h-14
              rounded-2xl
              bg-gradient-to-br from-[#C026D3] to-[#2563EB]
              flex items-center justify-center
              shadow-[0_10px_40px_rgba(192,38,211,0.35)]
            "
          >
            <img
              src={logo}
              alt="Brubla Logo"
              className="w-14 h-14 object-contain rounded-2xl"
            />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Brubla
            </h1>
            <p className="text-sm text-[#94A3B8]">
              E-commerce Fashion Dashboard
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div
          className="
            rounded-3xl
            border border-white/10
            backdrop-blur-2xl
            p-8
            shadow-[0_20px_80px_rgba(0,0,0,0.45)]
          "
          style={{
            background: "rgba(7, 18, 54, 0.85)",
          }}
        >
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white">
              Welcome Back 👋
            </h2>
            <p className="text-[#94A3B8] text-sm mt-1">
              Sign in to manage your fashion store
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-7" />

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] font-bold text-[#94A3B8] mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C026D3]"
                />

                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    w-full
                    pl-12 pr-4 py-3.5
                    rounded-2xl
                    text-white
                    placeholder:text-[#64748B]
                    outline-none
                    transition-all duration-300
                  "
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(192,38,211,0.55)";
                    e.target.style.boxShadow = "0 0 0 4px rgba(192,38,211,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs uppercase tracking-[0.18em] font-bold text-[#94A3B8] mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]"
                />

                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    w-full
                    pl-12 pr-12 py-3.5
                    rounded-2xl
                    text-white
                    placeholder:text-[#64748B]
                    outline-none
                    transition-all duration-300
                  "
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(37,99,235,0.5)";
                    e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="
                    absolute right-4 top-1/2 -translate-y-1/2
                    text-[#94A3B8] hover:text-white
                    transition-colors
                  "
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Demo Credentials Hint */}
            <div className="bg-white/5 rounded-2xl p-3 cursor-pointer hover:bg-white/10 transition-colors" onClick={fillDemoCredentials}>
              <p className="text-xs text-[#94A3B8] text-center">
                Demo Credentials: <span className="text-[#C026D3]">admin@example.com</span> / <span className="text-[#2563EB]">admin123</span>
                <span className="block text-[10px] text-[#64748B] mt-1">Click to auto-fill</span>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                flex items-center justify-center gap-2
                py-3.5
                rounded-2xl
                font-black
                uppercase
                tracking-wider
                text-white
                transition-all duration-300
                disabled:opacity-50
                hover:shadow-lg
                transform hover:scale-[1.02]
              "
              style={{
                background: "linear-gradient(135deg, #C026D3 0%, #2563EB 100%)",
                boxShadow: "0 10px 35px rgba(192,38,211,0.35)",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs text-[#64748B]">Restricted admin access</p>
            <span
              className="
                text-xs font-bold
                px-2.5 py-1
                rounded-lg
                bg-[#C026D3]/10
                text-[#C026D3]
                border border-[#C026D3]/20
              "
            >
              Fashion v2.4.1
            </span>
          </div>
        </div>

        {/* Bottom */}
        <p className="text-center text-xs text-[#64748B] mt-5">
          Brubla - E-commerce Fashion Dashboard
        </p>
      </div>
    </div>
  );
};

export default Login;