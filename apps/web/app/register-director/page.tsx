"use client";
import { Hello } from "@/components/hello";
import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function RegisterDirectorPage() {
  const trpc = useTRPC();
  const params = useParams();

  // clog
  console.log(`\n\n`);
  console.dir({ params }, { depth: 10 });
  console.log(`\n\n`);

  const { data, isLoading } = useQuery(trpc.helloHelia.queryOptions());

  if (isLoading) return "Loading...";

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-4">tRPC hello world</h1>
      <h2>Node Status: {data?.status}</h2>
      <pre>{JSON.stringify(data?.info)}</pre>
      <Hello />
    </div>
  );
}
