import { unstable_cache } from "next/cache";
import { supabase } from ".";
import { ENTITY_DATA } from "@/config/entities";

export interface HomeRow {
    id: string;
    label: string;
    href: string;
}

export interface HomeEntity {
    id: string;
    name: string;
    link: string;
    color: string;
    bgColor: string;
    active: HomeRow[];
    inactive: HomeRow[];
}

const ENTITY_ORDER = ["booking", "student", "teacher", "equipment", "schoolPackage"] as const;

function getEntityMeta(entityId: string) {
    const meta = ENTITY_DATA.find((e) => e.id === entityId);
    if (!meta) {
        throw new Error(`Entity metadata not found for ${entityId}`);
    }
    return meta;
}

const getBookings = unstable_cache(
    async (schoolId: string) => {
        const { data, error } = await supabase
            .from("booking")
            .select("id, leader_student_name, status")
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Home bookings query error:", error);
            return { active: [], inactive: [] } as { active: HomeRow[]; inactive: HomeRow[] };
        }

        const active: HomeRow[] = [];
        const inactive: HomeRow[] = [];

        for (const row of data || []) {
            const item: HomeRow = {
                id: row.id,
                label: row.leader_student_name || "Booking",
                href: `/bookings/${row.id}`,
            };
            if (row.status === "active") {
                active.push(item);
            } else {
                inactive.push(item);
            }
        }

        return { active, inactive };
    },
    ["home-bookings"],
    { revalidate: 60 }
);

const getStudents = unstable_cache(
    async (schoolId: string) => {
        const { data, error } = await supabase
            .from("school_students")
            .select("id, active, student(id, first_name, last_name)")
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Home students query error:", error);
            return { active: [], inactive: [] } as { active: HomeRow[]; inactive: HomeRow[] };
        }

        const active: HomeRow[] = [];
        const inactive: HomeRow[] = [];

        for (const row of data || []) {
            const student = Array.isArray(row.student) ? row.student[0] : row.student;
            const label = student ? `${student.first_name} ${student.last_name}`.trim() : "Student";
            const studentId = student?.id || row.id;
            const item: HomeRow = {
                id: studentId,
                label,
                href: `/students/${studentId}`,
            };
            if (row.active) {
                active.push(item);
            } else {
                inactive.push(item);
            }
        }

        return { active, inactive };
    },
    ["home-students"],
    { revalidate: 60 }
);

const getTeachers = unstable_cache(
    async (schoolId: string) => {
        const { data, error } = await supabase
            .from("teacher")
            .select("id, first_name, last_name, username, active")
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Home teachers query error:", error);
            return { active: [], inactive: [] } as { active: HomeRow[]; inactive: HomeRow[] };
        }

        const active: HomeRow[] = [];
        const inactive: HomeRow[] = [];

        for (const row of data || []) {
            const label = row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : row.username || "Teacher";
            const item: HomeRow = {
                id: row.id,
                label,
                href: `/teachers/${row.id}`,
            };
            if (row.active) {
                active.push(item);
            } else {
                inactive.push(item);
            }
        }

        return { active, inactive };
    },
    ["home-teachers"],
    { revalidate: 60 }
);

const getEquipment = unstable_cache(
    async (schoolId: string) => {
        const { data, error } = await supabase
            .from("equipment")
            .select("id, model, status, category")
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Home equipment query error:", error);
            return { active: [], inactive: [] } as { active: HomeRow[]; inactive: HomeRow[] };
        }

        const active: HomeRow[] = [];
        const inactive: HomeRow[] = [];

        for (const row of data || []) {
            const label = row.model || row.category || "Equipment";
            const item: HomeRow = {
                id: row.id,
                label,
                href: `/equipments/${row.id}`,
            };
            const isActive = row.status && !["sold", "rip"].includes(row.status);
            if (isActive) {
                active.push(item);
            } else {
                inactive.push(item);
            }
        }

        return { active, inactive };
    },
    ["home-equipment"],
    { revalidate: 60 }
);

const getSchoolPackages = unstable_cache(
    async (schoolId: string) => {
        const { data, error } = await supabase
            .from("school_package")
            .select("id, description, active")
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Home packages query error:", error);
            return { active: [], inactive: [] } as { active: HomeRow[]; inactive: HomeRow[] };
        }

        const active: HomeRow[] = [];
        const inactive: HomeRow[] = [];

        for (const row of data || []) {
            const label = row.description || "Package";
            const item: HomeRow = {
                id: row.id,
                label,
                href: `/packages/${row.id}`,
            };
            if (row.active) {
                active.push(item);
            } else {
                inactive.push(item);
            }
        }

        return { active, inactive };
    },
    ["home-packages"],
    { revalidate: 60 }
);

export async function getHomeEntities(schoolId: string): Promise<HomeEntity[]> {
    const entities: HomeEntity[] = [];

    // Bookings
    {
        const meta = getEntityMeta("booking");
        const { active, inactive } = await getBookings(schoolId);
        entities.push({ id: meta.id, name: meta.name, link: meta.link, color: meta.color, bgColor: meta.bgColor, active, inactive });
    }

    // Students
    {
        const meta = getEntityMeta("student");
        const { active, inactive } = await getStudents(schoolId);
        entities.push({ id: meta.id, name: meta.name, link: meta.link, color: meta.color, bgColor: meta.bgColor, active, inactive });
    }

    // Teachers
    {
        const meta = getEntityMeta("teacher");
        const { active, inactive } = await getTeachers(schoolId);
        entities.push({ id: meta.id, name: meta.name, link: meta.link, color: meta.color, bgColor: meta.bgColor, active, inactive });
    }

    // Equipment
    {
        const meta = getEntityMeta("equipment");
        const { active, inactive } = await getEquipment(schoolId);
        entities.push({ id: meta.id, name: meta.name, link: meta.link, color: meta.color, bgColor: meta.bgColor, active, inactive });
    }

    // Packages
    {
        const meta = getEntityMeta("schoolPackage");
        const { active, inactive } = await getSchoolPackages(schoolId);
        entities.push({ id: meta.id, name: meta.name, link: meta.link, color: meta.color, bgColor: meta.bgColor, active, inactive });
    }

    return entities;
}
