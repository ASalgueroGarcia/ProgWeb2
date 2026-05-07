const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../src/app");
const User = require("../src/models/User");
const Company = require("../src/models/Company");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

jest.mock("../src/services/mail.service.js", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined)
}));

const SECRET = "test_secret";
let token, userId;

beforeEach(async () => {
  const company = await Company.create({ name: "TestCo", cif: "B12345678" });
  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "hashedpassword123",
    company: company._id,
    validated: true
  });
  userId = user._id.toString();
  token = jwt.sign({ id: userId, companyId: company._id.toString() }, SECRET);
});

describe("POST /api/user/register", () => {
  it("registers a new user successfully", async () => {
    const res = await request(app)
      .post("/api/user/register")
      .send({
        name: "New User",
        email: "newuser@example.com",
        password: "password123"
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("userId");
    expect(res.body.message).toContain("registered");
  });

  it("rejects duplicate email", async () => {
    await request(app)
      .post("/api/user/register")
      .send({
        name: "User 1",
        email: "duplicate@example.com",
        password: "password123"
      });

    const res = await request(app)
      .post("/api/user/register")
      .send({
        name: "User 2",
        email: "duplicate@example.com",
        password: "password123"
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Email already registered");
  });

  it("rejects missing required fields", async () => {
    const res = await request(app)
      .post("/api/user/register")
      .send({
        name: "Test",
        email: "test@example.com"
        // missing password
      });

    expect(res.status).toBe(400);
  });

  it("rejects invalid email format", async () => {
    const res = await request(app)
      .post("/api/user/register")
      .send({
        name: "Test User",
        email: "invalid-email",
        password: "password123"
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("email");
  });

  it("rejects short password", async () => {
    const res = await request(app)
      .post("/api/user/register")
      .send({
        name: "Test User",
        email: "newuser@example.com",
        password: "short"
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("6 characters");
  });
});

describe("PUT /api/user/validation", () => {
  it("validates email with correct code", async () => {
    const userData = {
      name: "Unvalidated User",
      email: "unvalidated@example.com",
      password: "hashedpassword123",
      validationCode: "123456"
    };
    const unvalidatedUser = await User.create(userData);

    const res = await request(app)
      .put("/api/user/validation")
      .send({
        email: "unvalidated@example.com",
        code: "123456"
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("validated");

    const updatedUser = await User.findById(unvalidatedUser._id);
    expect(updatedUser.validated).toBe(true);
    expect(updatedUser.validationCode).toBeUndefined();
  });

  it("rejects invalid verification code", async () => {
    const userData = {
      name: "Unvalidated User",
      email: "unvalidated2@example.com",
      password: "hashedpassword123",
      validationCode: "123456"
    };
    await User.create(userData);

    const res = await request(app)
      .put("/api/user/validation")
      .send({
        email: "unvalidated2@example.com",
        code: "wrong-code"
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid verification code");
  });

  it("rejects non-existent email", async () => {
    const res = await request(app)
      .put("/api/user/validation")
      .send({
        email: "nonexistent@example.com",
        code: "123456"
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid verification code");
  });
});

describe("POST /api/user/login", () => {
  beforeEach(async () => {
    const company = await Company.create({ name: "LoginTestCo", cif: "B11111111" });
    const hashedPassword = await bcrypt.hash("password123", 10);
    await User.create({
      name: "Login Test User",
      email: "logintest@example.com",
      password: hashedPassword,
      company: company._id,
      validated: true
    });
  });

  it("logs in successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "logintest@example.com",
        password: "password123"
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("name");
    expect(res.body.user).toHaveProperty("email");
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "logintest@example.com",
        password: "wrongpassword"
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("rejects login with non-existent email", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "nonexistent@example.com",
        password: "password123"
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("rejects login if email not validated", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    await User.create({
      name: "Unvalidated Test",
      email: "unvalidatedlogin@example.com",
      password: hashedPassword,
      validated: false
    });

    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "unvalidatedlogin@example.com",
        password: "password123"
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("validate your email");
  });
});

describe("GET /api/user", () => {
  it("returns authenticated user profile", async () => {
    const res = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.email).toBe("test@example.com");
    expect(res.body).toHaveProperty("company");
  });

  it("rejects request without token", async () => {
    const res = await request(app).get("/api/user");

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("No token provided");
  });

  it("rejects request with invalid token", async () => {
    const res = await request(app)
      .get("/api/user")
      .set("Authorization", "Bearer invalid_token");

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Invalid token");
  });
});

describe("PUT /api/user", () => {
  it("updates user personal information", async () => {
    const res = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Name",
        email: "updated@example.com"
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Name");
    expect(res.body.email).toBe("updated@example.com");
  });

  it("updates only name", async () => {
    const res = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Only Name Changed"
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Only Name Changed");
  });

  it("rejects without authentication", async () => {
    const res = await request(app)
      .put("/api/user")
      .send({
        name: "Hacker"
      });

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/user/company", () => {
  it("creates a new company for user", async () => {
    const uncompanyUser = await User.create({
      name: "No Company User",
      email: "nocompany@example.com",
      password: "hashedpassword",
      validated: true
    });
    const noCompanyToken = jwt.sign({ id: uncompanyUser._id.toString() }, SECRET);

    const res = await request(app)
      .patch("/api/user/company")
      .set("Authorization", `Bearer ${noCompanyToken}`)
      .send({
        name: "New Company",
        cif: "A12345678"
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("New Company");
    expect(res.body.cif).toBe("A12345678");
  });

  it("updates existing company", async () => {
    const res = await request(app)
      .patch("/api/user/company")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Company Name",
        cif: "B99999999"
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Company Name");
  });

  it("rejects without authentication", async () => {
    const res = await request(app)
      .patch("/api/user/company")
      .send({
        name: "Unauthorized Company"
      });

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/user/logo", () => {
  it("rejects upload without file", async () => {
    const res = await request(app)
      .patch("/api/user/logo")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("No file uploaded");
  });

  it("rejects non-image files", async () => {
    const res = await request(app)
      .patch("/api/user/logo")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("PK\x03\x04"), "document.pdf");

    // Multer filters non-image files, so we expect 400 or 500
    expect([400, 500]).toContain(res.status);
  });

  it("rejects without authentication", async () => {
    const res = await request(app).patch("/api/user/logo");

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/user", () => {
  it("performs soft delete by default", async () => {
    const res = await request(app)
      .delete("/api/user?soft=true")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/archived|deleted/);

    // Verify soft delete by finding with deleted flag (not excluded)
    const deletedUser = await User.findById(userId).lean();
    expect(deletedUser).not.toBeNull();
    expect(deletedUser.deleted).toBe(true);
  });

  it("performs hard delete with soft=false query", async () => {
    const deleteUser = await User.create({
      name: "To Delete",
      email: "todelete@example.com",
      password: "hashedpassword",
      validated: true
    });
    const deleteToken = jwt.sign({ id: deleteUser._id.toString() }, SECRET);

    const res = await request(app)
      .delete("/api/user?soft=false")
      .set("Authorization", `Bearer ${deleteToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("deleted");

    const user = await User.findById(deleteUser._id);
    expect(user).toBeNull();
  });

  it("rejects delete without authentication", async () => {
    const res = await request(app).delete("/api/user");

    expect(res.status).toBe(401);
  });
});
