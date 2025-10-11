export default function ColorsDemo() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Color System Demo</h2>
        <p className="text-muted-foreground">
          Understanding how Tailwind colors work in light and dark mode
        </p>
      </div>

      {/* Background Colors */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Background Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-background border rounded-lg">
            <p className="font-medium">bg-background</p>
            <p className="text-sm text-muted-foreground">Main background</p>
          </div>
          <div className="p-4 bg-card border rounded-lg">
            <p className="font-medium">bg-card</p>
            <p className="text-sm text-muted-foreground">Card backgrounds</p>
          </div>
          <div className="p-4 bg-muted border rounded-lg">
            <p className="font-medium">bg-muted</p>
            <p className="text-sm text-muted-foreground">Subtle backgrounds</p>
          </div>
          <div className="p-4 bg-primary text-primary-foreground rounded-lg">
            <p className="font-medium">bg-primary</p>
            <p className="text-sm opacity-90">Primary actions</p>
          </div>
        </div>
      </div>

      {/* Text Colors */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Text Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-foreground font-medium mb-2">text-foreground</p>
            <p className="text-muted-foreground mb-2">text-muted-foreground</p>
            <p className="text-primary mb-2">text-primary</p>
            <p className="text-destructive mb-2">text-destructive</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-foreground font-medium mb-2">On muted background</p>
            <p className="text-muted-foreground mb-2">Muted text</p>
            <p className="text-primary mb-2">Primary text</p>
            <p className="text-destructive mb-2">Destructive text</p>
          </div>
        </div>
      </div>

      {/* Main Color Palette */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Main Color Palette</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Blue */}
          <div className="space-y-2">
            <h4 className="font-medium text-blue-600 dark:text-blue-400">Blue</h4>
            <div className="space-y-1">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded text-center text-blue-900 dark:text-blue-100">
                <p className="text-xs">blue-50/950</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded text-center text-blue-900 dark:text-blue-100">
                <p className="text-xs">blue-100/900</p>
              </div>
              <div className="p-3 bg-blue-500 rounded text-center text-white">
                <p className="text-xs">blue-500</p>
              </div>
              <div className="p-3 bg-blue-600 rounded text-center text-white">
                <p className="text-xs">blue-600</p>
              </div>
              <div className="p-3 bg-blue-700 rounded text-center text-white">
                <p className="text-xs">blue-700</p>
              </div>
            </div>
          </div>

          {/* Green */}
          <div className="space-y-2">
            <h4 className="font-medium text-green-600 dark:text-green-400">Green</h4>
            <div className="space-y-1">
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded text-center text-green-900 dark:text-green-100">
                <p className="text-xs">green-50/950</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded text-center text-green-900 dark:text-green-100">
                <p className="text-xs">green-100/900</p>
              </div>
              <div className="p-3 bg-green-500 rounded text-center text-white">
                <p className="text-xs">green-500</p>
              </div>
              <div className="p-3 bg-green-600 rounded text-center text-white">
                <p className="text-xs">green-600</p>
              </div>
              <div className="p-3 bg-green-700 rounded text-center text-white">
                <p className="text-xs">green-700</p>
              </div>
            </div>
          </div>

          {/* Red */}
          <div className="space-y-2">
            <h4 className="font-medium text-red-600 dark:text-red-400">Red</h4>
            <div className="space-y-1">
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded text-center text-red-900 dark:text-red-100">
                <p className="text-xs">red-50/950</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded text-center text-red-900 dark:text-red-100">
                <p className="text-xs">red-100/900</p>
              </div>
              <div className="p-3 bg-red-500 rounded text-center text-white">
                <p className="text-xs">red-500</p>
              </div>
              <div className="p-3 bg-red-600 rounded text-center text-white">
                <p className="text-xs">red-600</p>
              </div>
              <div className="p-3 bg-red-700 rounded text-center text-white">
                <p className="text-xs">red-700</p>
              </div>
            </div>
          </div>

          {/* Orange */}
          <div className="space-y-2">
            <h4 className="font-medium text-orange-600 dark:text-orange-400">Orange</h4>
            <div className="space-y-1">
              <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded text-center text-orange-900 dark:text-orange-100">
                <p className="text-xs">orange-50/950</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded text-center text-orange-900 dark:text-orange-100">
                <p className="text-xs">orange-100/900</p>
              </div>
              <div className="p-3 bg-orange-500 rounded text-center text-white">
                <p className="text-xs">orange-500</p>
              </div>
              <div className="p-3 bg-orange-600 rounded text-center text-white">
                <p className="text-xs">orange-600</p>
              </div>
              <div className="p-3 bg-orange-700 rounded text-center text-white">
                <p className="text-xs">orange-700</p>
              </div>
            </div>
          </div>

          {/* Purple */}
          <div className="space-y-2">
            <h4 className="font-medium text-purple-600 dark:text-purple-400">Purple</h4>
            <div className="space-y-1">
              <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded text-center text-purple-900 dark:text-purple-100">
                <p className="text-xs">purple-50/950</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded text-center text-purple-900 dark:text-purple-100">
                <p className="text-xs">purple-100/900</p>
              </div>
              <div className="p-3 bg-purple-500 rounded text-center text-white">
                <p className="text-xs">purple-500</p>
              </div>
              <div className="p-3 bg-purple-600 rounded text-center text-white">
                <p className="text-xs">purple-600</p>
              </div>
              <div className="p-3 bg-purple-700 rounded text-center text-white">
                <p className="text-xs">purple-700</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gray Scale */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Gray Scale (Light/Dark Adaptive)</h3>
        <div className="grid grid-cols-5 gap-2">
          <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded text-center">
            <p className="text-xs">gray-50</p>
            <p className="text-xs">dark:gray-950</p>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded text-center">
            <p className="text-xs">gray-100</p>
            <p className="text-xs">dark:gray-900</p>
          </div>
          <div className="p-3 bg-gray-200 dark:bg-gray-800 rounded text-center">
            <p className="text-xs">gray-200</p>
            <p className="text-xs">dark:gray-800</p>
          </div>
          <div className="p-3 bg-gray-300 dark:bg-gray-700 rounded text-center">
            <p className="text-xs">gray-300</p>
            <p className="text-xs">dark:gray-700</p>
          </div>
          <div className="p-3 bg-gray-400 dark:bg-gray-600 rounded text-center">
            <p className="text-xs">gray-400</p>
            <p className="text-xs">dark:gray-600</p>
          </div>
        </div>
      </div>

      {/* Interactive States */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Interactive States</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors">
            Primary Button
            <p className="text-xs opacity-90">hover:bg-primary/90</p>
          </button>
          <button className="p-4 border hover:bg-muted rounded-lg transition-colors">
            Secondary Button
            <p className="text-xs text-muted-foreground">hover:bg-muted</p>
          </button>
          <button className="p-4 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg transition-colors">
            Destructive Button
            <p className="text-xs opacity-90">hover:bg-destructive/90</p>
          </button>
        </div>
      </div>

      {/* Borders */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Borders</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="font-medium">border</p>
            <p className="text-sm text-muted-foreground">Default border</p>
          </div>
          <div className="p-4 border-2 border-primary rounded-lg">
            <p className="font-medium">border-primary</p>
            <p className="text-sm text-muted-foreground">Primary border</p>
          </div>
          <div className="p-4 border-2 border-muted-foreground/20 rounded-lg">
            <p className="font-medium">border-muted-foreground/20</p>
            <p className="text-sm text-muted-foreground">Subtle border</p>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="p-6 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Tailwind Tips:</h3>
        <ul className="space-y-2 text-sm">
          <li>• Use <code className="bg-background px-1 py-0.5 rounded">dark:</code> prefix for dark mode variants</li>
          <li>• <code className="bg-background px-1 py-0.5 rounded">hover:</code> and <code className="bg-background px-1 py-0.5 rounded">focus:</code> for interactive states</li>
          <li>• <code className="bg-background px-1 py-0.5 rounded">/90</code> suffix for opacity (e.g., bg-primary/90)</li>
          <li>• Semantic colors like <code className="bg-background px-1 py-0.5 rounded">foreground</code>, <code className="bg-background px-1 py-0.5 rounded">muted</code> automatically adapt</li>
          <li>• Use <code className="bg-background px-1 py-0.5 rounded">transition-colors</code> for smooth color changes</li>
        </ul>
      </div>
    </div>
  );
}
