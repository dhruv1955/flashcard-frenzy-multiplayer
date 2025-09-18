import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-6 shadow-sm">
        <AuthForm />
      </div>
    </div>
  );
}


