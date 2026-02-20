import { auth } from "@/auth";
import { NextResponse } from "next/server";

const CLASSROOM_API = "https://classroom.googleapis.com/v1";

export async function GET(request) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  try {
    const courseworkRes = await fetch(`${CLASSROOM_API}/courses/${courseId}/courseWork`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!courseworkRes.ok) {
      throw new Error("Failed to fetch coursework");
    }

    const coursework = await courseworkRes.json();

    return NextResponse.json({ coursework });
  } catch (error) {
    console.error("Failed to fetch coursework:", error);
    return NextResponse.json(
      { error: "Failed to fetch coursework" },
      { status: 500 }
    );
  }
}
