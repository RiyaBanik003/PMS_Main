import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api/axios"; // Use your configured axios

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNo: "",
    email: "",
    password: "",
    confirmPassword: "",
    systemRole: "user",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white flex rounded-2xl max-w-4xl shadow-lg p-6">
        <div className="w-1/2 px-12">
          <h2 className="font-bold text-2xl text-[#002d74]">
            Create Account
          </h2>
          <p className="text-sm mt-3 text-gray-600">
            Fill in the details below to register.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            <div className="flex gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-1/2 p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#002d74]"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-1/2 p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#002d74]"
                required
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#002d74]"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#002d74]"
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#002d74]"
              required
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#002D74] rounded-xl text-white py-2 mt-2 hover:bg-[#001f52] transition"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="text-sm mt-3 text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>

        <div className="w-1/2 p-6">
          <img
            src="/img1.png"
            alt="register visual"
            className="h-full w-full rounded-2xl object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Register;