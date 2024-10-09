module.exports.runtime = {
    handler: async function ({ latitude, longitude }) {
        const callerId = `${this.config.name}-v${this.config.version}`;
        try {
            this.introspect(`${callerId} called with lat:${latitude} long:${longitude}...`);

            let boxSize = 0.002; // Start with a smaller area (about 200m x 200m)
            let mapData, notesData;

            while (boxSize > 0.0001) { // Minimum box size (about 10m x 10m)
                try {
                    const bbox = this._getBoundingBox(latitude, longitude, boxSize);

                    // Fetch map data (JSON)
                    const mapUrl = `https://api.openstreetmap.org/api/0.6/map.json?bbox=${bbox}`;
                    mapData = await this._fetchData(mapUrl);

                    // Fetch notes data (JSON)
                    const notesUrl = `https://api.openstreetmap.org/api/0.6/notes.json?bbox=${bbox}`;
                    notesData = await this._fetchData(notesUrl);

                    break; // If successful, exit the loop
                } catch (error) {
                    if (error.message.includes("You requested too many nodes")) {
                        boxSize /= 2; // Reduce box size by half
                        this.introspect(`Reducing bounding box size to ${boxSize}`);
                    } else {
                        throw error; // Re-throw if it's not a "too many nodes" error
                    }
                }
            }

            if (!mapData || !notesData) {
                throw new Error("Unable to fetch data even with minimum bounding box size");
            }

            // Fetch location context using Nominatim
            const contextData = await this._fetchLocationContext(latitude, longitude);

            // Process the data
            const processedData = this._processData(mapData, notesData, contextData);

            return JSON.stringify(processedData);
        } catch (e) {
            this.introspect(`${callerId} failed to invoke with lat:${latitude} long:${longitude}. Reason: ${e.message}`);
            this.logger(`${callerId} failed to invoke with lat:${latitude} long:${longitude}`, e.message);
            return `The tool failed to run. Error: ${e.message}`;
        }
    },

    _getBoundingBox(lat, lon, boxSize) {
        return `${Number(lon) - boxSize},${Number(lat) - boxSize},${Number(lon) + boxSize},${Number(lat) + boxSize}`;
    },

    async _fetchData(url) {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API request failed: ${response.status} ${response.statusText}. Response: ${text}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(`Expected JSON response but received: ${contentType}. Response: ${text}`);
        }

        return response.json();
    },

    async _fetchLocationContext(lat, lon) {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'AnythingLLM-CustomAgent/1.0' // It's good practice to identify your application to the Nominatim service
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API request failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    _processData(mapData, notesData, contextData) {
        const mapElements = {
            nodes: mapData.elements.filter(el => el.type === 'node').length,
            ways: mapData.elements.filter(el => el.type === 'way').length,
            relations: mapData.elements.filter(el => el.type === 'relation').length,
        };

        const notesCount = notesData.features ? notesData.features.length : 0;

        const location = {
            address: contextData.address,
            displayName: contextData.display_name,
        };

        // Extract some interesting tags from the map data
        const interestingTags = mapData.elements
            .filter(el => el.tags && (el.tags.name || el.tags.amenity || el.tags.highway))
            .map(el => ({
                name: el.tags.name,
                type: el.tags.amenity || el.tags.highway || el.type
            }))
            .slice(0, 5); // Limit to 5 interesting features

        return {
            location,
            mapElements,
            notesCount,
            interestingFeatures: interestingTags,
            summary: `This area is in ${location.displayName}. It contains ${mapElements.nodes} nodes, ${mapElements.ways} ways, ${mapElements.relations} relations, and ${notesCount} notes. Some interesting features include: ${interestingTags.map(tag => `${tag.name || 'Unnamed'} (${tag.type})`).join(', ')}.`
        };
    }
};