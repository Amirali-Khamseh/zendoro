// import { Header } from "./componenets/Header";
import { MainContent } from "./componenets/MainContent";
import { Sidebar } from "./componenets/Sidebar";

function App() {
  return (
    <main className="w-screen min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="relative h-full w-full bg-red [&>div]:absolute [&>div]:h-full [&>div]:w-full [&>div]:bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [&>div]:[background-size:16px_16px] [&>div]:[mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
          <div></div>
        </div>
      </div>

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
