import { ipcRenderer } from 'electron'

export default {
    on: (event, callback) => {
        ipcRenderer.on('native-event', (_, data) => {
            if(event !== data.event) {
                return;
            }

            callback(data.payload);
        })
    }
}
