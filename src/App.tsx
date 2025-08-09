import { Header } from "./componenets/Header";
import { MainContent } from "./componenets/MainContent";
import { Sidebar } from "./componenets/Sidebar";

function App() {
  return (
    <main className="w-100vw  h-screen">
      <Header />
      <div className="flex w-full">
        <Sidebar />
        <MainContent />
      </div>
    </main>
  );
}

export default App;
