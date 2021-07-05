/** project imports */
const {Intent} = require('./intent');
const configs = require('../configs/api.json');

/**
 * @class
 * @implements {Intent}
 */
class TakePhoto extends Intent {

    /**
     * @inheritDoc
     */
    async execute() {
        return true;
    }

    /**
     * @inheritDoc
     */
    response() {
        return {
            "fulfillmentMessages": [
                {
                    "text": {
                        "text": [
                            "Taking a picture"
                        ]
                    }
                }
            ]
        }
    }

    /**
     * @inheritDoc
     */
    postProcess(database, httpClient) {
        return httpClient.post(`${configs.server}${configs.resources.device}`,
            JSON.stringify({cmd: 'photo'}),
            {'content-type': 'application/json'})
            .then(() => {
                return true;
            });
    }
}

module.exports = {TakePhoto};
