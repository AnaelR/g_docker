// Imports the Google Cloud client library
const { PubSub } = require('@google-cloud/pubsub');
const ZipStream = require('zip-stream');
const photoModel = require('./photo_model');
const request = require('request')
const { Storage } = require('@google-cloud/storage');
const registeredTags = require('./registered_tags');
const { initializeApp, applicationDefault } = require('firebase-admin/app');


const { getDatabase } = require('firebase-admin/database');

const firebaseApp = initializeApp({
    credential: applicationDefault(),
    databaseURL: 'https://temporaryprojectdmii-default-rtdb.firebaseio.com/'
});

const auth = getAuth(app);

const db = getDatabase();
const ref = db.ref('anael');

const zipRef = ref.child('zip');

// Creates a client; cache this for further use
const pubSubClient = new PubSub();
let storage = new Storage();

const store = new registeredTags()

function listenForMessages(subscriptionNameOrId) {
    // References an existing subscription
    const subscription = pubSubClient.subscription(subscriptionNameOrId);

    // Create an event handler to handle messages
    const messageHandler = async (message) => {
        console.log(`Received message ${message.id}:`);
        console.log(`\tData: ${message.data}`);
        console.log(`\tAttributes: ${message.attributes}`);

        const args = JSON.parse(message.data.toString())

        // "Ack" (acknowledge receipt of) the message
        var zip = new ZipStream()

        const file = await storage
            .bucket('dmii2023bucket')
            .file('public/users/anael-' + args.tags + '.zip');
        const stream = file.createWriteStream({
            metadata: {
                contentType: 'application/zip',
                cacheControl: 'private'
            },
            resumable: false
        });

        zip.pipe(stream)
        let toZipPhotos

        await photoModel
            .getFlickrPhotos(args.tags, args.tagParameter)
            .then(async photos => {
                toZipPhotos = photos;

                for (let index = 0; index < toZipPhotos.length; index++) {
                    await new Promise((resolve, reject) => {
                        const photo = toZipPhotos[index];
                        const photostream = request(photo.media.b)
                        zip.entry(photostream, { name: (photo.title || index.toString()) + '.jpg' }, err => {
                            if (err) {
                                reject(err)
                                return
                            }
                            resolve()
                        })
                    })
                }
                zip.finalize()
            })
            .catch(error => {
                console.log('error in message handler', error);
            });
        store.setTags(args.tags)
        zipRef.set({
            [args.tags]: {
                zip: 'public/users/anael-' + args.tags + '.zip'
            }
        })
        message.ack();

    };

    // Listen for new messages until timeout is hit
    subscription.on('message', messageHandler);

    // Wait a while for the subscription to run. (Part of the sample only.)
}
// [END pubsub_subscriber_async_pull]
// [END pubsub_quickstart_subscriber]

function main(
    subscriptionNameOrId = 'YOUR_SUBSCRIPTION_NAME_OR_ID'
) {
    listenForMessages(subscriptionNameOrId);
}

module.exports = main