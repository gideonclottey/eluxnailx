import { redirect } from 'next/navigation'

// Root → booking page
export default function Home() {
  redirect('/book')
}
