"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function AdminQuoteActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  async function setStatus(status: "accepted" | "declined") {
    await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh(); // reloads table after update
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => start(() => setStatus("accepted"))}
        disabled={pending}
        className="bg-green-600 hover:bg-green-500 disabled:opacity-60 px-3 py-1 rounded"
      >
        Accept
      </button>
      <button
        onClick={() => start(() => setStatus("declined"))}
        disabled={pending}
        className="bg-red-600 hover:bg-red-500 disabled:opacity-60 px-3 py-1 rounded"
      >
        Decline
      </button>
    </div>
  );
}
