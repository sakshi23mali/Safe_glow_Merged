import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

import axios from "axios";
import { createApp } from "../src/app.js";

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
        };
        usersByEmail.set(user.email, user);
        if (user.username) usersByUsername.set(user.username, user);
        return user;
      },
    },
  };
});

vi.mock("axios");

let app;
let token;

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret";
  process.env.GOOGLE_CSE_KEY = "x";
  process.env.GOOGLE_CSE_CX = "y";
  process.env.CLIENT_ORIGINS = "";

  app = await createApp({ connectDb: false });

  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({
      username: "usera",
      name: "A",
      email: "a@example.com",
      password: "Password1!",
    });

  token = registerRes.body.token;

  axios.get.mockResolvedValue({
    data: {
      items: [
        {
          title: "Test Product",
          snippet: "for oily skin fragrance free",
          link: "https://example.com/p",
          displayLink: "example.com",
          pagemap: { cse_image: [{ src: "https://example.com/i.png" }] },
        },
      ],
    },
  });
});

describe("products recommend", () => {
  it("rejects without auth", async () => {
    const res = await request(app).get("/api/products/recommend?skinType=oily");
    expect(res.status).toBe(401);
  });

  it("returns products with auth", async () => {
    const res = await request(app)
      .get("/api/products/recommend?skinType=oily")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.products?.length).toBe(1);
    expect(res.body.products[0].verdict).toBeTruthy();
  });

  it("prefers non-webp images when available", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        items: [
          {
            title: "Test Product 2",
            snippet: "for dry skin",
            link: "https://example.com/p2",
            displayLink: "example.com",
            pagemap: {
              cse_image: [{ src: "https://example.com/i.webp" }],
              cse_thumbnail: [{ src: "https://example.com/i.jpg" }],
            },
          },
        ],
      },
    });

    const res = await request(app)
      .get("/api/products/recommend?skinType=dry")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.products?.[0]?.image).toBe("https://example.com/i.jpg");
  });
});
