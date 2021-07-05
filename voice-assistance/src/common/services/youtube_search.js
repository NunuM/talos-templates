/** node imports  */
const fs = require('fs');
const path = require('path');
const https = require('https');
const querystring = require('querystring');

/** package imports */
const ytdl = require('ytdl-core');

/**
 * @class
 */
class YoutubeSearch {

    /**
     * Get search result as JSON
     *
     * @param {string} query
     * @return {Promise<any>}
     */
    static search(query) {

        return new Promise((resolve, reject) => {

            if (!(typeof query === 'string' && query.length > 0)) {
                reject(new TypeError('Invalid name'));
                return;
            }

            const options = {
                method: 'GET',
                hostname: 'www.youtube.com',
                path: '/results?search_query=' + querystring.escape(query),
                headers: {
                    'dnt': '1',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'service-worker-navigation-preload': 'true',
                    'x-client-data': 'CIa2yQEIo7bJAQjEtskBCKmdygEIqtDKAQi8h8sBCKCgywEIivLLAQit8ssBCNzyywEI8PLLAQiV+MsBCLP4ywEInvnLARiOnssBGLryywE=',
                    'accept-language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'cookie': 'CONSENT=YES+srp.gws-20210503-0-RC2.en+FX+212; VISITOR_INFO1_LIVE=u6QNqw94orc; SID=-gcVLqeR7imxnUYnqsbez0Nrf6FfuWp4vmP0OYKDv3BM_q66pYOKi3It4czuMfyE4ElJqA.; __Secure-3PSID=-gcVLqeR7imxnUYnqsbez0Nrf6FfuWp4vmP0OYKDv3BM_q66_esbX0tzkLoW_hL6fHQTAQ.; HSID=AuucsIbY9bLjI6Rs4; SSID=A5HXCB8Xqu6cC4gji; APISID=iRMSR829JTILJ5Ja/Au55Ayqjyxewhvgd5; SAPISID=1GJloLf6tYSf032j/AOTHM6MvAcn5ImC2S; __Secure-3PAPISID=1GJloLf6tYSf032j/AOTHM6MvAcn5ImC2S; YSC=aEySeKfKjCo; LOGIN_INFO=AFmmF2swRQIgagVKf_jmC1jg_34zOWQqrveRFhQO-FMuiYSHPeFQz7MCIQDaw-xQNwvjrZJHb5upijhUtDvMBM7XwjTXl66fZeBRWQ:QUQ3MjNmem1VUXFyTDNVNkVTM1ZXQmthZ3hEUm1VTmIySDdpdDZtTmpPUWwyamxEbm1uT05wSHZGTGJTRjYyNmNLWjVsVlVoa0UtZEdVVmNvblZfVERRakEwRXdGS0pNdmtFd0g2VXNwSmh3alhveHhGTjJWUzkzSW01WHRtVC1qejVpNVczY0pILTJJZi1uTGJUUFZON2dMMTlGYW5QTFZn; PREF=tz=Europe.Lisbon; SIDCC=AJi4QfEHAOIA7qVmYz0IaoA2QUI6CBhZiLmAG5lREoqdW9aTJhnLPA7OAWTZUURiICTExlxhozQ; __Secure-3PSIDCC=AJi4QfFvIOZvDwDATJEG5AICX2_2TLljA2_mjIu6ApkDrXVilyAZhnG30y5Qi5rm9XxqDCJCQTc; CONSENT=PENDING+711; SIDCC=AJi4QfF9LL4PxuVmoOyhjGmdskiOQy0IqI92au7ZrQ2-OOrrXQdBVLIS4A6A_AaXZkSAzxR16hU; __Secure-3PSIDCC=AJi4QfEhqK8cVu4MntgEneHvBs3pmW-AlFBdQcm_psFsR1ZEwdx8_HDOPhbvQ8VUUBxhLI7EkWM'
                },
            };

            const req = https.request(options, function (res) {

                if (res.statusCode > 299) {
                    reject(new Error("Upstream error:" + res.statusCode));
                    return;
                }

                const chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function (chunk) {
                    const body = Buffer.concat(chunks);

                    try {

                        const [_, second] = body.toString('utf8').split('ytInitialData');

                        const [almostJson] = second.substring(2).split('</script>');

                        const payload = JSON.parse(almostJson.trimEnd().slice(0, -1));

                        resolve(payload);

                    } catch (e) {
                        reject(e);
                    }
                });

                res.on("error", function (error) {
                    reject(error);
                });
            });

            req.end();
        });
    }

    /**
     * Obtain video URL
     *
     * @param {string} videoId
     *
     * @return {Promise<string>}
     */
    static audioInfo(videoId) {
        return ytdl.getInfo(videoId)
            .then((info) => {
                let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
                return audioFormats[0].url;
            });
    }

    /**
     * Download audio
     *
     * @param {string} videoId
     * @param {string} destiny
     *
     * @return {Promise<number>}
     */
    static download(videoId, destiny) {
        return new Promise((resolve, reject) => {
            let durationInMillis = 0;

            const request = ytdl(videoId, {filter: 'audioonly'});

            request.pipe(fs.createWriteStream(path.join(destiny, videoId + '.webm')));

            request.on('info', (_, b) => {
                durationInMillis = Number(b.approxDurationMs);
            });

            request.on('error', (error) => {
                reject(error);
            });

            request.on('finish', () => {
                resolve(durationInMillis);
            });
        });
    }
}

module.exports = {YoutubeSearch};

