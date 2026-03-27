import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../../../store/userStore";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const login = useUserStore((state) => state.login);
  const navigate = useNavigate(); 
  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Remove this useEffect - it's causing redirect loop
  // useEffect(() => {
  //   const token = localStorage.getItem("accessToken");
  //   if (!token) {
  //     navigate("/login");
  //   }
  // }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const result = await login({ email, password });

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.log(err)
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white flex rounded-2xl max-w-3xl shadow-lg p-5">
        <div className="w-1/2 px-16">
          <h2 className="font-bold text-2xl text-[#002d74]">Login</h2>
          <p className="text-sm mt-4 text-[#002d74]">
            If you already have an account, please login.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your Email"
              className="p-2 mt-8 rounded-xl border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your Password"
                className="p-2 rounded-xl border w-full pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#002D74] rounded-xl text-white py-2 mt-2 hover:bg-[#001f52] transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm mt-4 text-[#002d74]">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-500">
                Register
              </Link>
            </p>
          </form>
        </div>

        <div className="w-1/2 p-5">
          <img
            src="/img1.png"
            alt="login visual"
            className="h-full w-full rounded-2xl object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Login;