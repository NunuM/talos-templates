/** project imports */
const device = require('./common/configs/device.json');
const {DeviceService} = require('./common/services/device_service');

const deviceInstance = new DeviceService(device.storeDir);

/**
 * @param {TalosContext} context
 * @return {Promise<TalosResponse>}
 */
async function main(context) {

    const body = context.parsedBody();

    if (body.cmd === 'photo') {
        deviceInstance.takePicture();
    } else if (body.cmd === 'display') {
        try {
            const data = await deviceInstance.getPhoto(body.args[0]);
            return {
                status: 200,
                body: data,
                headers: {
                    "content-type": 'image/jpeg'
                }
            }
        } catch (e) {
            return {
                status: 500,
                body: {error: e.toString()}
            }
        }
    } else if (body.cmd === 'list') {
        return {
            status: 200,
            body: deviceInstance.listPhotos()
        };
    } else if (body.cmd === 'songs') {
        deviceInstance.queueSongs(body.args || []);
    }

    return {status: 200, body: {}};
}

module.exports = {main};
