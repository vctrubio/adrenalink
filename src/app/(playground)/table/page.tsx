import { TABLE_CONFIG, HIDDEN_ENTITIES } from "@/config/tables";
import { getEntityCount } from "@/getters/entities-getter";
import TableClient from "./TableClient";

const HIDDEN_ENTITY_IDS = HIDDEN_ENTITIES.map(e => e.id);

export default async function TablePage() {
  const entitiesWithCounts = await Promise.all(
    TABLE_CONFIG.map(async entity => {
      const count = await getEntityCount(entity.id);
      const { icon, ...serializableEntity } = entity;
      return {
        ...serializableEntity,
        count,
        isHidden: HIDDEN_ENTITY_IDS.includes(entity.id),
      };
    })
  );

  return <TableClient entities={entitiesWithCounts} />;
}
