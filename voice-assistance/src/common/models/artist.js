/**
 * @class
 */
class Artist {

    /**
     * @constructor
     * @param {string} name
     * @param {string} avatar
     */
    constructor(name, avatar) {
        this.name = name;
        this.avatar = avatar;
        this._songs = new Map();
    }

    /**
     * @param {string} title
     * @param {string} videoId
     */
    addSong(title, videoId) {
        this._songs.set(videoId, title);
    }

    /**
     * @return {Map<string,string>} videoId => songName
     */
    get songs() {
        return this._songs;
    }

    toJSON() {
        return {
            artist: this.name,
            avatar: this.avatar,
            songs: Array.from(this.songs.values())
        }
    }

    /**
     * @param {object} payload
     * @return {Artist|null}
     */
    static fromYoutubeResponse(payload) {

        try {
            const rightCard = payload
                .contents
                .twoColumnSearchResultsRenderer
                .secondaryContents
                .secondarySearchContainerRenderer
                .contents[0]
                .universalWatchCardRenderer;

            const artistName = rightCard.header.watchCardRichHeaderRenderer.title.simpleText;
            const avatar = rightCard.header.watchCardRichHeaderRenderer.avatar.thumbnails[0].url;

            const playlist = rightCard.sections[0].watchCardSectionSequenceRenderer.lists[0].verticalWatchCardListRenderer
                .items.map((item) => {
                    return {
                        title: item.watchCardCompactVideoRenderer.title.simpleText,
                        videoId: item.watchCardCompactVideoRenderer.navigationEndpoint.watchEndpoint.videoId
                    }
                });

            const artist = new Artist(artistName, avatar);

            for (const song of playlist) {
                artist.addSong(song.title, song.videoId);
            }

            return artist;
        } catch (e) {
            console.error("Error creating artist", e);
        }

        return null;
    }
}

module.exports = {Artist};
