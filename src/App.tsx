// import { Header } from "./componenets/Header";
import { MainContent } from "./componenets/MainContent";
import { Sidebar } from "./componenets/Sidebar";

function App() {
  return (
    <main className="w-screen min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]"></div>

      {/* Layout */}
      <div className="flex w-full h-full">
        <div className="w-[20%] bg-white rounded-r-2xl shadow-md">
          <Sidebar />
        </div>
        <div className="w-[80%] p-4">
          <MainContent />
        </div>
      </div>
    </main>
  );
}

export default App;
