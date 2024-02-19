const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const app = require("../app");
const endPoints = require("../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET: /api/topics", () => {
  test("return all topics with a 200 status", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const alltopics = response.body;
        expect(alltopics.topics).toHaveLength(3);
        alltopics.topics.forEach((topic) => {
          expect(typeof topic.description).toBe("string");
          expect(typeof topic.slug).toBe("string");
        });
      });
  });
  test("should return a 404 if endpoint does not exist ", () => {
    return request(app)
      .get("/api/apples")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("path not found");
      });
  });
});

describe("GET: /api", () => {
  test("return description of all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const responseBody = response.body;
        expect(responseBody).toEqual(endPoints);
      });
  });
});
