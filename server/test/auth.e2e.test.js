import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

const usersByEmail = new Map();
const usersByUsername = new Map();
let idCounter = 1;

vi.mock("../src/models/User.js", () => {
  return {
    default: {
      async findOne(query) {
        if (query?.email) {
          return usersByEmail.get(query.email) || null;
        }
        if (query?.username) {
          return usersByUsername.get(query.username) || null;
        }
        return null;
      },
      async create(payload) {
        const user = {
          _id: String(idCounter++),
          username: payload.username,
          name: payload.name,
          email: payload.email,
          password: payload.password,
          emailVerified: payload.emailVerified,
          emailVerificationTokenHash: payload.emailVerificationTokenHash,
          emailVerificationExpiresAt: payload.emailVerificationExpiresAt,
        };
        usersByEmail.set(user.email, user);
        if (user.username) usersByUsername.set(user.username, user);
        return user;
      },
    },
  };
});

import { createApp } from "../src/app.js";

let app;

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret";
  process.env.GOOGLE_CSE_KEY = "x";
  process.env.GOOGLE_CSE_CX = "y";
  app = await createApp({ connectDb: false });
});

describe("auth flow", () => {
  it("registers and logs in", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        username: "usera",
        name: "A",
        email: "A@Example.com",
        password: "Password1!",
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeTruthy();
    expect(registerRes.body.user.username).toBe("usera");
    expect(registerRes.body.user.email).toBe("a@example.com");

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@example.com", password: "Password1!" });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeTruthy();
  });

  it("returns exists=false for unknown email", async () => {
    const res = await request(app).get("/api/auth/exists?email=nope@example.com");
    expect(res.status).toBe(200);
    expect(res.body.exists).toBe(false);
  });

  it("returns 404 with account-not-found message", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "missing@example.com", password: "Password1!" });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Account not found. Please register first.");
  });

  it("accepts simple passwords during registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "weakuser",
      name: "Weak",
      email: "weak@example.com",
      password: "password",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
  });

  it("handles duplicate email gracefully", async () => {
    await request(app).post("/api/auth/register").send({
      username: "dup1",
      name: "Dup1",
      email: "dup@example.com",
      password: "Password1!",
    });

    const res = await request(app).post("/api/auth/register").send({
      username: "dup2",
      name: "Dup2",
      email: "dup@example.com",
      password: "Password1!",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Email already in use");
  });

  it("handles duplicate username gracefully", async () => {
    await request(app).post("/api/auth/register").send({
      username: "dupuser",
      name: "DupUser1",
      email: "dupuser1@example.com",
      password: "Password1!",
    });

    const res = await request(app).post("/api/auth/register").send({
      username: "dupuser",
      name: "DupUser2",
      email: "dupuser2@example.com",
      password: "Password1!",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Username already in use");
  });
});
