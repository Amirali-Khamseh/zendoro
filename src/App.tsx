import { useState } from "react";
// import { Header } from "./componenets/Header";
import { MainContent } from "./componenets/MainContent";
import { Sidebar } from "./componenets/Sidebar";
import { modesValue } from "./constants/data";
import { modeContext, type ModeContextType } from "./context/modeContext";

function App() {
  const [mode, setMode] = useState<ModeContextType>({
    name: modesValue[0].time.name,
    focusTime: modesValue[0].time.focusTime,
    shortBreak: modesValue[0].time.shortBreak,
    longBreak: modesValue[0].time.longBreak,
  });
  function changeMode(mode: ModeContextType) {
    setMode(mode);
  }
  return (
    <modeContext.Provider value={{ ...mode, changeMode }}>
      <main className="w-100vw  h-screen bg-slate-900">
        {/* <Header /> */}
        <div className="flex w-full">
          <div className="w-[20%] bg-white rounded-r-2xl">
            <Sidebar />
          </div>
          <div className="w-[80%] bg-slate-900">
            <MainContent />
          </div>
        </div>
      </main>
    </modeContext.Provider>
  );
}

export default App;
