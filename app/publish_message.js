// Imports the Google Cloud client library
const { PubSub } = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

async function publishMessage(topicNameOrId, data) {
    // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
    console.log(data)
    const dataBuffer = Buffer.from(data);

    try {
        const messageId = await pubSubClient
            .topic(topicNameOrId)
            .publishMessage({ data: dataBuffer });
        console.log(`Message ${messageId} published.`);
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        process.exitCode = 1;
    }
}
// [END pubsub_publish_with_error_handler]
// [END pubsub_quickstart_publisher]

function main(
    topicNameOrId = 'YOUR_TOPIC_NAME_OR_ID',
    data = JSON.stringify({ foo: 'bar' })
) {
    publishMessage(topicNameOrId, data).catch(err => {
        console.error(err.message);
        process.exitCode = 1;
    });
}

module.exports = { main }