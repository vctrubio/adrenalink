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
import { getEventStatusColor, getEventStatusLabel } from "@/types/status";
import { getTransactions } from "@/actions/transactions-action";

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

                  const statusColor = getEventStatusColor(transaction.status as any);
                  const statusLabel = getEventStatusLabel(transaction.status as any);

                  return (
                    <tr key={transaction.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{formatDateFromTimestamp(transaction.date)}</td>
                      <td className="px-4 py-3 text-sm font-mono">{formatTimeFromDate(transaction.date)}</td>
                      <td className="px-4 py-3 text-sm">{getPrettyDuration(transaction.duration)}</td>
                      <td className="px-4 py-3 text-sm font-medium">{transaction.teacher.username}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ color: statusColor, backgroundColor: `${statusColor}20` }}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getEquipmentForNow(transaction.package.categoryEquipment, transaction.package.capacityEquipment, transaction.equipment)}
                      </td>
                      <td className="px-4 py-3 text-sm">{getStudentNames(transaction.students)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">${schoolRevenue.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">${teacherCommissionAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">${schoolLeftover.toFixed(2)}</td>
                    </tr>
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
