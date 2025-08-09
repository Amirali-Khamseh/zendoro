import { Header } from "./componenets/Header";
import { MainContent } from "./componenets/MainContent";
import { Sidebar } from "./componenets/Sidebar";

function App() {
  return (
    <main className="w-100vw">
      <Header />
      <div className="flex w-full mt-[60px]">
        <Sidebar />
        <MainContent />
      </div>
    </main>
  );
}

export default App;
