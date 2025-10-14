import { ENTITY_DATA } from "../../../../config/entities";
import LabelTag from "../../../components/LabelTag";
import { getSchools } from "../../../../actions/schools-action";
import { getSchoolName } from "../../../../getters/schools-getter";

export default async function SchoolsPage() {
  const entity = ENTITY_DATA.find(e => e.id === "School")!;
  const borderColor = entity.color.replace("text-", "border-");
  const schoolsResult = await getSchools();
  const schools = schoolsResult.success ? schoolsResult.data : [];

  return (
    <div className="p-8">
      <LabelTag
        icon={entity.icon}
        title={`Hello, ${entity.name} Page`}
        description={entity.description}
        borderColor={borderColor}
        textColor={entity.color}
      />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">All Schools</h2>
        {schools.length === 0 ? (
          <p className="text-muted-foreground">No schools found</p>
        ) : (
          <div className="space-y-4">
            {schools.map((school) => (
              <div
                key={school.id}
                className="bg-card border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-foreground">{school.name}</h3>
                    <p className="text-sm text-muted-foreground">Country: {school.country}</p>
                    <p className="text-sm text-muted-foreground">Phone: {school.phone}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {school.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
