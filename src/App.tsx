import { useState } from "react";
import { Header } from "./componenets/Header";
import { MainContent } from "./componenets/MainContent";
import { Sidebar } from "./componenets/Sidebar";
import { type ModeContextType, modeContext } from "./config/modeContext";

function App() {
  const [mode, setMode] = useState<ModeContextType>({
    name: "Standard",
    focusTime: 25 * 60 * 1000,
    shortBreak: 5 * 60 * 1000,
    longBreak: 15 * 60 * 1000,
  });
  return (
    <modeContext.Provider value={mode}>
      <main className="w-100vw  h-screen">
        <Header />
        <div className="flex w-full">
          <Sidebar />
          <MainContent />
        </div>
      </main>
    </modeContext.Provider>
  );
}

export default App;
