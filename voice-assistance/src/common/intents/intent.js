/**
 * @interface
 */
class Intent {

    /**
     * @return {Promise<any>}
     */
    async execute() {
        throw new Error('Must be implemented');
    }

    /**
     * @return {any}
     */
    response() {
        throw new Error('Must be implemented');
    }

    /**
     * @param {Database} database
     * @param {ClientHttp} httpClient
     * @return {Promise<boolean>}
     */
    postProcess(database, httpClient) {
        throw new Error('Must be implemented');
    }
}

module.exports = {Intent};
