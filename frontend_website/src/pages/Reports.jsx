export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-gray-600 text-sm">Placeholder summaries.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border p-6 shadow-sm">
          <h2 className="font-semibold">Employee Report</h2>
          <p className="mt-2 text-sm text-gray-600">Sent back to the mobile app.</p>
          <div className="mt-4 text-sm">
            <p><span className="text-gray-500">Miles:</span> 38.2</p>
            <p><span className="text-gray-500">Stops:</span> 14</p>
            <p><span className="text-gray-500">Idle Time:</span> 22m</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border p-6 shadow-sm">
          <h2 className="font-semibold">Employer Report</h2>
          <p className="mt-2 text-sm text-gray-600">Aggregate view.</p>
          <div className="mt-4 text-sm">
            <p><span className="text-gray-500">Avg. route time:</span> 2h 14m</p>
            <p><span className="text-gray-500">Utilization:</span> 78%</p>
            <p><span className="text-gray-500">Flagged:</span> 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}