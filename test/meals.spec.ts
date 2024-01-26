import { execSync } from "node:child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import request from "supertest";

describe("Meals routes", () => {
  beforeAll(async () => {
    execSync("npm run knex migrate:latest");

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new meal", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "Ricky",
      email: "ricky@email.com",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Prato 1",
        description: "Prato 1 - Desc",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);
  });

  it("should be able to list all meals", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "Ricky", email: "ricky@email.com" })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Prato 1",
        description: "Prato 1 - Desc",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Prato 2",
        description: "Prato 2 - Desc",
        isOnDiet: true,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day after
      })
      .expect(201);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    expect(listMealsResponse.body.meals).toHaveLength(2);

    expect(listMealsResponse.body.meals[0].name).toBe("Prato 1");
    expect(listMealsResponse.body.meals[1].name).toBe("Prato 2");
  });

  it("should be able to list a specific meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "Ricky", email: "ricky@email.com" })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Prato 1",
        description: "Prato 1 - Desc",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    const getMealsResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getMealsResponse.body.meal).toEqual(
      expect.objectContaining({
        name: "Prato 1",
        description: "Prato 1 - Desc",
        is_on_diet: 1,
        date: expect.any(Number),
      })
    );
  });

  it("should be able to update a meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "Ricky", email: "ricky@email.com" })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Prato 1",
        description: "Prato 1 - Desc",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .send({
        name: "Prato 1",
        description: "Prato 1 - Update",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(200);
  });

  it("should be able to delete a meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "Ricky", email: "ricky@email.com" })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Prato 1",
        description: "Prato 1 - Desc",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);
  });

  it("should be able to get metrics", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "Ricky", email: "ricky@email.com" })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Prato 1",
        description: "Prato 1 - Desc",
        isOnDiet: true,
        date: new Date("2021-01-01T12:00:00"),
      })
      .expect(201);

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Prato 2",
        description: "Prato 2 - Desc",
        isOnDiet: true,
        date: new Date("2021-01-02T12:00:00"),
      })
      .expect(201);

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Prato 2",
        description: "Prato 2 - Desc",
        isOnDiet: false,
        date: new Date("2021-01-03T12:00:00"),
      })
      .expect(201);

    const metricsResponse = await request(app.server)
      .get("/meals/metrics")
      .set("Cookie", cookies)
      .expect(200);

    expect(metricsResponse.body).toEqual({
      totalMeals: 3,
      totalMealsOnDiet: 2,
      totalMealsOffDiet: 1,
      bestOnDietSequence: 2,
    });
  });
});
