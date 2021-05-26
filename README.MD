## Introduction

This is a [NodeJS](https://nodejs.org/en/about/) starter project written in [TypeScript](https://www.typescriptlang.org) that designs, creates and tests REST APIs using [ExpressJS](https://expressjs.com/) framework

## Reuse

This project can be reused for other projects by switching to `starter` branch.

## Design

The design is done before the APIs are developed using OpenAPI [Spec 3.0](https://swagger.io/specification/). The swagger document should be replaced at `api-docs/swagger.yml`. This is loaded using the `swagger-ui` module at the route `api-docs`.

## Development

### Router

Express JS routers are used to route requests. A sample router would be as the following

```typescript
import { add } from "./module";
const router = Router();

router.post("/add", async (req, res, next) => {
  try {
    const payload: number = add(req.body.number1, req.body.number2);
    return res.status(StatusCodes.OK).send(payload);
  } catch (err) {
    next(err);
  }
});
```

### Module

The actual business logic that does all the processing with the given parameters, usually request body or query parameters. The actual express request or response object should not be passed into any methods of this file as parameters. This should not have anything to do with express so it can be tested using unit tests.

```typescript
export function add(number1: number, number2: number): number {
    return number1 + number2;
}
```

## Testing

[Jasmine](https://jasmine.github.io/) is the test framework that is used. A sample unit tests written will be as the following

```typescript
import { add } from "../math/module";

describe("Math tests", () => {
    it("Should add 2 numbers", () => {
        expect( add(2, 4) ).toBe(6);
    });
})
```
The file should end in `.spec.ts` for it to be picked up by jasmine.

A more common tests which interacts with the database uses `mongo-unit` as the in memory database would invoke `startDBServer` from `spec/utils/server.ts` in beforeAll and `stopDBServer` in afterAll of the spec

```typescript
import { createUser, getUsers } from "../../admin/module";
import { startDBServer, stopDBServer } from "../utils/server"

describe("User creation tests", () => {
    beforeAll(async () => {
        await startDBServer();
    })

    it("Should create a user", async () => {
        const testUserPayload = { name: "Test User", email: "test@example.org" };
        await createUser(testUserPayload);
        const users = await getUsers();
        expect(users.length).toBe(1);
        const [firstUser] = users;
        expect(firstUser.id).not.toBeNull();
        expect(firstUser.name).toBe(testUserPayload.name);
        expect(firstUser.email).toBe(testUserPayload.email);
    })

    afterAll(async () => {
        await stopDBServer();
    })
})
```