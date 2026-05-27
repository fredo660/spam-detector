import { useEffect } from "react";
import "./App.css";
import { AppProvider, useApp } from "./context/AppContext";
import Menu from "./components/Menu (1)";
import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Messages  from "./pages/Messages";
import History   from "./pages/History";
import Settings  from "./pages/Settings";

function AppInner() {
  const { page } = useApp();
  const [open, setOpen] = useState(true);

  // Ctrl+Enter pour analyser depuis n'importe quelle page
  const { analyze } = useApp();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") analyze();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [analyze]);

  const renderPage = () => {
    switch (page) {
      case "analytics": return <Analytics />;
      case "messages":  return <Messages />;
      case "history":   return <History />;
      case "settings":  return <Settings />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="layout">
      <Menu open={open} setOpen={setOpen} />
      <div className="content">
        {renderPage()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
