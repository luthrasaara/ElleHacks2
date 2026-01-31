// Make sure it says 'export function Accounts'
export function Accounts({ username, onBack }: { username: string, onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1>Account Page</h1>
      <p>Welcome, {username}</p>
      <button onClick={onBack} className="mt-4 p-2 bg-cyan-600 rounded">
        Back to Dashboard
      </button>
    </div>
  );
}