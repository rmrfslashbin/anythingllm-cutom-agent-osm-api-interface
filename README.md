# OpenStreetMap API Interface

This custom agent skill for AnythingLLM fetches geographic data for given coordinates using the OpenStreetMap API.

## Usage in AnythingLLM

Invoke this skill by providing latitude and longitude coordinates. For example:

"@agent What's in the area around latitude 51.5074 and longitude -0.1278?"

The agent will return information about the map elements and notes in the vicinity of the given coordinates.

## Local Testing

To test the skill locally without running AnythingLLM:

1. Ensure you have Node.js installed on your system.
2. Open a terminal and navigate to the `osm-api-interface` directory.
3. Run the following command: `node run.js`. This will execute the handler function with sample coordinates (London, UK) and display the result.
4. To test with different coordinates, modify the `sampleInput` object in `run.js`.

## Requirements

- AnythingLLM v1.2.2 or later
- Node.js 18+ for local testing
- Internet connection to access the OpenStreetMap API

## Note

This skill respects OpenStreetMap's usage policy. Please be mindful of rate limiting and avoid making too many requests in a short period.

## Installation in AnythingLLM
After creating all the files:

1. Ensure the osm-api-interface folder is in your AnythingLLM storage directory under plugins/agent-skills/.
2. Restart AnythingLLM or reload the page to load the new custom agent skill.

## Usage in AnythingLLM
Once installed, you can use the OpenStreetMap API interface in your conversations with AnythingLLM. For example:

```
User: "@agent What's in the area around latitude 51.5074 and longitude -0.1278?"
```

The agent will then use the custom skill to fetch and process data from OpenStreetMap, providing information about the geographic area specified by the coordinates.

## Local Testing
To test the skill without running AnythingLLM:

1. Open a terminal and navigate to the osm-api-interface directory.
2. Run node run.js.
3. The script will execute the handler function with sample coordinates and display the result.
This local testing capability allows you to quickly iterate and debug your custom agent skill before integrating it with AnythingLLM.

## Conclusion
You have now set up a custom agent skill for AnythingLLM that interfaces with the OpenStreetMap API. This skill allows the AI to provide geographic information about specific locations based on latitude and longitude coordinates. Remember to respect OpenStreetMap's usage policy and avoid making too many requests in a short period.