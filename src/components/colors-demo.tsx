export default function ColorsDemo() {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Color System Demo</h2>
                <p className="text-muted-foreground">Understanding how Tailwind colors work in light and dark mode</p>
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

            {/* Custom Pantone Palette */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Custom Pantone Color Palette</h3>
                
                {/* Primary Pantone Colors */}
                <div className="space-y-2">
                    <h4 className="font-medium text-muted-foreground">Primary Pantone Colors</h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-ultra-violet rounded text-center text-white">
                                <p className="text-xs font-medium">Ultra Violet</p>
                                <p className="text-xs opacity-90">18-3838 TCX</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-living-coral rounded text-center text-white">
                                <p className="text-xs font-medium">Living Coral</p>
                                <p className="text-xs opacity-90">16-1546 TCX</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-greenery rounded text-center text-white">
                                <p className="text-xs font-medium">Greenery</p>
                                <p className="text-xs opacity-90">15-0343 TCX</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-classic-blue rounded text-center text-white">
                                <p className="text-xs font-medium">Classic Blue</p>
                                <p className="text-xs opacity-90">19-4052 TCX</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-serenity rounded text-center text-white">
                                <p className="text-xs font-medium">Serenity</p>
                                <p className="text-xs opacity-90">15-3919 TPG</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-marsala rounded text-center text-white">
                                <p className="text-xs font-medium">Marsala</p>
                                <p className="text-xs opacity-90">18-1438 TCX</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Pantone Colors */}
                <div className="space-y-2">
                    <h4 className="font-medium text-muted-foreground">Secondary Pantone Colors</h4>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-rose-quartz rounded text-center text-gray-800">
                                <p className="text-xs font-medium">Rose Quartz</p>
                                <p className="text-xs opacity-70">PQ-13-1520TCX</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-mocha-mousse rounded text-center text-white">
                                <p className="text-xs font-medium">Mocha Mousse</p>
                                <p className="text-xs opacity-90">17-1230 TCX</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-illuminating rounded text-center text-gray-800">
                                <p className="text-xs font-medium">Illuminating</p>
                                <p className="text-xs opacity-70">13-0647 TCX</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-ultimate-gray rounded text-center text-white">
                                <p className="text-xs font-medium">Ultimate Gray</p>
                                <p className="text-xs opacity-90">17-5104 TCX</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-peach-fuzz rounded text-center text-gray-800">
                                <p className="text-xs font-medium">Peach Fuzz</p>
                                <p className="text-xs opacity-70">13-1023 TCX</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-very-peri rounded text-center text-white">
                                <p className="text-xs font-medium">Very Peri</p>
                                <p className="text-xs opacity-90">17-3938 TCX</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="p-4 bg-pantone-viva-magenta rounded text-center text-white">
                                <p className="text-xs font-medium">Viva Magenta</p>
                                <p className="text-xs opacity-90">18-1750 TCX</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Paper Scale */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Paper Scale (Professional Warm Tones)</h3>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                    <div className="p-3 bg-paper-50 rounded text-center border border-paper-200">
                        <p className="text-xs text-gray-800">paper-50</p>
                        <p className="text-xs text-gray-600">lightest cream</p>
                    </div>
                    <div className="p-3 bg-paper-100 rounded text-center border border-paper-200">
                        <p className="text-xs text-gray-800">paper-100</p>
                        <p className="text-xs text-gray-600">soft ivory</p>
                    </div>
                    <div className="p-3 bg-paper-200 rounded text-center border border-paper-300">
                        <p className="text-xs text-gray-800">paper-200</p>
                        <p className="text-xs text-gray-600">warm white</p>
                    </div>
                    <div className="p-3 bg-paper-300 rounded text-center">
                        <p className="text-xs text-gray-800">paper-300</p>
                        <p className="text-xs text-gray-600">parchment</p>
                    </div>
                    <div className="p-3 bg-paper-400 rounded text-center">
                        <p className="text-xs text-gray-800">paper-400</p>
                        <p className="text-xs text-gray-600">aged paper</p>
                    </div>
                    <div className="p-3 bg-paper-500 rounded text-center">
                        <p className="text-xs text-gray-800">paper-500</p>
                        <p className="text-xs text-gray-600">vintage</p>
                    </div>
                    <div className="p-3 bg-paper-600 rounded text-center">
                        <p className="text-xs text-white">paper-600</p>
                        <p className="text-xs text-gray-200">document</p>
                    </div>
                    <div className="p-3 bg-paper-700 rounded text-center">
                        <p className="text-xs text-white">paper-700</p>
                        <p className="text-xs text-gray-200">antique</p>
                    </div>
                    <div className="p-3 bg-paper-800 rounded text-center">
                        <p className="text-xs text-white">paper-800</p>
                        <p className="text-xs text-gray-200">weathered</p>
                    </div>
                    <div className="p-3 bg-paper-900 rounded text-center">
                        <p className="text-xs text-white">paper-900</p>
                        <p className="text-xs text-gray-200">manuscript</p>
                    </div>
                    <div className="p-3 bg-paper-950 rounded text-center">
                        <p className="text-xs text-white">paper-950</p>
                        <p className="text-xs text-gray-200">ancient</p>
                    </div>
                </div>
            </div>

            {/* Stone Scale */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Stone Scale (Professional Natural Tones)</h3>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                    <div className="p-3 bg-stone-50 rounded text-center border border-stone-200">
                        <p className="text-xs text-gray-800">stone-50</p>
                        <p className="text-xs text-gray-600">limestone</p>
                    </div>
                    <div className="p-3 bg-stone-100 rounded text-center border border-stone-200">
                        <p className="text-xs text-gray-800">stone-100</p>
                        <p className="text-xs text-gray-600">marble</p>
                    </div>
                    <div className="p-3 bg-stone-200 rounded text-center">
                        <p className="text-xs text-gray-800">stone-200</p>
                        <p className="text-xs text-gray-600">sandstone</p>
                    </div>
                    <div className="p-3 bg-stone-300 rounded text-center">
                        <p className="text-xs text-gray-800">stone-300</p>
                        <p className="text-xs text-gray-600">travertine</p>
                    </div>
                    <div className="p-3 bg-stone-400 rounded text-center">
                        <p className="text-xs text-white">stone-400</p>
                        <p className="text-xs text-gray-200">limestone</p>
                    </div>
                    <div className="p-3 bg-stone-500 rounded text-center">
                        <p className="text-xs text-white">stone-500</p>
                        <p className="text-xs text-gray-200">granite</p>
                    </div>
                    <div className="p-3 bg-stone-600 rounded text-center">
                        <p className="text-xs text-white">stone-600</p>
                        <p className="text-xs text-gray-200">basalt</p>
                    </div>
                    <div className="p-3 bg-stone-700 rounded text-center">
                        <p className="text-xs text-white">stone-700</p>
                        <p className="text-xs text-gray-200">slate</p>
                    </div>
                    <div className="p-3 bg-stone-800 rounded text-center">
                        <p className="text-xs text-white">stone-800</p>
                        <p className="text-xs text-gray-200">charcoal</p>
                    </div>
                    <div className="p-3 bg-stone-900 rounded text-center">
                        <p className="text-xs text-white">stone-900</p>
                        <p className="text-xs text-gray-200">obsidian</p>
                    </div>
                    <div className="p-3 bg-stone-950 rounded text-center">
                        <p className="text-xs text-white">stone-950</p>
                        <p className="text-xs text-gray-200">volcanic</p>
                    </div>
                </div>
            </div>

            {/* Ocean Scale */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Ocean Scale (Professional Water Tones)</h3>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                    <div className="p-3 bg-ocean-50 rounded text-center border border-ocean-200">
                        <p className="text-xs text-gray-800">ocean-50</p>
                        <p className="text-xs text-gray-600">sea foam</p>
                    </div>
                    <div className="p-3 bg-ocean-100 rounded text-center border border-ocean-200">
                        <p className="text-xs text-gray-800">ocean-100</p>
                        <p className="text-xs text-gray-600">shallow</p>
                    </div>
                    <div className="p-3 bg-ocean-200 rounded text-center">
                        <p className="text-xs text-gray-800">ocean-200</p>
                        <p className="text-xs text-gray-600">crystal</p>
                    </div>
                    <div className="p-3 bg-ocean-300 rounded text-center">
                        <p className="text-xs text-gray-800">ocean-300</p>
                        <p className="text-xs text-gray-600">lagoon</p>
                    </div>
                    <div className="p-3 bg-ocean-400 rounded text-center">
                        <p className="text-xs text-white">ocean-400</p>
                        <p className="text-xs text-gray-200">tropical</p>
                    </div>
                    <div className="p-3 bg-ocean-500 rounded text-center">
                        <p className="text-xs text-white">ocean-500</p>
                        <p className="text-xs text-gray-200">ocean</p>
                    </div>
                    <div className="p-3 bg-ocean-600 rounded text-center">
                        <p className="text-xs text-white">ocean-600</p>
                        <p className="text-xs text-gray-200">deep sea</p>
                    </div>
                    <div className="p-3 bg-ocean-700 rounded text-center">
                        <p className="text-xs text-white">ocean-700</p>
                        <p className="text-xs text-gray-200">navy</p>
                    </div>
                    <div className="p-3 bg-ocean-800 rounded text-center">
                        <p className="text-xs text-white">ocean-800</p>
                        <p className="text-xs text-gray-200">midnight</p>
                    </div>
                    <div className="p-3 bg-ocean-900 rounded text-center">
                        <p className="text-xs text-white">ocean-900</p>
                        <p className="text-xs text-gray-200">abyss</p>
                    </div>
                    <div className="p-3 bg-ocean-950 rounded text-center">
                        <p className="text-xs text-white">ocean-950</p>
                        <p className="text-xs text-gray-200">trench</p>
                    </div>
                </div>
            </div>

            {/* Forest Scale */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Forest Scale (Professional Nature Tones)</h3>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                    <div className="p-3 bg-forest-50 rounded text-center border border-forest-200">
                        <p className="text-xs text-gray-800">forest-50</p>
                        <p className="text-xs text-gray-600">dew</p>
                    </div>
                    <div className="p-3 bg-forest-100 rounded text-center border border-forest-200">
                        <p className="text-xs text-gray-800">forest-100</p>
                        <p className="text-xs text-gray-600">leaves</p>
                    </div>
                    <div className="p-3 bg-forest-200 rounded text-center">
                        <p className="text-xs text-gray-800">forest-200</p>
                        <p className="text-xs text-gray-600">spring</p>
                    </div>
                    <div className="p-3 bg-forest-300 rounded text-center">
                        <p className="text-xs text-gray-800">forest-300</p>
                        <p className="text-xs text-gray-600">meadow</p>
                    </div>
                    <div className="p-3 bg-forest-400 rounded text-center">
                        <p className="text-xs text-white">forest-400</p>
                        <p className="text-xs text-gray-200">forest</p>
                    </div>
                    <div className="p-3 bg-forest-500 rounded text-center">
                        <p className="text-xs text-white">forest-500</p>
                        <p className="text-xs text-gray-200">pine</p>
                    </div>
                    <div className="p-3 bg-forest-600 rounded text-center">
                        <p className="text-xs text-white">forest-600</p>
                        <p className="text-xs text-gray-200">evergreen</p>
                    </div>
                    <div className="p-3 bg-forest-700 rounded text-center">
                        <p className="text-xs text-white">forest-700</p>
                        <p className="text-xs text-gray-200">woods</p>
                    </div>
                    <div className="p-3 bg-forest-800 rounded text-center">
                        <p className="text-xs text-white">forest-800</p>
                        <p className="text-xs text-gray-200">floor</p>
                    </div>
                    <div className="p-3 bg-forest-900 rounded text-center">
                        <p className="text-xs text-white">forest-900</p>
                        <p className="text-xs text-gray-200">oak</p>
                    </div>
                    <div className="p-3 bg-forest-950 rounded text-center">
                        <p className="text-xs text-white">forest-950</p>
                        <p className="text-xs text-gray-200">shadow</p>
                    </div>
                </div>
            </div>

            {/* Sand Scale */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Sand Scale (Professional Desert Tones)</h3>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                    <div className="p-3 bg-sand-50 rounded text-center border border-sand-200">
                        <p className="text-xs text-gray-800">sand-50</p>
                        <p className="text-xs text-gray-600">white</p>
                    </div>
                    <div className="p-3 bg-sand-100 rounded text-center border border-sand-200">
                        <p className="text-xs text-gray-800">sand-100</p>
                        <p className="text-xs text-gray-600">beach</p>
                    </div>
                    <div className="p-3 bg-sand-200 rounded text-center">
                        <p className="text-xs text-gray-800">sand-200</p>
                        <p className="text-xs text-gray-600">dune</p>
                    </div>
                    <div className="p-3 bg-sand-300 rounded text-center">
                        <p className="text-xs text-gray-800">sand-300</p>
                        <p className="text-xs text-gray-600">desert</p>
                    </div>
                    <div className="p-3 bg-sand-400 rounded text-center">
                        <p className="text-xs text-gray-800">sand-400</p>
                        <p className="text-xs text-gray-600">golden</p>
                    </div>
                    <div className="p-3 bg-sand-500 rounded text-center">
                        <p className="text-xs text-white">sand-500</p>
                        <p className="text-xs text-gray-200">canyon</p>
                    </div>
                    <div className="p-3 bg-sand-600 rounded text-center">
                        <p className="text-xs text-white">sand-600</p>
                        <p className="text-xs text-gray-200">terracotta</p>
                    </div>
                    <div className="p-3 bg-sand-700 rounded text-center">
                        <p className="text-xs text-white">sand-700</p>
                        <p className="text-xs text-gray-200">adobe</p>
                    </div>
                    <div className="p-3 bg-sand-800 rounded text-center">
                        <p className="text-xs text-white">sand-800</p>
                        <p className="text-xs text-gray-200">earth</p>
                    </div>
                    <div className="p-3 bg-sand-900 rounded text-center">
                        <p className="text-xs text-white">sand-900</p>
                        <p className="text-xs text-gray-200">clay</p>
                    </div>
                    <div className="p-3 bg-sand-950 rounded text-center">
                        <p className="text-xs text-white">sand-950</p>
                        <p className="text-xs text-gray-200">burnt</p>
                    </div>
                </div>
            </div>

            {/* Sky Scale */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Sky Scale (Professional Atmospheric Tones)</h3>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                    <div className="p-3 bg-sky-50 rounded text-center border border-sky-200">
                        <p className="text-xs text-gray-800">sky-50</p>
                        <p className="text-xs text-gray-600">clouds</p>
                    </div>
                    <div className="p-3 bg-sky-100 rounded text-center border border-sky-200">
                        <p className="text-xs text-gray-800">sky-100</p>
                        <p className="text-xs text-gray-600">morning</p>
                    </div>
                    <div className="p-3 bg-sky-200 rounded text-center">
                        <p className="text-xs text-gray-800">sky-200</p>
                        <p className="text-xs text-gray-600">overcast</p>
                    </div>
                    <div className="p-3 bg-sky-300 rounded text-center">
                        <p className="text-xs text-gray-800">sky-300</p>
                        <p className="text-xs text-gray-600">storm</p>
                    </div>
                    <div className="p-3 bg-sky-400 rounded text-center">
                        <p className="text-xs text-white">sky-400</p>
                        <p className="text-xs text-gray-200">gray</p>
                    </div>
                    <div className="p-3 bg-sky-500 rounded text-center">
                        <p className="text-xs text-white">sky-500</p>
                        <p className="text-xs text-gray-200">twilight</p>
                    </div>
                    <div className="p-3 bg-sky-600 rounded text-center">
                        <p className="text-xs text-white">sky-600</p>
                        <p className="text-xs text-gray-200">evening</p>
                    </div>
                    <div className="p-3 bg-sky-700 rounded text-center">
                        <p className="text-xs text-white">sky-700</p>
                        <p className="text-xs text-gray-200">dusk</p>
                    </div>
                    <div className="p-3 bg-sky-800 rounded text-center">
                        <p className="text-xs text-white">sky-800</p>
                        <p className="text-xs text-gray-200">night</p>
                    </div>
                    <div className="p-3 bg-sky-900 rounded text-center">
                        <p className="text-xs text-white">sky-900</p>
                        <p className="text-xs text-gray-200">midnight</p>
                    </div>
                    <div className="p-3 bg-sky-950 rounded text-center">
                        <p className="text-xs text-white">sky-950</p>
                        <p className="text-xs text-gray-200">space</p>
                    </div>
                </div>
            </div>

            {/* Metal Scale */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Metal Scale (Professional Industrial Tones)</h3>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                    <div className="p-3 bg-metal-50 rounded text-center border border-metal-200">
                        <p className="text-xs text-gray-800">metal-50</p>
                        <p className="text-xs text-gray-600">steel</p>
                    </div>
                    <div className="p-3 bg-metal-100 rounded text-center border border-metal-200">
                        <p className="text-xs text-gray-800">metal-100</p>
                        <p className="text-xs text-gray-600">aluminum</p>
                    </div>
                    <div className="p-3 bg-metal-200 rounded text-center">
                        <p className="text-xs text-gray-800">metal-200</p>
                        <p className="text-xs text-gray-600">silver</p>
                    </div>
                    <div className="p-3 bg-metal-300 rounded text-center">
                        <p className="text-xs text-gray-800">metal-300</p>
                        <p className="text-xs text-gray-600">chrome</p>
                    </div>
                    <div className="p-3 bg-metal-400 rounded text-center">
                        <p className="text-xs text-white">metal-400</p>
                        <p className="text-xs text-gray-200">pewter</p>
                    </div>
                    <div className="p-3 bg-metal-500 rounded text-center">
                        <p className="text-xs text-white">metal-500</p>
                        <p className="text-xs text-gray-200">gunmetal</p>
                    </div>
                    <div className="p-3 bg-metal-600 rounded text-center">
                        <p className="text-xs text-white">metal-600</p>
                        <p className="text-xs text-gray-200">iron</p>
                    </div>
                    <div className="p-3 bg-metal-700 rounded text-center">
                        <p className="text-xs text-white">metal-700</p>
                        <p className="text-xs text-gray-200">steel</p>
                    </div>
                    <div className="p-3 bg-metal-800 rounded text-center">
                        <p className="text-xs text-white">metal-800</p>
                        <p className="text-xs text-gray-200">dark</p>
                    </div>
                    <div className="p-3 bg-metal-900 rounded text-center">
                        <p className="text-xs text-white">metal-900</p>
                        <p className="text-xs text-gray-200">carbon</p>
                    </div>
                    <div className="p-3 bg-metal-950 rounded text-center">
                        <p className="text-xs text-white">metal-950</p>
                        <p className="text-xs text-gray-200">black</p>
                    </div>
                </div>
            </div>

            {/* Warm Scale */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Warm Scale (Professional Cozy Tones)</h3>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                    <div className="p-3 bg-warm-50 rounded text-center border border-warm-200">
                        <p className="text-xs text-gray-800">warm-50</p>
                        <p className="text-xs text-gray-600">cream</p>
                    </div>
                    <div className="p-3 bg-warm-100 rounded text-center border border-warm-200">
                        <p className="text-xs text-gray-800">warm-100</p>
                        <p className="text-xs text-gray-600">white</p>
                    </div>
                    <div className="p-3 bg-warm-200 rounded text-center">
                        <p className="text-xs text-gray-800">warm-200</p>
                        <p className="text-xs text-gray-600">peach</p>
                    </div>
                    <div className="p-3 bg-warm-300 rounded text-center">
                        <p className="text-xs text-gray-800">warm-300</p>
                        <p className="text-xs text-gray-600">apricot</p>
                    </div>
                    <div className="p-3 bg-warm-400 rounded text-center">
                        <p className="text-xs text-white">warm-400</p>
                        <p className="text-xs text-gray-200">sunset</p>
                    </div>
                    <div className="p-3 bg-warm-500 rounded text-center">
                        <p className="text-xs text-white">warm-500</p>
                        <p className="text-xs text-gray-200">orange</p>
                    </div>
                    <div className="p-3 bg-warm-600 rounded text-center">
                        <p className="text-xs text-white">warm-600</p>
                        <p className="text-xs text-gray-200">burnt</p>
                    </div>
                    <div className="p-3 bg-warm-700 rounded text-center">
                        <p className="text-xs text-white">warm-700</p>
                        <p className="text-xs text-gray-200">rust</p>
                    </div>
                    <div className="p-3 bg-warm-800 rounded text-center">
                        <p className="text-xs text-white">warm-800</p>
                        <p className="text-xs text-gray-200">copper</p>
                    </div>
                    <div className="p-3 bg-warm-900 rounded text-center">
                        <p className="text-xs text-white">warm-900</p>
                        <p className="text-xs text-gray-200">bronze</p>
                    </div>
                    <div className="p-3 bg-warm-950 rounded text-center">
                        <p className="text-xs text-white">warm-950</p>
                        <p className="text-xs text-gray-200">mahogany</p>
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
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">bg-background</code> - Main app background
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">bg-card</code> - Card/panel backgrounds
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">bg-muted</code> - Subtle/disabled elements
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">bg-primary</code> - Brand/action buttons
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">bg-secondary</code> - Alternative actions
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">bg-destructive</code> - Danger/delete actions
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3 text-primary">Text Colors</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">text-foreground</code> - Primary text
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">text-muted-foreground</code> - Secondary/helper text
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">text-primary</code> - Links/emphasis
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">text-destructive</code> - Errors/warnings
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">text-card-foreground</code> - Text on cards
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3 text-primary">Borders & Outlines</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">border-border</code> - Default borders
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">border-input</code> - Form inputs
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">border-primary</code> - Highlighted borders
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">ring-ring</code> - Focus rings
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3 text-primary">State Modifiers</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">hover:</code> - Mouse over states
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">dark:</code> - Dark mode variants
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">focus:</code> - Focus states
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">active:</code> - Pressed states
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">disabled:</code> - Disabled states
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3 text-primary">Opacity & Effects</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">/50</code> - 50% opacity (bg-primary/50)
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">/90</code> - 90% opacity (hover states)
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">transition-colors</code> - Smooth color changes
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">shadow-lg</code> - Drop shadows
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3 text-primary">Layout Utilities</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">flex</code> - Flexbox container
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">grid</code> - CSS Grid container
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">space-y-4</code> - Vertical spacing
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">gap-4</code> - Grid/flex gaps
                            </li>
                            <li>
                                <code className="bg-background px-2 py-1 rounded border border-border">rounded-lg</code> - Border radius
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-card rounded-lg border border-border">
                    <h4 className="font-semibold mb-2 text-primary">Why Use Semantic Colors?</h4>
                    <p className="text-sm text-muted-foreground">
                        Semantic colors like <code>bg-muted</code> and <code>text-muted-foreground</code> automatically adapt between light and dark modes. They maintain consistent meaning across themes, making your UI more maintainable and accessible.
                    </p>
                </div>
            </div>
        </div>
    );
}
