import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../utils/api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER } from "../utils/constants";
import LoadingIndicator from "../components/LoadingIndicator";
import "../App.css";

const AuthPage = ({ state = true }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(state);
  const toggleForm = () => setIsLogin(!isLogin);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "Invalid email address.";
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
      email: validateField("email", formData.email),
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
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin) {
      if (!validateForm()) {
        // addToast("Please fix the form errors.", "error");
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
        res = await api.post("/auth/register", formData);
        console.log(res);
        if (res.data.success) {
          navigate("/verify");
        }
      }
      // if (res.data.success) {
      //   localStorage.setItem(ACCESS_TOKEN, res.data.access);
      //   localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      //   localStorage.setItem(USER, JSON.stringify(res.data.user));
      //   navigate("/dashboard");
      // } else {
      //   console.log(res);
      //   setErrors({ error: res.message });
      // }
    } catch (error) {
      if (error.name === "AxiosError") {
        setErrors({
          error: "Network Error"
        })
      }
      else {
      const errorData = error.response.data;
      setErrors({
        error: errorData.message || "An error occurred. Please try again.",
      });}
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gray-100 font-sans overflow-hidden">
      <Header />

      <div className="relative w-full min-h-[90vh] flex items-center justify-center px-4 z-10">
        <div className="w-full max-w-6xl h-[600px] bg-white shadow-2xl rounded-2xl flex overflow-hidden animate-fade-in-up border border-black">
          {/* Left Form Panel */}
          <div className="w-3/5 p-12 bg-white flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold text-black text-center mb-8">
              {isLogin ? "Login" : "Create Account"}
            </h2>
            {/* <p className="text-red-500">{errors.error}</p> */}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  {errors.name && <p className="text-red-500">{errors.name}</p>}
                </div>
              )}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                {errors.email && <p className="text-red-500">{errors.email}</p>}
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                {errors.password && (
                  <p className="text-red-500">{errors.password}</p>
                )}
              </div>
              {!isLogin && (
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {loading ? (
                <LoadingIndicator />
              ) : (
                <button
                  type="submit"
                  className="w-full bg-black text-white font-semibold py-3 rounded-lg shadow-md hover:bg-gray-900 transition-colors duration-300"
                >
                  {isLogin ? "Login" : "Sign Up"}
                </button>
              )}
              {errors.error && <p className="text-red-500">{errors.error}</p>}
            </form>

            <p className="text-center mt-6 text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={toggleForm}
                className="text-black font-semibold hover:underline"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>

          {/* Right Welcome Panel */}
          <div className="w-2/5 bg-black text-white p-10 flex flex-col items-center justify-center rounded-r-2xl">
            <img
              src="/src/assets/OIP.webp"
              alt="Company Logo"
              className="w-24 h-24 mb-6 rounded-full border-4 border-black shadow-lg"
            />
            <h2 className="text-3xl font-bold mb-2 text-white">
              Welcome to BDA
            </h2>
            <p className="text-lg text-gray-300 text-center max-w-xs">
              Your trusted Digital Assets Marketplace. Login or sign up to get
              started.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AuthPage;
