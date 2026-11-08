"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc";

export function Hello() {
  const trpc = useTRPC();
  const hello = useQuery(trpc.hello.queryOptions({ name: "tRPC" }));

  // WIP: mutation
  const status = useQuery(trpc.registerDirector.queryOptions({ key: "_KEY_" }));

  if (hello.isPending) return <p>Loading...</p>;
  if (hello.isError) return <p>Error: {hello.error.message}</p>;
  return (
    <>
      <p>{hello.data.greeting}</p>
    </>
  );
}
