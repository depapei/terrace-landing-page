import "server-only";
import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "./errors";

type Handler<C> = (request: Request, context: C) => Promise<Response>;

/**
 * Wraps a Route Handler so every failure becomes a JSON response with an
 * appropriate status, and internal details never reach the browser.
 */
export function apiHandler<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Let Next.js internal control-flow errors (prerender bailouts etc.) through.
      unstable_rethrow(error);
      return toErrorResponse(error);
    }
  };
}

function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: error.message, fieldErrors: error.fieldErrors },
      { status: error.status, headers: error.headers },
    );
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        message: "Periksa kembali data yang diisi.",
        fieldErrors: z.flattenError(error).fieldErrors,
      },
      { status: 422 },
    );
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const fields = uniqueViolationFields(error.meta);
      return NextResponse.json(
        {
          message: "Data dengan nilai tersebut sudah ada.",
          fieldErrors: Object.fromEntries(fields.map((f) => [f, ["Nilai ini sudah digunakan."]])),
        },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
    }
  }
  console.error("[api] unexpected error", error);
  return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
}

/**
 * Field names behind a unique-constraint error. Classic engines report
 * `meta.target`; driver adapters report the index name (`Model_field_key`).
 */
function uniqueViolationFields(meta: Record<string, unknown> | undefined): string[] {
  const target = meta?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];

  const cause = (meta?.driverAdapterError as { cause?: { constraint?: { fields?: string[]; index?: string } } })
    ?.cause;
  if (cause?.constraint?.fields) return cause.constraint.fields;
  const index = cause?.constraint?.index;
  const match = index?.match(/^[^_]+_(.+)_key$/);
  return match ? match[1].split("_") : [];
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Body request harus berupa JSON yang valid.");
  }
}

/** Route params are user input too: only accept cuid-like ids. */
export const idSchema = z.string().regex(/^[a-z0-9]{20,40}$/i, "ID tidak valid.");

export async function parseId(params: Promise<{ id: string }>) {
  const { id } = await params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) throw new ApiError(404, "Data tidak ditemukan.");
  return parsed.data;
}
