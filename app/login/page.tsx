import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center py-16">
      <div className="rounded-lg border border-border bg-white p-8">
        <h1 className="text-xl font-semibold text-foreground">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log in to manage your reviews.
        </p>

        <form className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@alustudent.com"
              disabled
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground disabled:bg-muted"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              disabled
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground disabled:bg-muted"
            />
            <div className="mt-1.5 text-right">
              <Button variant="link" size="sm" type="button" disabled>
                Forgot password?
              </Button>
            </div>
          </div>

          <Button variant="primary" className="w-full" type="button" disabled>
            Log in
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          New to InternGuide?{" "}
          <Link href="/login" className="text-accent-600 hover:text-accent-700">
            Create an account
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        This is a placeholder page .
      </p>
    </div>
  );
}