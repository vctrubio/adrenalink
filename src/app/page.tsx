import ToggleTheme from "../components/toggle-theme";
import Banner from "../components/banner";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="p-8">
        <div className="flex justify-end mb-8">
          <ToggleTheme />
        </div>
        <Banner />
      </div>
    </div>
  );
}
