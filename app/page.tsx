import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const { userId } = await auth();

    if (userId) {
      redirect("/dashboard");
    } else {
      redirect("/login");
    }
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT" || (error.digest && error.digest.includes("NEXT_REDIRECT"))) {
      throw error;
    }

    console.error("Home Page Error:", error);

    // Render a helpful error screen if it's a configuration issue
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center font-sans">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Application Configuration Error</h1>
        <p className="text-slate-600 mb-6 max-w-lg">
          The server failed to initialize. Additional details:
        </p>
        <pre className="bg-slate-100 p-4 rounded-lg text-sm text-left overflow-auto max-w-full text-red-800 border border-red-200">
          {error.message || JSON.stringify(error)}
        </pre>
        <p className="mt-6 text-sm text-slate-500">
          Please check your Vercel Project Settings &gt; Environment Variables.
        </p>
      </div>
    );
  }
}
