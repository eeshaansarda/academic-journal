import {assert, expect} from "chai";

export const expectThrowsAsync = async function (expectedInstance: Function, functionToExecute: () => Promise<any>) {
    try {
        await functionToExecute();
    } catch (e) {
        expect(e).to.be.instanceof(expectedInstance);
        return;
    }

    assert.fail(`Did not throw ${expectedInstance.name}`, `Throw a ${expectedInstance.name}`);
}