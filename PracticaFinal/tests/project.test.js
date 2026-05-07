const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../src/app");
const User = require("../src/models/User");
const Company = require("../src/models/Company");
const Client = require("../src/models/Client");
const jwt = require("jsonwebtoken");

const SECRET = "test_secret";
let token, companyId, clientId;

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
});

describe("POST /api/project", () => {
  it("creates a project", async () => {
    const res = await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project A", projectCode: "PRJ-001", client: clientId });
    expect(res.status).toBe(201);
    expect(res.body.projectCode).toBe("PRJ-001");
    expect(res.body).toHaveProperty("_id");
    expect(res.body.user).toBeDefined();
    expect(res.body.company).toBeDefined();
  });

  it("rejects duplicate project code", async () => {
    await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project A", projectCode: "PRJ-001", client: clientId });
    const res = await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project B", projectCode: "PRJ-001", client: clientId });
    expect(res.status).toBe(409);
  });

  it("rejects invalid client", async () => {
    const res = await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project A", projectCode: "PRJ-002", client: new mongoose.Types.ObjectId().toString() });
    expect(res.status).toBe(404);
  });

  it("rejects missing required fields", async () => {
    const res = await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project A" });
    expect(res.status).toBe(400);
  });

  it("rejects without authentication", async () => {
    const res = await request(app).post("/api/project")
      .send({ name: "Project A", projectCode: "PRJ-001", client: clientId });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/project", () => {
  it("lists projects with pagination", async () => {
    await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project A", projectCode: "PRJ-001", client: clientId });
    const res = await request(app).get("/api/project").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("projects");
    expect(res.body.projects.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty("totalPages");
    expect(res.body).toHaveProperty("totalItems");
    expect(res.body).toHaveProperty("currentPage");
  });

  it("lists projects with name filter", async () => {
    await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project Alpha", projectCode: "PRJ-001", client: clientId });
    await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project Beta", projectCode: "PRJ-002", client: clientId });

    const res = await request(app).get("/api/project?name=Alpha").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.projects.some(p => p.name.includes("Alpha"))).toBe(true);
  });

  it("lists projects with active filter", async () => {
    await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Active Project", projectCode: "PRJ-001", client: clientId, active: true });

    const res = await request(app).get("/api/project?active=true").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.projects.every(p => p.active === true)).toBe(true);
  });
});

describe("GET /api/project/:id", () => {
  it("returns a specific project", async () => {
    const created = await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project A", projectCode: "PRJ-001", client: clientId });

    const res = await request(app).get(`/api/project/${created.body._id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(created.body._id);
    expect(res.body.name).toBe("Project A");
  });

  it("returns 404 for unknown project id", async () => {
    const res = await request(app).get(`/api/project/${new mongoose.Types.ObjectId()}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("rejects without authentication", async () => {
    const res = await request(app).get(`/api/project/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/project/:id", () => {
  it("updates a project", async () => {
    const created = await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project A", projectCode: "PRJ-001", client: clientId });

    const res = await request(app).put(`/api/project/${created.body._id}`).set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Project", notes: "Updated notes" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Project");
    expect(res.body.notes).toBe("Updated notes");
  });

  it("rejects update with duplicate project code", async () => {
    const proj1 = await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project 1", projectCode: "PRJ-001", client: clientId });
    
    await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project 2", projectCode: "PRJ-002", client: clientId });

    const res = await request(app).put(`/api/project/${proj1.body._id}`).set("Authorization", `Bearer ${token}`)
      .send({ projectCode: "PRJ-002" });

    expect(res.status).toBe(409);
  });

  it("rejects without authentication", async () => {
    const res = await request(app).put(`/api/project/${new mongoose.Types.ObjectId()}`)
      .send({ name: "Hacker" });
    expect(res.status).toBe(401);
  });
});

describe("DELETE + restore /api/project", () => {
  it("soft deletes and restores a project", async () => {
    const created = await request(app).post("/api/project").set("Authorization", `Bearer ${token}`)
      .send({ name: "Project A", projectCode: "PRJ-003", client: clientId });
    await request(app).delete(`/api/project/${created.body._id}?soft=true`).set("Authorization", `Bearer ${token}`);
    const archived = await request(app).get("/api/project/archived").set("Authorization", `Bearer ${token}`);
    expect(archived.body.length).toBeGreaterThan(0);
    const restored = await request(app).patch(`/api/project/${created.body._id}/restore`).set("Authorization", `Bearer ${token}`);
    expect(restored.status).toBe(200);
    expect(restored.body.deleted).toBe(false);
  });
});
