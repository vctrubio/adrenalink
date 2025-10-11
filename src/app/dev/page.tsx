import ToggleTheme from "../../components/toggle-theme";
import ColorsDemo from "../../components/colors-demo";

export default function DevPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Development Tools</h1>
          <ToggleTheme />
        </div>

        <ColorsDemo />
      </div>
    </div>
  );
}
