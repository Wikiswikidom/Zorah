"use client"

import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button type="submit" disabled={pending}>{pending ? "Signing in…" : "Enter admin workspace"}<span>→</span></button>
}

export function AdminLoginForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return <form action={action} className="admin-login-form"><input type="hidden" name="next" value="/admin" /><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><SubmitButton /><small>Administrator access is role-checked on the server. The URL itself does not grant access.</small></form>
}
