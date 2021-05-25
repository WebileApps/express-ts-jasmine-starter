export class APIError extends Error {
    constructor(public code: number, public message: string) {
        super(`APIError: ${message}, Code: ${code}`)
    }
}