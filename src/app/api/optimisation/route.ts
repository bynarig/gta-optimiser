"use server";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await req.formData();
	console.log(body);
	return NextResponse.json({}, { status: 201 });
	// return await
}
