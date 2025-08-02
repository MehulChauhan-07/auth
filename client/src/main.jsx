import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AppContextProvider } from "./context/AppContext.jsx";
import {AuthProvider} from "./context/AuthProvider.jsx";
import {ToastContainer} from "react-toastify";
// import { ClerkProvider } from "@clerk/clerk-react";

// // Import your Publishable Key
// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// if (!PUBLISHABLE_KEY) {
//   throw new Error("Missing Publishable Key");
// }

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
      <AuthProvider>
            <AppContextProvider>
              {/* <ClerkProvider publishableKey={PUBLISHABLE_KEY}> */}
              <App />
                <ToastContainer position={"top-right"} autoClose={5000}/>
              {/* </ClerkProvider> */}
            </AppContextProvider>
      </AuthProvider>
  </BrowserRouter>
);
