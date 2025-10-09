"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-gray-400">Loading...</p>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-white">Hello, {session.user?.name}</span>
        <button
          onClick={() => signOut()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-5 h-5"
      >
        <path
          fill="#4285F4"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.67 2.36 30.27 0 24 0 14.64 0 6.47 5.38 2.69 13.22l7.98 6.19C12.31 12.36 17.74 9.5 24 9.5z"
        />
        <path
          fill="#34A853"
          d="M46.1 24.55c0-1.61-.15-3.15-.42-4.64H24v9.19h12.45c-.54 2.79-2.16 5.15-4.6 6.74l7.14 5.55c4.18-3.86 6.56-9.55 6.56-16.84z"
        />
        <path
          fill="#FBBC05"
          d="M10.67 28.41c-.47-1.39-.73-2.87-.73-4.41s.26-3.02.73-4.41l-7.98-6.19C.94 16.46 0 20.1 0 24s.94 7.54 2.69 10.6l7.98-6.19z"
        />
        <path
          fill="#EA4335"
          d="M24 48c6.48 0 11.92-2.14 15.89-5.82l-7.14-5.55c-2.01 1.34-4.6 2.13-8.75 2.13-6.26 0-11.69-3.86-13.61-9.23l-7.98 6.19C6.47 42.62 14.64 48 24 48z"
        />
      </svg>
      Sign in with Google
    </button>
  );
}
