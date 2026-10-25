export type FieldErrors = Record<string, string[] | undefined>;

/** An error that is safe to return to the client as-is. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: FieldErrors,
    public readonly headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const notFound = (what = "Data") => new ApiError(404, `${what} tidak ditemukan.`);
