export default function Banner() {
  return (
    <div className="text-center space-y-8 max-w-4xl mx-auto">
      <h1 className="text-6xl font-bold tracking-tight transition-all duration-300 hover:scale-105">
        Adrenalink
      </h1>

      <div className="space-y-4">
        <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors slogan">
          student - teacher connection
        </p>
        <p className="text-lg font-medium">pick your sport</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        {["kite", "wing", "windsurf", "paragliding", "surf", "snow"].map((sport) => (
          <span
            key={sport}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105 cursor-pointer"
          >
            {sport}
          </span>
        ))}
      </div>
    </div>
  );
}
