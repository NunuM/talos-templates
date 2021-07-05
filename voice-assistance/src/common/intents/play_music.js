/** project imports */
const {Intent} = require('./intent');
const {Artist} = require('../models/artist');
const configs = require('../configs/api.json');
const {YoutubeSearch} = require('../services/youtube_search');

/**
 * @class
 * @implements {Intent}
 */
class PlayMusic extends Intent {

    /**
     * @constructor
     * @param {string} artistToSearch
     */
    constructor(artistToSearch) {
        super();
        this._artistToSearch = artistToSearch;
        /**
         * @type {Artist}
         * @private
         */
        this._artist = null;
    }

    /**
     * @inheritDoc
     */
    async execute() {

        const searchResult = await YoutubeSearch.search(this._artistToSearch);

        this._artist = Artist.fromYoutubeResponse(searchResult);

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
                            this._artist
                                ? `We have found ${this._artist.songs.size} songs, they will be played in any moment.`
                                : `Sorry, we didn't find the artist ${this._artistToSearch}, check if the name is correct.`
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
        if (this._artist) {
            httpClient.post(`${configs.server}${configs.resources.device}`,
                JSON.stringify({cmd: 'songs', args: Array.from(this._artist.songs.keys())}),
                {'content-type': 'application/json'})
                .then(() => {
                    return true;
                });

            return database.saveArtist(this._artist);
        }

        return Promise.resolve(true);
    }
}

module.exports = {PlayMusic};
