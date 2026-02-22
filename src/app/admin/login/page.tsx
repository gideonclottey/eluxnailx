import { login } from '@/actions/admin'

export const metadata = { title: 'Admin Login' }

// searchParams is async in Next.js 15
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const hasError = params.error === '1'

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#fdf8f9' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💅</div>
          <h1 className="text-2xl font-bold text-[#2d2d2d]">Admin Login</h1>
          <p className="text-gray-400 text-sm mt-1">Nail Studio Dashboard</p>
        </div>

        <form action={login} className="bg-white rounded-2xl shadow-sm border border-[#e8c5d2] p-8 grid gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2d2d2d] mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              placeholder="Enter admin password"
              className="w-full p-3 border-2 border-[#e8c5d2] rounded-xl focus:outline-none focus:border-[#d4688e] transition-colors"
            />
          </div>

          {hasError && (
            <p className="text-sm text-red-500 font-medium">Incorrect password. Try again.</p>
          )}

          <button
            type="submit"
            className="w-full py-3 text-white font-semibold rounded-xl transition-colors"
            style={{ backgroundColor: '#d4688e' }}
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  )
}
