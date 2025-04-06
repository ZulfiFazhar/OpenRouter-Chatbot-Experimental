import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Folder from "@/models/Folder";

export async function GET() {
  try {
    await dbConnect();
    const folders = await Folder.find({}).sort({ createdAt: -1 });
    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const folder = new Folder(data);
    await folder.save();
    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
