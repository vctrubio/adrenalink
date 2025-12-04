import { getPrettyDuration } from "@/getters/duration-getter";
import {
  getEquipmentForNow,
  getTeacherCommission,
  getSchoolRevenue,
  getSchoolLeftover,
  getStudentNames,
  formatTimeFromDate,
  formatDateFromTimestamp,
} from "@/getters/transactions-getter";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { getTransactions } from "@/actions/transactions-action";
import TransactionRow from "./TransactionRow";

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">All events and their revenue breakdown</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Teacher</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Equipment</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Students</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Revenue</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Teacher Commission</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">School Leftover</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const teacherCommissionAmount = transaction.commission
                    ? getTeacherCommission(transaction.commission.type, transaction.commission.cph, transaction.duration)
                    : 0;

                  const schoolRevenue = getSchoolRevenue(transaction.package.pricePerStudent, transaction.students.length, transaction.duration, transaction.package.durationMinutes);
                  const schoolLeftover = getSchoolLeftover(schoolRevenue, teacherCommissionAmount);

                  return (
                    <TransactionRow
                      key={transaction.id}
                      eventId={transaction.id}
                      date={formatDateFromTimestamp(transaction.date)}
                      time={formatTimeFromDate(transaction.date)}
                      duration={getPrettyDuration(transaction.duration)}
                      teacher={transaction.teacher.username}
                      statusColor={EVENT_STATUS_CONFIG[transaction.status as any].color}
                      statusLabel={EVENT_STATUS_CONFIG[transaction.status as any].label}
                      equipment={getEquipmentForNow(transaction.package.categoryEquipment, transaction.package.capacityEquipment, transaction.equipment)}
                      students={getStudentNames(transaction.students)}
                      revenue={schoolRevenue.toFixed(2)}
                      commission={teacherCommissionAmount.toFixed(2)}
                      leftover={schoolLeftover.toFixed(2)}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">
                $
                {transactions
                  .reduce((sum, transaction) => {
                    const revenue = getSchoolRevenue(transaction.package.pricePerStudent, transaction.students.length, transaction.duration, transaction.package.durationMinutes);
                    return sum + revenue;
                  }, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Teacher Commission</p>
              <p className="text-2xl font-bold text-foreground">
                $
                {transactions
                  .reduce((sum, transaction) => {
                    if (!transaction.commission) return sum;
                    return sum + getTeacherCommission(transaction.commission.type, transaction.commission.cph, transaction.duration);
                  }, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total School Leftover</p>
              <p className="text-2xl font-bold text-foreground">
                $
                {transactions
                  .reduce((sum, transaction) => {
                    const revenue = getSchoolRevenue(transaction.package.pricePerStudent, transaction.students.length, transaction.duration, transaction.package.durationMinutes);
                    const commission = transaction.commission ? getTeacherCommission(transaction.commission.type, transaction.commission.cph, transaction.duration) : 0;
                    return sum + getSchoolLeftover(revenue, commission);
                  }, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
