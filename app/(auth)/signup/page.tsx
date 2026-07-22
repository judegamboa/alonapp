import { AuthForm } from "../auth-form";
import { signUp } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  return (
    <AuthForm mode="signup" action={signUp} error={error} message={message} />
  );
}
