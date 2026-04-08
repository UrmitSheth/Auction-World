import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../store/auth/authSlice";
import { Link } from "react-router";
import LoadingScreen from "../components/LoadingScreen";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isError, setIsError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      navigate("/");
    } catch (error) {
      console.log("Login Failed", error);
      setIsError(error || "something went wrong");
      setTimeout(() => {
        setIsError("");
      }, 10000);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="theme-bg theme-text min-h-screen flex flex-col transition-colors">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="theme-card theme-border border p-8 rounded-sm shadow transition-colors">
            <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium theme-text-secondary mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="theme-input w-full px-3 py-2 border rounded-sm transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium theme-text-secondary mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="theme-input w-full px-3 py-2 border rounded-sm transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              {isError && (
                <div 
                  className="px-4 mb-4 -mt-2 py-3 rounded-md border"
                  style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
                >
                  {isError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full theme-accent-bg text-white py-2 px-4 rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-4 text-center text-sm theme-text-muted">
              <Link to="#" className="hover:underline">
                Forgot your password?
              </Link>
            </div>

            <div className="mt-6 text-center text-sm theme-text-secondary">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="theme-accent font-medium hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
