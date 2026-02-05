export default function Login() {
  return (
    <div className="max-w-md mx-auto rounded-2xl bg-white border p-8 shadow-sm">
      <h1 className="text-xl font-bold">Login</h1>
      <p className="mt-2 text-sm text-gray-600">
        Placeholder — later connect Firebase/Auth.
      </p>

      <form className="mt-6 space-y-3">
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Email" />
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Password" type="password" />
        <button
          type="button"
          className="w-full rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          Sign in (placeholder)
        </button>
      </form>
    </div>
  );
}