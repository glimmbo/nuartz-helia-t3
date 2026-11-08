import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // clog
    console.log(`\n\n`);
    console.dir(body, { depth: 10 });
    console.log(`\n\n`);

    // TODO: Validate the request body and register the director.
    return NextResponse.json({ success: true, data: body }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }
}
