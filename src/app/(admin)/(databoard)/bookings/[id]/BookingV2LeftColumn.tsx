import { Card, CardHeader } from "@/src/components/ui/card";
import { CardList } from "@/src/components/ui/card/card-list";
import { ENTITY_DATA } from "@/config/entities";
import type { BookingModel } from "@/backend/models";

interface BookingV2LeftColumnProps {
  booking: BookingModel;
}

export function BookingV2LeftColumn({ booking }: BookingV2LeftColumnProps) {
  const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
  const bookingStudents = booking.relations?.bookingStudents || [];

  const StudentIcon = studentEntity.icon;

  const studentFields = bookingStudents.map((bs) => {
    const studentName = bs.student ? `${bs.student.firstName} ${bs.student.lastName}` : "Unknown";
    const isLeader = studentName === booking.schema.leaderStudentName;
    return {
      label: isLeader ? "Leader" : studentName,
      value: isLeader ? studentName : "",
    };
  });

  return (
    <Card accentColor={studentEntity.color}>
      <CardHeader
        name={booking.schema.leaderStudentName}
        status="Leader"
        avatar={
          <div className="flex-shrink-0" style={{ color: studentEntity.color }}>
            <StudentIcon className="w-10 h-10" />
          </div>
        }
        accentColor={studentEntity.color}
      />
      <CardList fields={studentFields.length > 0 ? studentFields : [{ label: "Students", value: "No students assigned" }]} />
    </Card>
  );
}
