/**
 * A function that returns a promise that resolves in a second.
 * @param timeInSec 
 * @returns Promise<void>
 */
export function wait(timeInSec = 1) {
    return new Promise(resolve => setTimeout(resolve, timeInSec * 1000))
}