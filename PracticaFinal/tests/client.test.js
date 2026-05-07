const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../src/app");
const User = require("../src/models/User");
const Company = require("../src/models/Company");
const jwt = require("jsonwebtoken");

const SECRET = "test_secret";
let token, companyId;

beforeEach(async () => {
  const company = await Company.create({ name: "TestCo", cif: "B12345678" });
  companyId = company._id;
  const user = await User.create({
    name: "Test User", email: "test@test.com",
    password: "hashed", company: companyId, validated: true
  });
  token = jwt.sign({ id: user._id.toString(), companyId: companyId.toString() }, SECRET);
});

describe("POST /api/client", () => {
  it("creates a client successfully", async () => {
    const res = await request(app)
      .post("/api/client")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Client A", cif: "A12345678", email: "a@a.com" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Client A");
    expect(res.body.cif).toBe("A12345678");
  });

  it("rejects duplicate CIF", async () => {
    await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
      .send({ name: "Client A", cif: "A12345678" });
    const res = await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
      .send({ name: "Client B", cif: "A12345678" });
    expect(res.status).toBe(409);
  });

  it("rejects missing name", async () => {
    const res = await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
      .send({ cif: "A12345678" });
    expect(res.status).toBe(400);
  });

  it("rejects unauthenticated request", async () => {
    const res = await request(app).post("/api/client").send({ name: "X", cif: "Y" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/client", () => {
  it("returns paginated list", async () => {
    await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
      .send({ name: "Client A", cif: "A00000001" });
    const res = await request(app).get("/api/client?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("clients");
    expect(res.body).toHaveProperty("totalItems");
    expect(res.body.clients.length).toBeGreaterThan(0);
  });
});

describe("GET /api/client/:id", () => {
  it("returns a specific client", async () => {
    const created = await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
      .send({ name: "Client A", cif: "A00000002" });
    const res = await request(app).get(`/api/client/${created.body._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.cif).toBe("A00000002");
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).get(`/api/client/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/client/:id", () => {
  it("updates a client", async () => {
    const created = await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
      .send({ name: "Client A", cif: "A00000003" });
    const res = await request(app).put(`/api/client/${created.body._id}`)
      .set("Authorization", `Bearer ${token}`).send({ name: "Client Updated" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Client Updated");
  });
});

describe("DELETE /api/client/:id", () => {
  it("soft deletes a client", async () => {
    const created = await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
      .send({ name: "Client A", cif: "A00000004" });
    const res = await request(app).delete(`/api/client/${created.body._id}?soft=true`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.client.deleted).toBe(true);
  });

  it("hard deletes a client", async () => {
    const created = await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
      .send({ name: "Client A", cif: "A00000005" });
    const res = await request(app).delete(`/api/client/${created.body._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/client/archived + PATCH restore", () => {
  it("lists archived clients and restores them", async () => {
    const created = await request(app).post("/api/client").set("Authorization", `Bearer ${token}`)
      .send({ name: "Client A", cif: "A00000006" });
    await request(app).delete(`/api/client/${created.body._id}?soft=true`)
      .set("Authorization", `Bearer ${token}`);
    const archived = await request(app).get("/api/client/archived")
      .set("Authorization", `Bearer ${token}`);
    expect(archived.status).toBe(200);
    expect(archived.body.length).toBeGreaterThan(0);
    const restored = await request(app).patch(`/api/client/${created.body._id}/restore`)
      .set("Authorization", `Bearer ${token}`);
    expect(restored.status).toBe(200);
    expect(restored.body.deleted).toBe(false);
  });
});
