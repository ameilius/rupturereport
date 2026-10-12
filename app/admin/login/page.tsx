import { Suspense } from "react";
import { loginAction } from "../actions";
import { Field, Flash, Input, btnCls, type SP } from "@/components/admin/ui";

export default function LoginPage({ searchParams }: { searchParams: SP }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold">Rupture Report Admin</h1>
      <Suspense>
        <LoginFlash searchParams={searchParams} />
      </Suspense>
      <form action={loginAction} className="space-y-4">
        <Field label="Password" name="password">
          <Input name="password" type="password" autoComplete="current-password" required autoFocus />
        </Field>
        <button type="submit" className={`${btnCls} w-full`}>
          Sign in
        </button>
      </form>
    </main>
  );
}

async function LoginFlash({ searchParams }: { searchParams: SP }) {
  return <Flash searchParams={await searchParams} />;
}
