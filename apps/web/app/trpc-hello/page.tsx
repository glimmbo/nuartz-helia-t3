import { Hello } from "@/components/hello"

export default function TrpcHelloPage() {
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-4">tRPC hello world</h1>
      <Hello />
    </div>
  )
}
