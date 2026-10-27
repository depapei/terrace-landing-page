import { beforeEach, describe, expect, mock, test } from "bun:test";

// These tests use in-memory mocks only. No live database or migrations.
mock.module("server-only", () => ({}));
const db = {
  lead: { findUnique: mock(), create: mock(), update: mock(), delete: mock(), findMany: mock(), count: mock() },
  leadSubmissionLimit: { deleteMany: mock() },
  $queryRaw: mock(),
  $transaction: mock((queries) => Promise.all(queries)),
};
const session = mock();
mock.module("@/lib/prisma", () => ({ prisma: db }));
mock.module("@/lib/auth/session", () => ({ getSessionAdmin: session }));
process.env.NEXT_PUBLIC_CONTACT_WHATSAPP = "6281234567890";
const schemas = await import("@/features/leads/schema");
const service = await import("@/features/leads/service");
const security = await import("@/features/leads/public-security");
const publicRoute = await import("@/app/api/public/leads/route");
const adminRoute = await import("@/app/api/admin/leads/route");
const detailRoute = await import("@/app/api/admin/leads/[id]/route");
const { Prisma } = await import("@/generated/prisma/client");
const { siteConfig } = await import("@/lib/site-config");
const { createElement } = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");
const { ContactCTA } = await import("@/components/landing/ContactCTA");

