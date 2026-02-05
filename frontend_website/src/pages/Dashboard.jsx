export default function Dashboard() {

    const cards = [
        { label: "Active Drivers", value: "12"},
        { label: "Open Assignments", value: "7" },
        { label: "Reports Today", value: "15" },
        { label: "Flagged Entries", value: "2" },

    ];

    return (

        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-600 text-sm">Placeholder metrics for now.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
                {cards.map((item) => (

                    <div key={item.label} className="rounded-2xl bg-white border p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {item.value}
                        </p>
            </div>

            ))}
           </div>

           <div className="rounded-2xl bg-white border p-6 shadow-sm">
                <h2 className="font-semibold">Recent Activity</h2>

                <ul className="mt-4 space-y-3 text-sm text-gray-700">
                    <li className="flex justify-between">
                        <span>Report received: Driver #42</span>
                        <span className="text-gray-500">10:12 AM</span>
                    </li>

                    <li className="flex justify-between">
                        <span>Assignment created: "Deliver supplies"</span>
                        <span className="text-gray-500">9:40 AM</span>
                    </li>

                    <li className="flex justify-between">
                        <span>Flagged manual note: Driver #19</span>
                        <span className="text-gray-500">Yesterday</span>
                    </li>
                </ul>
           </div>

        </div>

    );

}