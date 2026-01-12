import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../utils/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER } from "../utils/constants";
import LoadingIndicator from "../components/LoadingIndicator";
import "../App.css";
import logo from "../assets/OIP.png";

const AuthPage = ({ state = true }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(state);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(false); // false = initiate, true = confirm

  const toggleForm = () => {
    if (isForgotPassword) {
      setIsForgotPassword(false);
      setIsLogin(true);
      setResetStep(false);
    } else {
      setIsLogin(!isLogin);
    }
    setErrors({});
  };
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [role, setRole] = useState("consumer");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateField = (name, value) => {
    // console.log(name, value, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    switch (name) {
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

      case "name":
        return value.trim() ? "" : "Name is required.";
      case "password":
        return value ? "" : "Password is required";
      case "confirmPassword":
        return formData.password !== value ? "Password do not match" : "";
      default:
        return "";
    }
  };

  const validateForm = useCallback(() => {
    const newErrors = {
      email: validateField("email", formData.email) ? "" : "Invalid email address.",
      name: validateField("name", formData.name),
      confirmPassword: validateField(
        "confirmPassword",
        formData.confirmPassword
      ),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  }, [formData]);

  const validateLoginForm = useCallback(() => {
    const newErrors = {
      email: validateField("email", formData.email) ? "" : "Invalid email address.",
      password: validateField("password", formData.password),
    };
    console.log(newErrors)
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin) {
      if (!validateForm()) {
        return;
      }
    } else {
      if (!validateLoginForm()) {
        return;
      }
    }
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await api.post("/auth/login", formData);
        if (res.data.success) {
          localStorage.setItem(ACCESS_TOKEN, res.data.access);
          localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
          localStorage.setItem(USER, JSON.stringify(res.data.user));
          navigate("/dashboard");
        } else {
          console.log(res);
          setErrors({ error: res.message });
        }
      } else {
        const endpoint =
          role === "creator" ? "/auth/creator" : "/auth/register";
        res = await api.post(endpoint, { ...formData, role });
        console.log(res);
        if (res.data.success) {
          navigate("/verify");
        }
      }
    } catch (error) {
      const errorData = error.response.data;
      setErrors({
        error: errorData.message || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!resetStep) {
        console.log(validateField("email", formData.email))
        if (!validateField("email", formData.email)) {
          setErrors({ email: "Invalid email address" });
          setLoading(false);
          return;
        }

        const res = await api.post("/users/forgot-password/initiate", { email: formData.email });

        if (res.data.success) {
          setResetStep(true);
          setErrors({ success: "Verification code sent to your email." });
        }
      } else {
        if (!formData.code || !formData.newPassword) {
          setErrors({ error: "All fields are required" });
          setLoading(false);
          return;
        }

        const res = await api.post("/users/forgot-password/confirm", {
          code: formData.code,
          password: formData.newPassword
        });

        if (res.data.success) {
          setIsForgotPassword(false);
          setIsLogin(true);
          setResetStep(false);
          setErrors({ success: "Password reset successfully. Please login." });
          setFormData(prev => ({ ...prev, code: "", newPassword: "" }));
        }
      }
    } catch (error) {
      const errorData = error.response?.data || {};
      setErrors({
        error: errorData.message || errorData.error || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-sans overflow-hidden">
      <Header />

      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative w-full min-h-[90vh] flex items-center justify-center px-4 z-10 py-20">
        <div className="w-full max-w-6xl bg-white shadow-2xl rounded-3xl flex overflow-hidden border border-gray-100">
          {/* Left Form Panel */}
          <div className="w-full lg:w-3/5 p-8 lg:p-12 bg-white flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-3">
                {isForgotPassword
                  ? "Reset Password"
                  : isLogin
                    ? "Welcome Back"
                    : "Join Us Today"}
              </h2>
              <p className="text-gray-600 text-lg">
                {isForgotPassword
                  ? "Enter your email to receive a verification code"
                  : isLogin
                    ? "Sign in to access your account"
                    : "Create an account to get started"}
              </p>
            </div>

            <form className="space-y-5" onSubmit={isForgotPassword ? handleForgotPasswordSubmit : handleSubmit}>
              {!isForgotPassword && !isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Choose Your Role
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className={`flex-1 px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-300 ${role === "creator"
                          ? "bg-black text-white border-black shadow-lg scale-105"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        onClick={() => setRole("creator")}
                      >
                        🎨 Creator
                      </button>
                      <button
                        type="button"
                        className={`flex-1 px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-300 ${role === "consumer"
                          ? "bg-black text-white border-black shadow-lg scale-105"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        onClick={() => setRole("consumer")}
                      >
                        🛍️ Consumer
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!isForgotPassword && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              )}

              {isForgotPassword && !resetStep && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              )}

              {isForgotPassword && resetStep && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      placeholder="Enter verification code"
                      value={formData.code || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                    {errors.code && (
                      <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Enter new password"
                      value={formData.newPassword || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                    {errors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                    )}
                  </div>
                </>
              )}


              {!isForgotPassword && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
              )}

              {!isLogin && !isForgotPassword && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {isLogin && !isForgotPassword && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm font-semibold text-gray-600 hover:text-black hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {loading ? (
                <div className="py-4">
                  <LoadingIndicator />
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-black to-gray-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isForgotPassword
                    ? (resetStep ? "Reset Password" : "Send Verification Code")
                    : (isLogin ? "Sign In" : "Create Account")}
                </button>
              )}
              {errors.error && (
                <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {errors.error}
                </p>
              )}
              {errors.success && (
                <p className="text-green-500 text-sm text-center bg-green-50 p-3 rounded-lg">
                  {errors.success}
                </p>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isForgotPassword
                  ? "Remember your password?"
                  : (isLogin ? "Don't have an account?" : "Already have an account?")
                }{" "}
                <button
                  onClick={toggleForm}
                  className="text-black font-bold hover:underline transition-all"
                >
                  {isForgotPassword
                    ? "Back to Login"
                    : (isLogin ? "Sign Up" : "Sign In")}
                </button>
              </p>
            </div>
          </div>

          {/* Right Welcome Panel */}
          <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-12 flex-col items-center justify-center relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

            <div className="relative z-10 text-center">
              <img
                src={logo}
                alt="Company Logo"
                className="w-32 h-32 mb-8 rounded-full border-4 border-white/20 shadow-2xl mx-auto"
              />
              <h2 className="text-4xl font-black mb-4">Welcome to Brush</h2>
              <p className="text-lg text-gray-300 leading-relaxed max-w-sm mx-auto">
                Your premier Digital Assets Marketplace. Discover, create, and
                share amazing digital content.
              </p>

              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Premium quality assets</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Secure transactions</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">24/7 support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AuthPage;
