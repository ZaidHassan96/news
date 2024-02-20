const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const app = require("../app");
const endPoints = require("../endpoints.json");
const { string } = require("pg-format");
const comments = require("../db/data/test-data/comments");

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

describe("GET: /api/articles/:article_id", () => {
  test("returns an article object with the correct properties and a 200 status code", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          article: {
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: "2020-11-03T09:12:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          },
        });
      });
  });
  test("sends a 404 status and error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("id does not exist");
      });
  });
  test("sends a 400 status and error message when given a invalid id", () => {
    return request(app)
      .get("/api/articles/apples")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});
describe("GET: /api/articles", () => {
  test("returns all articles with these properties: author, title, article_id, topic ,created_at, votes, article_img_url, comment_count sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        console.log(articles);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  describe("article queries", () => {
    test("should return the articles filtered by topics", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then((response) => {
          const articles = response.body.articles;
          articles.forEach((article) => {
            expect(article.topic).toEqual("cats");
          });
        });
    });

    test("should return 400 bad request if an invalid query is entered", () => {
      return request(app)
        .get("/api/articles?topic=banana")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
  });
});
describe("GET: /api/articles/:article_id/comments", () => {
  test("returns an array of comments for given article_id with the following properties: comment_id, votes, created_at, author, body article_id", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then((response) => {
        const commentsArray = response.body.comments;
        commentsArray.forEach((comment) => {
          expect(comment).toMatchObject({
            body: expect.any(String),
            votes: expect.any(Number),
            author: expect.any(String),
            article_id: expect.any(Number),
            created_at: expect.any(String),
          });
        });
      });
  });
  test("returns an array of comments for given ariticle_id with most recent comment first", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then((response) => {
        const commentsArray = response.body.comments;
        expect(commentsArray).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("sends a 404 status and error message when given a valid but non-existent article_id", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("id does not exist");
      });
  });
  test("sends a 400 status and error message when given a invalid id", () => {
    return request(app)
      .get("/api/articles/apples/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("returns an empty array when article_id does exist but it has no comments", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body;
        expect(comments.length).toBe(0);
      });
  });
});
