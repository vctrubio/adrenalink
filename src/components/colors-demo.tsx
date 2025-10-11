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
          <div className="p-4 bg-background border border-border rounded-lg">
            <p className="font-medium text-foreground">bg-background</p>
            <p className="text-sm text-muted-foreground">Main background</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="font-medium text-card-foreground">bg-card</p>
            <p className="text-sm text-muted-foreground">Card backgrounds</p>
          </div>
          <div className="p-4 bg-muted border border-border rounded-lg">
            <p className="font-medium text-foreground">bg-muted</p>
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
          <div className="p-4 border border-border rounded-lg bg-background">
            <p className="text-foreground font-medium mb-2">text-foreground</p>
            <p className="text-muted-foreground mb-2">text-muted-foreground</p>
            <p className="text-primary mb-2">text-primary</p>
            <p className="text-secondary mb-2">text-secondary</p>
            <p className="text-tertiary mb-2">text-tertiary</p>
            <p className="text-fourth mb-2">text-fourth</p>
            <p className="text-fifth mb-2">text-fifth</p>
            <p className="text-destructive mb-2">text-destructive</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-foreground font-medium mb-2">On muted background</p>
            <p className="text-muted-foreground mb-2">Muted text</p>
            <p className="text-primary mb-2">Primary text</p>
            <p className="text-secondary mb-2">Secondary text</p>
            <p className="text-tertiary mb-2">Tertiary text</p>
            <p className="text-fourth mb-2">Fourth text</p>
            <p className="text-fifth mb-2">Fifth text</p>
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
          <button className="p-4 border border-border hover:bg-muted rounded-lg transition-colors">
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
          <div className="p-4 border border-border rounded-lg">
            <p className="font-medium">border-border</p>
            <p className="text-sm text-muted-foreground">Default border</p>
          </div>
          <div className="p-4 border-2 border-primary rounded-lg">
            <p className="font-medium">border-primary</p>
            <p className="text-sm text-muted-foreground">Primary border</p>
          </div>
          <div className="p-4 border-2 border-input rounded-lg">
            <p className="font-medium">border-input</p>
            <p className="text-sm text-muted-foreground">Input border</p>
          </div>
        </div>
      </div>

      {/* Tailwind Glossary */}
      <div className="p-6 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-6">Tailwind Glossary: Essential Keywords</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-primary">Background Colors</h4>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-background px-2 py-1 rounded border border-border">bg-background</code> - Main app background</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">bg-card</code> - Card/panel backgrounds</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">bg-muted</code> - Subtle/disabled elements</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">bg-primary</code> - Brand/action buttons</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">bg-secondary</code> - Alternative actions</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">bg-destructive</code> - Danger/delete actions</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-primary">Text Colors</h4>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-background px-2 py-1 rounded border border-border">text-foreground</code> - Primary text</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">text-muted-foreground</code> - Secondary/helper text</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">text-primary</code> - Links/emphasis</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">text-destructive</code> - Errors/warnings</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">text-card-foreground</code> - Text on cards</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-primary">Borders & Outlines</h4>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-background px-2 py-1 rounded border border-border">border-border</code> - Default borders</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">border-input</code> - Form inputs</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">border-primary</code> - Highlighted borders</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">ring-ring</code> - Focus rings</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-primary">State Modifiers</h4>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-background px-2 py-1 rounded border border-border">hover:</code> - Mouse over states</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">dark:</code> - Dark mode variants</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">focus:</code> - Focus states</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">active:</code> - Pressed states</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">disabled:</code> - Disabled states</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-primary">Opacity & Effects</h4>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-background px-2 py-1 rounded border border-border">/50</code> - 50% opacity (bg-primary/50)</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">/90</code> - 90% opacity (hover states)</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">transition-colors</code> - Smooth color changes</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">shadow-lg</code> - Drop shadows</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-primary">Layout Utilities</h4>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-background px-2 py-1 rounded border border-border">flex</code> - Flexbox container</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">grid</code> - CSS Grid container</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">space-y-4</code> - Vertical spacing</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">gap-4</code> - Grid/flex gaps</li>
              <li><code className="bg-background px-2 py-1 rounded border border-border">rounded-lg</code> - Border radius</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-card rounded-lg border border-border">
          <h4 className="font-semibold mb-2 text-primary">Why Use Semantic Colors?</h4>
          <p className="text-sm text-muted-foreground">
            Semantic colors like <code>bg-muted</code> and <code>text-muted-foreground</code> automatically adapt between light and dark modes.
            They maintain consistent meaning across themes, making your UI more maintainable and accessible.
          </p>
        </div>
      </div>
    </div>
  );
}
