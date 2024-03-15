const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const app = require("../app");
const endPoints = require("../endpoints.json");
const comments = require("../db/data/test-data/comments");
const users = require("../db/data/test-data/users");

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
            comment_count: 2,
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

        expect(articles.length).toBe(13);
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
    test("should return the articles filtered by given topics", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then((response) => {
          const articles = response.body.articles;
          expect(articles.length).toBe(1);
          articles.forEach((article) => {
            expect(article.topic).toEqual("cats");
          });
        });
    });
    test("returns an empty array when a topic does exist but it has no articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then((response) => {
          const comments = response.body;
          expect(comments.length).toBe(0);
        });
    });

    test("should return 404 if an invalid topic query is entered", () => {
      return request(app)
        .get("/api/articles?topic=banana")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("not found");
        });
    });
    test("should return the articles sorted by the default column being created_at and default order being desc", () => {
      return request(app)
        .get("/api/articles?sort_by")
        .expect(200)
        .then((response) => {
          const articles = response.body.articles;
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("should return the articles sorted by any given column and order either being asc or desc", () => {
      return request(app)
        .get("/api/articles?sort_by=title&&order=asc")
        .expect(200)
        .then((response) => {
          const articles = response.body.articles;
          expect(articles).toBeSortedBy("title");
        });
    });
    test("should return the articles ordered by either asc or desc", () => {
      return request(app)
        .get("/api/articles?order")
        .expect(200)
        .then((response) => {
          const articles = response.body.articles;
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("should return 404 if an invalid sort_by query is entered", () => {
      return request(app)
        .get("/api/articles?sort_by=banana")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Invalid sort_by query");
        });
    });
    test("should return 400 if an invalid order query is entered", () => {
      return request(app)
        .get("/api/articles?sort_by=author&&order=banana")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Invalid order query");
        });
    });
  });
  describe("GET: /api/articles (pagination)", () => {
    test("limit, which limits the number of responses (defaults to 10).", () => {
      return request(app)
        .get("/api/articles?limit")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(10);
        });
    });
    test("limit, which limits the number of responses according to the number you want.", () => {
      return request(app)
        .get("/api/articles?limit=5")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(5);
        });
    });
    test("limit, which limits the number of responses according to the number you want from the page you want.", () => {
      return request(app)
        .get("/api/articles?limit=5&p=1")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(5);
        });
    });
    test("responds with 400 bad request if limit value is of invalid value", () => {
      return request(app)
        .get("/api/articles?limit=apple")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Invalid limit query");
        });
    });
    test("responds with 400 bad request if p value is of invalid value", () => {
      return request(app)
        .get("/api/articles?limit=5&p=apple")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Invalid page query");
        });
    });
    test("responds with 400 bad request if a invalid query is entered", () => {
      return request(app)
        .get("/api/articles?apple")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Unexpected query parameters");
        });
    });
  });
});
describe("GET: /api/articles/:article_id/comments", () => {
  test("returns an array of comments for given article_id with the following properties: comment_id, votes, created_at, author, body article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const commentsArray = response.body.comments;
        expect(commentsArray.length).toBe(11);
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
  test("returns an array of comments for given article_id with most recent comment first", () => {
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
      .get("/api/articles/8/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body;
        expect(comments.length).toBe(0);
      });
  });
});
describe("POST: /api/articles/:article_id/comments", () => {
  test("should post a comment to an article by specific article_id", () => {
    const commentData = {
      username: "butter_bridge",
      body: "I done 10 push-ups",
    };
    return request(app)
      .post(`/api/articles/1/comments`)
      .send(commentData)
      .expect(201)
      .then((response) => {
        const commentArray = response.body;

        expect(commentArray.comment).toMatchObject({
          body: "I done 10 push-ups",
          votes: 0,
          author: "butter_bridge",
          article_id: 1,
          created_at: expect.any(String),
        });
      });
  });
  test("should return a 400 bad request if missing any part of request body", () => {
    const commentData = {};

    return request(app)
      .post(`/api/articles/1/comments`)
      .send(commentData)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("should return a 404 if trying to post to an article_id that does not exist", () => {
    const commentData = {
      username: "butter_bridge",
      body: "I done 10 push-ups",
    };

    return request(app)
      .post(`/api/articles/999/comments`)
      .send(commentData)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });
  test("should return a 400 if trying to post to an invalid article_id", () => {
    const commentData = {
      username: "butter_bridge",
      body: "I done 10 push-ups",
    };

    return request(app)
      .post(`/api/articles/apples/comments`)
      .send(commentData)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("should return a 404 if user does not exist", () => {
    const commentData = {
      username: "Mr_Apples",
      body: "I done 10 push-ups",
    };

    return request(app)
      .post(`/api/articles/1/comments`)
      .send(commentData)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("user not found");
      });
  });
});
describe(" PATCH: /api/articles/:article_id", () => {
  test("should update an articles vote by article_id", () => {
    const newVote = { inc_votes: -20 };

    return request(app)
      .patch("/api/articles/3")
      .send(newVote)
      .expect(200)
      .then((response) => {
        const articleArray = response.body;
        expect(articleArray).toMatchObject({
          article: {
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: "2020-11-03T09:12:00.000Z",
            votes: -20,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          },
        });
      });
  });

  test("should return a 404 if trying to patch to an article_id that does not exist", () => {
    const newVote = { inc_votes: -20 };

    return request(app)
      .patch(`/api/articles/999`)
      .send(newVote)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });
  test("should return a 400 if trying to patch to an article_id that is an invalid type", () => {
    const newVote = { inc_votes: -20 };

    return request(app)
      .patch(`/api/articles/apples`)
      .send(newVote)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("should return a 400 if trying to patch and vote value is not a number", () => {
    const newVote = { inc_votes: "apples" };

    return request(app)
      .patch(`/api/articles/1`)
      .send(newVote)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("should return a 200 if votes is missing ", () => {
    const newVote = {};
    return request(app).patch(`/api/articles/1`).send(newVote).expect(200);
  });
});
describe("DELETE: /api/comments/:comment_id", () => {
  test("should delete a comment and respond with 204 no content", () => {
    return request(app).delete("/api/comments/10").expect(204);
  });
  test(" responds with a 404 appropriate status and error message when given a non-existent id", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("id does not exist");
      });
  });
  test("responds with a 400 appropriate status and error message when given an invalid id", () => {
    return request(app)
      .delete("/api/comments/apples")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});
describe("GET: /api/users", () => {
  test("returns an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const usersArray = response.body.users;
        expect(usersArray.length).toBe(4);
        usersArray.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
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
describe("GET: /api/users/:username", () => {
  test("a user object which should have the following properties: username avatar_url name", () => {
    return request(app)
      .get("/api/users/lurker")
      .expect(200)
      .then((response) => {
        const user = response.body;
        expect(user).toEqual({
          username: "lurker",
          name: "do_nothing",
          avatar_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
        });
      });
  });
  test("sends a 404 status and error message when given a non existant username", () => {
    return request(app)
      .get("/api/users/apple")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("username does not exist");
      });
  });
});
describe("PATCH: /api/comments/:comment_id", () => {
  test("should update a comments vote by comment_id", () => {
    const newVote = { inc_votes: 250 };

    return request(app)
      .patch("/api/comments/4")
      .send(newVote)
      .expect(200)
      .then((response) => {
        const articleArray = response.body;

        expect(articleArray).toMatchObject({
          comment: {
            body: " I carry a log — yes. Is it funny to you? It is not to me.",
            votes: 150,
            author: "icellusedkars",
            article_id: 1,
            created_at: expect.any(String),
          },
        });
      });
  });
  test("should return a 404 if trying to patch to a comment_id that does not exist", () => {
    const newVote = { inc_votes: 10 };

    return request(app)
      .patch(`/api/comments/999`)
      .send(newVote)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("comment not found");
      });
  });
  test("should return a 400 if trying to patch to a comment_id that is an invalid type", () => {
    const newVote = { inc_votes: 50 };

    return request(app)
      .patch(`/api/comments/apples`)
      .send(newVote)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("should return a 400 if trying to patch and vote value is not a number", () => {
    const newVote = { inc_votes: "apples" };

    return request(app)
      .patch(`/api/comments/1`)
      .send(newVote)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("should return a 200 if votes is missing ", () => {
    const newVote = {};
    return request(app).patch(`/api/comments/1`).send(newVote).expect(200);
  });
});
describe("POST: /api/articles", () => {
  test("should post an article", () => {
    const articleData = {
      title: "Great",
      topic: "mitch",
      author: "rogersop",
      body: "mitch is the greatest",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post(`/api/articles`)
      .send(articleData)
      .expect(201)
      .then((response) => {
        const article = response.body;

        expect(article).toMatchObject({
          article: {
            title: "Great",
            topic: "mitch",
            author: "rogersop",
            body: "mitch is the greatest",
            created_at: expect.any(String),
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: 0,
          },
        });
      });
  });
  test("articles_img_url will default if not provided", () => {
    const articleData = {
      title: "Great",
      topic: "mitch",
      author: "rogersop",
      body: "mitch is the greatest",
    };
    return request(app)
      .post(`/api/articles`)
      .send(articleData)
      .expect(201)
      .then((response) => {
        const article = response.body;

        expect(article).toMatchObject({
          article: {
            title: "Great",
            topic: "mitch",
            author: "rogersop",
            body: "mitch is the greatest",
            created_at: expect.any(String),
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
            comment_count: 0,
          },
        });
      });
  });
  test("should return a 400 bad request if request body is empty or missing: title,topic,author,body ", () => {
    const articleData = {};
    return request(app)
      .post("/api/articles")
      .send(articleData)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          "Bad request missing input, or incorrect input value type"
        );
      });
  });
  test("should return a 404 if user does not exist", () => {
    const articleData = {
      title: "Great",
      topic: "mitch",
      author: "apple",
      body: "mitch is the greatest",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };

    return request(app)
      .post(`/api/articles`)
      .send(articleData)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("user not found");
      });
  });
  test("should return a 400 bad request if values of properties are incorrect data types", () => {
    const articleData = {
      title: 123,
      topic: 123,
      author: "rogersop",
      body: 123,
      article_img_url: 123,
    };
    return request(app)
      .post("/api/articles")
      .send(articleData)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          "Bad request missing input, or incorrect input value type"
        );
      });
  });
});
describe("POST /api/topics", () => {
  test("should insert a new topic with a 201 ", () => {
    const topic = {
      slug: "Avatar",
      description: "The last airbender",
    };
    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(201)
      .then((response) => {
        const topic = response.body;
        expect(topic).toEqual({
          topic: {
            slug: "Avatar",
            description: "The last airbender",
          },
        });
      });
  });
  test("should return a 400 bad request if request body is empty or missing: slug or description", () => {
    const topic = {};
    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          "Bad request missing input, or incorrect input value type"
        );
      });
  });
  test("should return a 400 bad request if values of properties are incorrect data types", () => {
    const topic = {
      slug: 123,
      description: 123,
    };
    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          "Bad request missing input, or incorrect input value type"
        );
      });
  });
});
describe("DELETE: /api/articles/:article_id", () => {
  test("should delete a article by article_id and respond with 204 no content", () => {
    return request(app).delete("/api/comments/10").expect(204);
  });
  test(" responds with a 404 appropriate status and error message when given a non-existent id", () => {
    return request(app)
      .delete("/api/articles/999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("id does not exist");
      });
  });
  test("responds with a 400 appropriate status and error message when given an invalid id", () => {
    return request(app)
      .delete("/api/articles/apples")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});
