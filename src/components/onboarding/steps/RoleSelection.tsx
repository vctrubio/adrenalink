"use client";

import { ENTITY_DATA } from "@/config/entities";
import { motion } from "framer-motion";

const ROLE_ENTITIES = ["school", "student", "teacher"];

export default function RoleSelection() {
  const roleEntities = ENTITY_DATA.filter((entity) =>
    ROLE_ENTITIES.includes(entity.id)
  );

  const handleRoleSelect = (roleId: string) => {
    console.log("Selected role:", roleId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-16 w-full flex justify-center"
    >
      <div className="flex gap-12 md:gap-16">
        {roleEntities.map((entity, index) => {
          const IconComponent = entity.icon;
          const isMuted = entity.id === "school";
          const displayName = entity.id === "school" ? "Admin" : entity.name;
          const iconColor = isMuted ? "#9ca3af" : entity.color;

          return (
            <motion.div
              key={entity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleRoleSelect(entity.id)}
              className="flex flex-col items-center gap-4 cursor-pointer"
            >
              <div style={{ color: iconColor }}>
                <IconComponent width={48} height={48} />
              </div>
              <h3 className={`text-lg font-semibold ${isMuted ? "text-muted-foreground" : "text-foreground"}`}>
                {displayName}
              </h3>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
