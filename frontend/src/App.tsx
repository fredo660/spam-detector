import { useEffect, useState } from "react";
import { supabase } from "./lib/Supabase";

import Landing from "./components/Landing";
import Auth from "./components/Auth";

import { AppProvider, useApp } from "./context/AppContext";
import Menu from "./components/Menu (1)";

import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Messages from "./pages/Messages";
import History from "./pages/History";
import Settings from "./pages/Settings";

function AppInner() {
  const { page } = useApp();
  const [open, setOpen] = useState(true);

  const renderPage = () => {
    switch (page) {
      case "analytics":
        return <Analytics />;
      case "messages":
        return <Messages />;
      case "history":
        return <History />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
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

  const [session, setSession] = useState<any>(null);

  // landing ou auth
  const [started, setStarted] = useState(false);

  useEffect(() => {

    // récupérer session actuelle
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // écouter connexion/déconnexion
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();

  }, []);

  // utilisateur connecté
  if (session) {
    return (
      <AppProvider>
        <AppInner />
      </AppProvider>
    );
  }

  // Landing page
  if (!started) {
    return <Landing onStart={() => setStarted(true)} />;
  }

  // Auth page
  return (
    <Auth
      onSuccess={() => {
        setStarted(true);
      }}
    />
  );
}