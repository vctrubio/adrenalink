"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import type { SchoolType, SchoolPackageType, StudentPackageType } from "@/drizzle/schema";
import type { SerializedAbstractModel } from "@/backend/models";
import SchoolStudentView from "@/src/portals/SchoolStudentView";
import SchoolAdminView from "@/src/portals/SchoolAdminView";

interface SchoolClientPageProps {
    school: SerializedAbstractModel<SchoolType>;
}

export default function SchoolClientPage({ school }: SchoolClientPageProps) {
    // Extract and prepare data from school relations
    const schoolPackages: SerializedAbstractModel<SchoolPackageType>[] = 
        (school as any).relations?.schoolPackages?.map((pkg: any) => ({
            schema: pkg,
            relations: { 
                school: {
                    id: school.schema.id,
                    name: school.schema.name,
                    username: school.schema.username
                },
                studentPackages: pkg.studentPackages || []
            },
            lambda: {
                durationHours: pkg.durationMinutes / 60,
                revenue: pkg.pricePerStudent * pkg.capacityStudents,
                studentPricePerHour: pkg.durationMinutes > 0 ? pkg.pricePerStudent / (pkg.durationMinutes / 60) : 0,
                revenuePerHour: pkg.durationMinutes > 0 ? (pkg.pricePerStudent * pkg.capacityStudents) / (pkg.durationMinutes / 60) : 0,
            }
        })) || [];

    // Extract student package requests from all packages
    const studentPackageRequests: SerializedAbstractModel<StudentPackageType>[] = 
        schoolPackages.flatMap(pkg => 
            pkg.relations?.studentPackages?.map((studentPkg: any) => ({
                schema: studentPkg,
                relations: {
                    student: studentPkg.student,
                    schoolPackage: pkg.schema
                },
                lambda: {}
            })) || []
        );

    return (
        <div className="space-y-6">
            <TabGroup>
                <TabList className="flex space-x-1 rounded-xl bg-muted p-1">
                    <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all data-[selected]:tab-active data-[hover]:bg-card/50 data-[hover]:text-foreground tab-inactive">
                        Student Portal
                    </Tab>
                    <Tab className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all data-[selected]:tab-active data-[hover]:bg-card/50 data-[hover]:text-foreground tab-inactive">
                        Admin Portal
                    </Tab>
                </TabList>
                <TabPanels className="mt-6">
                    <TabPanel className="rounded-xl focus:outline-none">
                        <SchoolStudentView school={school} schoolId={school.schema.id} packages={schoolPackages} />
                    </TabPanel>
                    <TabPanel className="rounded-xl focus:outline-none">
                        <SchoolAdminView 
                            school={school} 
                            schoolId={school.schema.id}
                            packages={schoolPackages} 
                            studentPackageRequests={studentPackageRequests} 
                        />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
}
