// This file is used to run the handler function locally.
const osmApi = require('./handler');

async function main() {
    // Create a mock context object
    const context = {
        config: {
            name: 'OpenStreetMap API Interface',
            version: '1.0.0'
        },
        introspect: console.log,
        logger: console.error
    };

    // Merge the context with the runtime object
    const mergedContext = { ...osmApi.runtime, ...context };

    // Sample coordinates (London, UK)
    const sampleInput = {
        latitude: "51.5074",
        longitude: "-0.1278"
    };

    // Call the handler function
    const result = await osmApi.runtime.handler.call(mergedContext, sampleInput);
    console.log(result);
}

main().catch(console.error);