/** project imports */
const {Database} = require('./common/services/database');
const {DialogflowParser} = require('./common/parsers/dialogflow_parser');

/**
 * @param {TalosContext} context
 * @return {Promise<TalosResponse>}
 */
async function main(context) {

    const body = context.parsedBody();

    const intent = DialogflowParser.parseRequest(body);

    try {
        await intent.execute();
    } catch (e) {
        context.logger().error("Error executing intent", e);
    }

    intent
        .postProcess(new Database(context), context.clientHttp())
        .catch((error) => {
            context.logger().error("Error executing post process", error);
        })

    return {
        status: 200,
        body: intent.response()
    }
}

module.exports = {main};
