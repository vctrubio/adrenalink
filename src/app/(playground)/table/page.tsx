import { ENTITY_DATA } from "@/config/entities";
import { getEntityCount } from "@/getters/entities-getter";
import TableClient from "./TableClient";

export default async function TablePage() {
  const entitiesWithCounts = await Promise.all(
    ENTITY_DATA.map(async (entity) => {
      const count = await getEntityCount(entity.id);
      return {
        ...entity,
        count
      };
    })
  );

  return <TableClient entities={entitiesWithCounts} />;
}
