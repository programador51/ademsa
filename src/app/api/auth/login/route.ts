import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/login";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

const AUTH_ERROR_MESSAGES = {
  not_found: "Credenciales inválidas",
  password_required: "Este usuario requiere contraseña",
  invalid_password: "Credenciales inválidas",
} as const;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "El correo es requerido" },
        { status: 400 }
      );
    }

    const result = await authenticateUser(email, password ?? "");
    if (!result.ok) {
      return NextResponse.json(
        { error: AUTH_ERROR_MESSAGES[result.reason] },
        { status: 401 }
      );
    }

    const token = await createSessionToken(result.user);
    await setSessionCookie(token);

    return NextResponse.json({ user: result.user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
