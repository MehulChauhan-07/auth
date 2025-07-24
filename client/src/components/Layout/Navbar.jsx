import React, { useContext } from "react";
import { assets } from "../../assets/assets.js";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContext);

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/auth/logout`);
      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/auth/send-verification-otp`
      );
      if (data.success) {
        navigate("/verify-email");
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Error sending verification OTP:", error);
      toast.error(error.message);
    }
  };
  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 bg-white shadow-md absolute top-0">
      <Link to="/">
        <img className="w-32 sm:w-44" src={assets.logo} alt="Logo" />
      </Link>
      {userData ? (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black relative group text-white">
          {userData.name[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {!userData.isAccountVerified && (
                <li onClick={sendVerificationOtp} className="py-1 px-2 hover:bg-gray-200">
                  <Link
                    to="/verify-email"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Verify Email
                  </Link>
                </li>
              )}
              <li
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 border border-gray-500 rounded-full text-gray-800 px-6 py-2 hover:bg-gray-100 transition-all"
          onClick={() => navigate("/login")}
        >
          Get started{" "}
          <img className="w-3 sm:w-4" src={assets.arrow_icon} alt="" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