const key = "9d23025f-0993-45bf-bb90-52b592220c75";
const id = "cmleadtest1234567890123456";
const input = {
  companyName: "Contoh Usaha", contactType: "WHATSAPP", contactValue: "+62 812-3456-7890",
  requirements: "Website katalog produk", submissionKey: key, website: "",
};
const context = { params: Promise.resolve({ id }) };
function request(path, body, method = "POST", headers = {}) {
  return new Request(`http://localhost:3000${path}`, {
    method,
    headers: { host: "localhost:3000", origin: "http://localhost:3000", "x-terrace-request": "1", "content-type": "application/json", ...headers },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
}
beforeEach(() => {
  for (const value of Object.values(db.lead)) value.mockReset();
  db.leadSubmissionLimit.deleteMany.mockReset();
  db.leadSubmissionLimit.deleteMany.mockResolvedValue({ count: 0 });
  db.$queryRaw.mockReset();
  db.$queryRaw.mockResolvedValue([{ count: 1, resetAt: new Date(Date.now() + 60000) }]);
  session.mockReset();
  session.mockResolvedValue(null);
  db.lead.findUnique.mockResolvedValue(null);
  db.lead.create.mockResolvedValue({ id });
});

describe("lead input boundaries", () => {
  test("public source, status and internal notes cannot be injected", () => {
    for (const extra of [{ status: "CONVERTED" }, { source: "POTENTIAL" }, { internalNotes: "secret" }]) {
      expect(schemas.publicLeadSchema.safeParse({ ...input, ...extra }).success).toBe(false);
    }
  });
  test("public contact types and contact formats are validated", () => {
    expect(schemas.publicLeadSchema.safeParse(input).success).toBe(true);
    for (const change of [{ contactType: "INSTAGRAM" }, { contactValue: "081234567890" }, { contactType: "EMAIL", contactValue: "invalid" }, { companyName: "  " }, { requirements: "x".repeat(2001) }]) {
      expect(schemas.publicLeadSchema.safeParse({ ...input, ...change }).success).toBe(false);
    }
  });
  test("honeypot rejects populated values", () => {
    expect(schemas.publicLeadSchema.safeParse({ ...input, website: "https://spam.example" }).success).toBe(false);
  });
  test("manual leads cannot set their initial status or source", () => {
    const manual = { companyName: "Company", contactType: "EMAIL", contactValue: "sales@example.com" };
    expect(schemas.potentialLeadSchema.safeParse(manual).success).toBe(true);
    expect(schemas.potentialLeadSchema.safeParse({ ...manual, status: "CONVERTED" }).success).toBe(false);
    expect(schemas.potentialLeadSchema.safeParse({ ...manual, source: "SELF_FORM" }).success).toBe(false);
  });
  test("unsafe URL schemes are rejected for prospect URLs", () => {
    expect(schemas.potentialLeadSchema.safeParse({ companyName: "Company", contactType: "WEBSITE", contactValue: "javascript:alert(1)" }).success).toBe(false);
  });
  test("pagination and progress updates reject invalid or privileged fields", () => {
    expect(schemas.leadListSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(schemas.leadListSchema.safeParse({ status: "INVALID" }).success).toBe(false);
    expect(schemas.leadProgressSchema.safeParse({ status: "NEW", companyName: "Overwrite" }).success).toBe(false);
  });
});

describe("submission persistence and retries", () => {
  test("contact section offers both the form and direct WhatsApp without requiring submission", () => {
    const html = renderToStaticMarkup(createElement(ContactCTA));
    expect(html).toContain('aria-label="Form kebutuhan proyek"');
    expect(html).toContain("Langsung WhatsApp");
    expect(html).toContain("https://wa.me/6281234567890?text=");
  });
  test("missing WhatsApp configuration still saves and acknowledges an inquiry", async () => {
    const previous = siteConfig.contact.whatsappHref;
    siteConfig.contact.whatsappHref = null;
    try {
      const result = await service.submitPublicLead(schemas.publicLeadSchema.parse(input));
      expect(result).toEqual({ ok: true, whatsappUrl: null });
      expect(db.lead.create).toHaveBeenCalledTimes(1);
    } finally { siteConfig.contact.whatsappHref = previous; }
  });
  test("save uses normalized contact and server-owned defaults; response contains no lead data", async () => {
    const result = await service.submitPublicLead(schemas.publicLeadSchema.parse(input));
    const data = db.lead.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ source: "SELF_FORM", status: "NEW", contactValue: "6281234567890", submissionKey: key });
    expect(data.internalNotes).toBeUndefined();
    expect(Object.keys(result).sort()).toEqual(["ok", "whatsappUrl"]);
    expect(result.whatsappUrl).toStartWith("https://wa.me/6281234567890?text=");
    expect(decodeURIComponent(result.whatsappUrl)).toContain("Website katalog produk");
  });
  test("repeated request uses the saved lead instead of inserting again", async () => {
    const parsed = schemas.publicLeadSchema.parse(input);
    await service.submitPublicLead(parsed);
    db.lead.findUnique.mockResolvedValue({ submissionHash: db.lead.create.mock.calls[0][0].data.submissionHash });
    await service.submitPublicLead(parsed);
    expect(db.lead.create).toHaveBeenCalledTimes(1);
    await expect(service.submitPublicLead({ ...parsed, requirements: "Changed request" })).rejects.toMatchObject({ status: 409 });
    expect(db.lead.create).toHaveBeenCalledTimes(1);
  });
  test("concurrent identical requests recover from a unique-key race", async () => {
    const parsed = schemas.publicLeadSchema.parse(input);
    await service.submitPublicLead(parsed);
    const hash = db.lead.create.mock.calls[0][0].data.submissionHash;
    db.lead.findUnique.mockReset();
    db.lead.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ submissionHash: hash });
    db.lead.create.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("Unique", { code: "P2002", clientVersion: "7.10.1" }));
    await expect(service.submitPublicLead(parsed)).resolves.toMatchObject({ ok: true });
  });
  test("database failure never produces a success or WhatsApp redirect", async () => {
    db.lead.create.mockRejectedValueOnce(new Error("database unavailable"));
    const log = mock(() => {});
    const original = console.error;
    console.error = log;
    try {
      const response = await publicRoute.POST(request("/api/public/leads", input));
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.whatsappUrl).toBeUndefined();
      expect(JSON.stringify(body)).not.toContain("database unavailable");
    } finally { console.error = original; }
  });
  test("manual create fixes source and status; edit/delete predicates protect customer submissions", async () => {
    const manual = schemas.potentialLeadSchema.parse({ companyName: "Company", contactType: "EMAIL", contactValue: "SALES@example.com" });
    await service.createPotentialLead(manual);
    expect(db.lead.create.mock.calls[0][0].data).toMatchObject({ source: "POTENTIAL", status: "NEW", contactValue: "sales@example.com" });
    await service.updatePotentialLead(id, { ...manual, status: "CONTACTED" });
    expect(db.lead.update.mock.calls[0][0].where).toEqual({ id, source: "POTENTIAL" });
    await service.deletePotentialLead(id);
    expect(db.lead.delete.mock.calls[0][0].where).toEqual({ id, source: "POTENTIAL" });
  });
  test("search, status, source, pagination use the same filters for list and count", async () => {
    db.lead.findMany.mockResolvedValue([]);
    db.lead.count.mockResolvedValue(21);
    const result = await service.listLeads({ source: "SELF_FORM", status: "NEW", search: "Contoh", page: 2 });
    const args = db.lead.findMany.mock.calls[0][0];
    expect(args).toMatchObject({ skip: 20, take: 20, where: { source: "SELF_FORM", status: "NEW", companyName: { contains: "Contoh", mode: "insensitive" } } });
    expect(db.lead.count.mock.calls[0][0].where).toEqual(args.where);
    expect(args.select.internalNotes).toBeUndefined();
    expect(args.select.submissionHash).toBeUndefined();
    expect(result).toMatchObject({ total: 21, page: 2, pageSize: 20 });
  });
});

