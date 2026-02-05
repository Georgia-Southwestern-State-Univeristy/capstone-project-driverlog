export default function Assignments() {
  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold">Assignments</h1>
        <p className="text-gray-600 text-sm">
          UI only — backend later.
        </p>
      </div>

      {/* Assignment form */}
      <div className="rounded-2xl bg-white border p-6 shadow-sm">
        <h2 className="font-semibold">Create Assignment</h2>

        <form className="mt-4 grid md:grid-cols-3 gap-4">

          {/* Assignment title */}
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Title"
          />

          {/* Driver identifier */}
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Driver ID / Email"
          />

          {/* Priority dropdown */}
          <select className="border rounded-xl px-3 py-2">
            <option>Priority: Normal</option>
            <option>Priority: High</option>
          </select>

          {/* Instructions */}
          <textarea
            className="border rounded-xl px-3 py-2 md:col-span-3"
            placeholder="Notes / instructions"
            rows={4}
          />

          {/* Submit button (placeholder) */}
          <button
            type="button"
            className="md:col-span-3 rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
          >
            Save (placeholder)
          </button>

        </form>
      </div>

      {/* Assignments table */}
      <div className="rounded-2xl bg-white border p-6 shadow-sm">
        <h2 className="font-semibold">Open Assignments</h2>

        <table className="w-full text-sm mt-4">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="py-2">Title</th>
              <th>Driver</th>
              <th>Status</th>
              <th className="text-right">Updated</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {[
              { title: "Deliver supplies", driver: "#1042", status: "Open", updated: "Today" },
              { title: "Pick up returns", driver: "#1019", status: "In progress", updated: "Yesterday" },
            ].map((r) => (

              <tr key={r.title}>
                <td className="py-3 font-medium">{r.title}</td>
                <td>{r.driver}</td>
                <td>{r.status}</td>
                <td className="text-right text-gray-500">{r.updated}</td>
              </tr>

            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
}