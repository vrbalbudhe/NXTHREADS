import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./Context/ThemeContext.jsx";
import { AuthContextProvider } from "./Context/AuthContext.jsx";
import { SocialProvider } from "./Context/SocialContext.jsx";
import { ChatProvider } from "./Context/ChatContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthContextProvider>
        <SocialProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </SocialProvider>
      </AuthContextProvider>
    </ThemeProvider>
  </StrictMode>
);