describe("HTTP access and abuse boundaries", () => {
  test("all admin handlers reject unauthenticated access without reading lead records", async () => {
    for (const [handler, method, path, ctx] of [
      [adminRoute.GET, "GET", "/api/admin/leads", undefined],
      [adminRoute.POST, "POST", "/api/admin/leads", undefined],
      [detailRoute.GET, "GET", `/api/admin/leads/${id}`, context],
      [detailRoute.PUT, "PUT", `/api/admin/leads/${id}`, context],
      [detailRoute.PATCH, "PATCH", `/api/admin/leads/${id}`, context],
      [detailRoute.DELETE, "DELETE", `/api/admin/leads/${id}`, context],
    ]) {
      const response = await handler(request(path, method === "GET" ? undefined : {}, method), ctx);
      expect(response.status).toBe(401);
    }
    expect(db.lead.findUnique).not.toHaveBeenCalled();
    expect(db.lead.findMany).not.toHaveBeenCalled();
    expect(db.lead.create).not.toHaveBeenCalled();
    expect(db.lead.update).not.toHaveBeenCalled();
    expect(db.lead.delete).not.toHaveBeenCalled();
  });
  test("cross-origin requests and missing custom header are rejected before database access", async () => {
    for (const headers of [{ origin: "https://attacker.example" }, { "x-terrace-request": "" }]) {
      const response = await publicRoute.POST(request("/api/public/leads", input, "POST", headers));
      expect(response.status).toBe(403);
    }
    expect(db.$queryRaw).not.toHaveBeenCalled();
    expect(db.lead.create).not.toHaveBeenCalled();
  });
  test("public API provides no GET handler and returns only an acknowledgement after save", async () => {
    expect(publicRoute.GET).toBeUndefined();
    const response = await publicRoute.POST(request("/api/public/leads", input));
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(Object.keys(await response.json()).sort()).toEqual(["ok", "whatsappUrl"]);
  });
  test("public rate limit returns 429 and Retry-After without inserting a lead", async () => {
    db.$queryRaw.mockResolvedValueOnce([{ count: 11, resetAt: new Date(Date.now() + 60000) }]);
    const response = await publicRoute.POST(request("/api/public/leads", input));
    expect(response.status).toBe(429);
    expect(Number(response.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(db.lead.create).not.toHaveBeenCalled();
  });
  test("authenticated progress endpoint rejects changes to the original submission", async () => {
    session.mockResolvedValue({ id: "admin", username: "admin" });
    const response = await detailRoute.PATCH(request(`/api/admin/leads/${id}`, { status: "CONTACTED", companyName: "Replaced" }, "PATCH"), context);
    expect(response.status).toBe(422);
    expect(db.lead.update).not.toHaveBeenCalled();
  });
  test("invalid JSON, oversized chunked data, and wrong media type are rejected", async () => {
    await expect(security.readLeadJson(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }))).rejects.toMatchObject({ status: 400 });
    await expect(security.readLeadJson(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: "x".repeat(32769) }))).rejects.toMatchObject({ status: 413 });
    await expect(security.readLeadJson(new Request("http://localhost", { method: "POST", body: "text" }))).rejects.toMatchObject({ status: 415 });
  });
});
