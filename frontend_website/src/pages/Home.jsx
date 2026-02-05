import { Link } from "react-router-dom";

export default function Home() {
    return (
        <section classname="space-y-8">

            <div classname="bg-white border rounded-2xl p-8">
                <h1 className="text-3xl font-bold">DriverLog</h1>

                <p className="mt-3 text-gray-600">Employer portal for assigning tasks and reviewing reports</p>

                <div className="mt-6 flex gap-3">

                    <Link to="/dashboard" className="bg-gray-900 text-white px-4 py-2 rounded-xl">Go to Dashboard</Link>

                    <Link to="/assignments" className="border px-4 py-2 rounded-xl">View Assignmnets</Link>



                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">

                {[

                    { title: "Assignments", desc: "Send work to drivers."},
                    { title: "Reports", desc: "View driver activity."},
                    { title: "Moderation", desc: "Flag bad entries."},
                ].map((item) => (

                    <div key={item.title} className="bg-white border rounded-2xl p-6"> 


                        <h2 className="font-semibold">{item.title}</h2>
                        <p className="text-sm text-gray-600">{item.desc}</p>


                    </div>

                ))}

            </div>

        </section>
    );
}
