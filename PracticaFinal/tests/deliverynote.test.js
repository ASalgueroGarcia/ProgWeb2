const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../src/app");
const User = require("../src/models/User");
const Company = require("../src/models/Company");
const Client = require("../src/models/Client");
const Project = require("../src/models/Project");
const DeliveryNote = require("../src/models/DeliveryNote");
const jwt = require("jsonwebtoken");

jest.mock("../src/services/storage.service", () => ({
  uploadBuffer: jest.fn().mockResolvedValue("https://fake-cdn.com/signature.webp"),
  uploadPdfBuffer: jest.fn().mockResolvedValue("https://fake-cdn.com/albaran.pdf")
}));

jest.mock("../src/services/pdf.service", () => ({
  generateDeliveryNotePdf: jest.fn().mockResolvedValue(Buffer.from("%PDF-1.4 fake pdf content"))
}));

jest.mock("sharp", () => {
  const chain = {
    resize: () => chain,
    webp:   () => chain,
    toBuffer: () => Promise.resolve(Buffer.from("fake-optimized-image"))
  };
  return jest.fn(() => chain);
});

const SECRET = "test_secret";
let token, companyId, clientId, projectId;

beforeEach(async () => {
  const company = await Company.create({ name: "TestCo", cif: "B12345678" });
  companyId = company._id;
  const user = await User.create({
    name: "Test User", email: "test@test.com",
    password: "hashed", company: companyId, validated: true
  });
  token = jwt.sign({ id: user._id.toString(), companyId: companyId.toString() }, SECRET);
  const client = await Client.create({ name: "Client A", cif: "A00000001", user: user._id, company: companyId });
  clientId = client._id.toString();
  const project = await Project.create({ name: "Project A", projectCode: "PRJ-001", client: clientId, user: user._id, company: companyId });
  projectId = project._id.toString();
});

describe("POST /api/deliverynote", () => {
  it("creates a delivery note (hours)", async () => {
    const res = await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, format: "hours", workDate: "2025-01-15", hours: 8 });
    expect(res.status).toBe(201);
    expect(res.body.format).toBe("hours");
    expect(res.body.hours).toBe(8);
    expect(res.body.signed).toBe(false);
  });

  it("creates a delivery note (material)", async () => {
    const res = await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, format: "material", workDate: "2025-01-15", material: "Cement", quantity: 10, unit: "bags" });
    expect(res.status).toBe(201);
    expect(res.body.format).toBe("material");
    expect(res.body.material).toBe("Cement");
  });

  it("rejects missing format", async () => {
    const res = await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, workDate: "2025-01-15" });
    expect(res.status).toBe(400);
  });

  it("rejects invalid project", async () => {
    const res = await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: new mongoose.Types.ObjectId(), format: "hours", workDate: "2025-01-15", hours: 8 });
    expect(res.status).toBe(404);
  });

  it("rejects without authentication", async () => {
    const res = await request(app).post("/api/deliverynote")
      .send({ client: clientId, project: projectId, format: "hours", workDate: "2025-01-15", hours: 8 });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/deliverynote", () => {
  it("lists delivery notes", async () => {
    await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, format: "hours", workDate: "2025-01-15", hours: 8 });
    const res = await request(app).get("/api/deliverynote").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("notes");
    expect(res.body).toHaveProperty("totalPages");
    expect(res.body).toHaveProperty("totalItems");
  });

  it("lists delivery notes with format filter", async () => {
    await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, format: "hours", workDate: "2025-01-15", hours: 8 });
    const res = await request(app).get("/api/deliverynote?format=hours").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.notes.every(n => n.format === "hours")).toBe(true);
  });

  it("lists delivery notes with date range filter", async () => {
    await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, format: "hours", workDate: "2025-01-15", hours: 8 });
    const res = await request(app).get("/api/deliverynote?from=2025-01-01&to=2025-12-31").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.notes.length).toBeGreaterThan(0);
  });
});

describe("DELETE /api/deliverynote/:id", () => {
  it("deletes an unsigned note", async () => {
    const created = await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, format: "hours", workDate: "2025-01-15", hours: 4 });
    const res = await request(app).delete(`/api/deliverynote/${created.body._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it("rejects delete of signed note", async () => {
    const created = await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, format: "hours", workDate: "2025-01-15", hours: 4 });

    await DeliveryNote.findByIdAndUpdate(created.body._id, {
      signed: true,
      signedAt: new Date(),
      signatureUrl: "https://fake-cdn.com/sig.webp"
    });

    const res = await request(app).delete(`/api/deliverynote/${created.body._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("rejects without authentication", async () => {
    const res = await request(app).delete(`/api/deliverynote/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/deliverynote/:id", () => {
  it("returns populated delivery note", async () => {
    const created = await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, format: "hours", workDate: "2025-01-15", hours: 6 });
    const res = await request(app).get(`/api/deliverynote/${created.body._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("client");
    expect(res.body).toHaveProperty("project");
  });

  it("returns 404 for unknown delivery note", async () => {
    const res = await request(app).get(`/api/deliverynote/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("rejects without authentication", async () => {
    const res = await request(app).get(`/api/deliverynote/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/deliverynote/pdf/:id", () => {
  it("downloads delivery note as PDF", async () => {
    const created = await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, format: "hours", workDate: "2025-01-15", hours: 6 });
    const res = await request(app).get(`/api/deliverynote/pdf/${created.body._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.type).toContain("application/pdf");
  });

  it("rejects without authentication", async () => {
    const res = await request(app).get(`/api/deliverynote/pdf/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/deliverynote/:id/sign", () => {
  it("signs a delivery note with image", async () => {
    const created = await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, format: "hours", workDate: "2025-01-15", hours: 6 });

    const res = await request(app).patch(`/api/deliverynote/${created.body._id}/sign`)
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("fake image data"), "signature.png");

    expect([200, 201]).toContain(res.status);
    expect(res.body.signed).toBe(true);
  });

  it("rejects signing without image", async () => {
    const created = await request(app).post("/api/deliverynote").set("Authorization", `Bearer ${token}`)
      .send({ client: clientId, project: projectId, format: "hours", workDate: "2025-01-15", hours: 6 });

    const res = await request(app).patch(`/api/deliverynote/${created.body._id}/sign`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("rejects without authentication", async () => {
    const res = await request(app).patch(`/api/deliverynote/${new mongoose.Types.ObjectId()}/sign`);
    expect(res.status).toBe(401);
  });
});