/** project imports */
const {PlayMusic} = require('../intents/play_music');
const {TakePhoto} = require('../intents/take_photo');

class DialogflowParser {

    /**
     * @param {any} payload from Dialogflow request
     * @return {Intent}
     */
    static parseRequest(payload) {
        if (payload.hasOwnProperty('queryResult')
            && payload.queryResult.hasOwnProperty('intent')
            && payload.queryResult.intent.displayName === 'Play') {
            return new PlayMusic(payload.queryResult.parameters['music-artist']);
        } else {
            return new TakePhoto();
        }
    }
}

module.exports = {DialogflowParser};
