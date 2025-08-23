// import { Header } from "./componenets/Header";
import { MainContent } from "./componenets/MainContent";
import { Sidebar } from "./componenets/Sidebar";

function App() {
  return (
    <main
      className="w-100vw  h-screen bg-gradient-to-t from-slate-900 via-blue-950 to-indigo-900
"
    >
      {/* <Header /> */}
      <div className="flex w-full">
        <div className="w-[20%] bg-white rounded-r-2xl">
          <Sidebar />
        </div>
        <div className="w-[80%] ">
          <MainContent />
        </div>
      </div>
    </main>
  );
}

export default App;
