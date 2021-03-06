/** node imports  */
const crypto = require('crypto');

/**
 * @class
 */
class Database {

    /**
     * @constructor
     *
     * @param {TalosContext} context
     */
    constructor(context) {
        /**
         * @type {talos.Database}
         */
        this.driver = context.database();
    }

    /**
     * @param {Artist} artist
     * @return {Promise<boolean>}
     */
    async saveArtist(artist) {

        const artistId = crypto
            .createHash('md5')
            .update(artist.name.toLowerCase().replace(/ +/gm, ''))
            .digest('hex')
            .toString('utf8');

        const result = await this.driver.query(
            'SELECT * from artist WHERE id=?',
            [artistId]
        );

        if (result.rows.length === 0) {
            await this.driver
                .query(
                    'INSERT INTO artist (id, artist_name, avatar) VALUES (?,?,?)',
                    [artistId, artist.name, artist.avatar]
                );
        } else {
            return true;
        }

        for (const [videoId, songName] of artist.songs) {
            await this.driver.query(
                'INSERT INTO songs (artist_id, video_id, song_name) VALUES (?,?,?)',
                [artistId, videoId, songName]
            );
        }

        return true;
    }

}

module.exports = {Database};
