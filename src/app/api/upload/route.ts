import { NextRequest, NextResponse } from "next/server";
import { uploadFileServer } from "@/lib/baserow/client";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  const uploadData = new FormData();
  uploadData.append("file", file);

  const data = await uploadFileServer(uploadData);

  console.log(data);

  return NextResponse.json(data);
}
