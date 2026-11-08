"use client";
import { Hello } from "@/components/hello";
import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function RegisterDirectorPage() {
  const trpc = useTRPC();
  const params = useParams();

  const { data, isLoading } = useQuery(trpc.helloHelia.queryOptions());
  const { data: dataStuff } = useQuery(
    trpc.otherRoute.stuff.queryOptions("there"),
  );
  // WIP: register mutation

  if (isLoading) return "Loading...";

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto w-full">
      <h1>{dataStuff}</h1>
      <h2>Node Status: {data?.status}</h2>
      <pre>{JSON.stringify(data?.info)}</pre>
      <pre>{JSON.stringify(data?.key)}</pre>
    </div>
  );
}
