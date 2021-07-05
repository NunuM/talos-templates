/** node imports  */
const fs = require('fs');
const util = require('util')
const path = require('path');
const childProcess = require('child_process');

/** project imports */
const {YoutubeSearch} = require('./youtube_search');

const backoff = util.promisify(setTimeout);

/**
 * @class
 */
class DeviceService {

    /**
     * @constructor
     * @param {string} storageDir
     */
    constructor(storageDir) {
        this.photosDir = path.join(storageDir, 'photos');
        this.songsDir = path.join(storageDir, 'songs');
        /**
         * @type {string[]}
         */
        this.songsToDownload = [];
        /**
         * @private
         * @type {Array<{videoId:string, duration:number}>}
         */
        this.songsToPlay = [];

        this.isPlaying = false;
        this.isDownloading = false;

        try {
            fs.mkdirSync(this.photosDir, {recursive: true});
            fs.mkdirSync(this.songsDir, {recursive: true});
        } catch (e) {
            console.error("Error creating directories", e);
        }
    }

    /**
     * List directory
     * @return {string[]}
     */
    listPhotos() {
        return fs.readdirSync(this.photosDir);
    }

    /**
     * Take picture
     * @return {boolean}
     */
    takePicture() {
        childProcess.spawn('termux-camera-photo',
            [
                path.join(this.photosDir, new Date().getTime() + '.jpeg')
            ]
        );

        return true;
    }

    /**
     * Get photo
     *
     * @param {string} photo
     * @return {Promise<Buffer>}
     */
    getPhoto(photo) {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(this.photosDir, photo), (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        })
    }

    /**
     * @param {Array<string>} songs
     */
    queueSongs(songs) {
        this.songsToDownload.push(...songs);

        if (!this.isDownloading) {
            this.isDownloading = true;
            this.downloadQueue()
                .finally(() => {
                    this.isDownloading = false;
                });
        }
    }

    /**
     * Download queue
     * @return {Promise<void>}
     */
    async downloadQueue() {
        while (this.songsToDownload.length !== 0) {
            const videoId = this.songsToDownload.shift();
            try {
                const duration = await YoutubeSearch.download(videoId, this.songsDir);
                this.songsToPlay.push({videoId, duration});

                if (!this.isPlaying) {
                    this.isPlaying = true;
                    this.play()
                        .finally(() => {
                            this.isPlaying = false;
                        });
                }
            } catch (e) {
                console.error("Error downloading song", e);
            }
        }
    }

    /**
     * Play queue
     * @return {Promise<void>}
     */
    async play() {
        while (this.songsToPlay.length !== 0) {

            const song = this.songsToPlay.shift();

            const songDir = path.join(this.songsDir, song.videoId + '.webm');

            childProcess.spawn('termux-media-player', ['play', songDir]);

            await backoff(song.duration);
        }
    }
}

module.exports = {DeviceService};
