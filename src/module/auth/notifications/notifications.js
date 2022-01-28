var admin = require("firebase-admin")
const serviceAccount = require('./secret.json')
const winston = require('winston')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging()
const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24, // 1 day
};

class Notification {
    sendNotification(topic, payload) {
        console.log(topic, payload)
        messaging.sendToTopic(topic, payload, options).then(res => {
            console.log(res.messageId)
        }).catch(error => console.error(error))
    }



    static getInstance() {
        if (!this.instance) {
            this.instance = new this()
        }
        return this.instance
    }
}

module.exports = Notification