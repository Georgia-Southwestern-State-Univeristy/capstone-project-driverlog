export default function Flagged() {
  const flaggedEntries = [
    {
      id: 1,
      driver: "Driver #19",
      reason: "Manual entry changed after submission",
      severity: "High",
      date: "Feb 3, 2026",
    },
    {
      id: 2,
      driver: "Driver #42",
      reason: "End-of-day report was not submitted",
      severity: "Medium",
      date: "Feb 4, 2026",
    },
    {
      id: 3,
      driver: "Driver #7",
      reason: "Reported mileage does not match expected route",
      severity: "Low",
      date: "Feb 4, 2026",
    },
  ];

  const severityStyles = {
    High: "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flagged Entries</h1>
          <p className="text-sm text-gray-600">
            Review and resolve flagged driver logs.
          </p>
        </div>

        <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
          Export
        </button>
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">
                Driver
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">
                Reason
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">
                Severity
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">
                Date
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {flaggedEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900 font-medium">
                  {entry.driver}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {entry.reason}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${severityStyles[entry.severity]}`}
                  >
                    {entry.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {entry.date}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="rounded-xl bg-gray-50 border p-4">
        <p className="text-sm text-gray-600">
          <strong>Tip:</strong> High-severity entries should be reviewed before exporting reports.
        </p>
      </div>
    </div>
  );
}