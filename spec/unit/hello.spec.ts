import { wait } from "../helpers/promise";

describe("First Sample tests", () => {
    it("Should execute this successfully", () => {
        console.log("Hello Tests");
    });

    it("Should execute this async test successfully", async () => {
        await wait();
    });

    xit("Should fail at all times", () => {
        throw new Error("This is a custom error from tests");
    })
})