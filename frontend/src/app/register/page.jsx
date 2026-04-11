import { RegisterForm } from '@/components/auth/register-form'
import Link from "next/link"
export const metadata = {
  title: "Register | interview Matrix",
  description: "Make your interview amtrix account to start applying.",
};
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-balance">Create your account</h1>
          <p className="text-muted-foreground text-lg">Start optimizing your interview skills</p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground mt-6">
          {"Already have an account? "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}