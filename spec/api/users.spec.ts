import { createUser, getUsers } from "../../admin/module";
import { startDBServer } from "../utils/server"

describe("User creation tests", () => {
    beforeAll(async () => {
        startDBServer();
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
})