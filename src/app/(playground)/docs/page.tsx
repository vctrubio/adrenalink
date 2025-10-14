import { ENTITY_DATA } from "../../../../config/entities";

export default function DocsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Entity Documentation</h1>
        <p className="text-muted-foreground">
          Complete overview of all entities in the system with their icons, colors, and descriptions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ENTITY_DATA.map((entity) => {
          const IconComponent = entity.icon;
          return (
            <div
              key={entity.id}
              className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              style={{ backgroundColor: entity.hoverColor }}
            >
              {/* Header with icon and name */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-lg ${entity.bgColor}`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{entity.name}</h2>
                  <span className="text-sm text-muted-foreground">ID: {entity.id}</span>
                  <span className={`text-sm ${entity.color}`}>
                    {entity.color}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Description:
                </h3>
                <ul className="text-sm space-y-1">
                  {entity.description.map((desc, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {entity.link}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BG Color:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {entity.bgColor}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hover:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {entity.hoverColor}
                  </code>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-12 p-6 bg-card rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Entity Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {ENTITY_DATA.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Entities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {ENTITY_DATA.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Routes
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              13
            </div>
            <div className="text-sm text-muted-foreground">
              Custom Icons
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {new Set(ENTITY_DATA.map(e => e.color)).size}
            </div>
            <div className="text-sm text-muted-foreground">Unique Colors</div>
          </div>
        </div>
      </div>
    </div>
  );
}
