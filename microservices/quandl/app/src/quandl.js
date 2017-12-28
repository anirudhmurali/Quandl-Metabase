const utils = require('./utils');
const customRequest = utils.customRequest;
const config = require('./config');

/**
 * @param cursorId
 * @param callback - function(error, insertArray, nextCursorId)
 */
function fetchData(requestUrl, responseToInsertArrayConverter, callback) {
    console.log('Fetching quandly data: CURSORID' + requestUrl);

    customRequest(requestUrl, function(error, response) {
        if (error) {
            console.log('Fetching data from quandl failed');
            console.log(error);
            callback(error, null, null);
        } else {
            console.log('Fetching data from quandl successful');
            callback(null, responseToInsertArrayConverter(response), null);
        }
    });
}


//Fetch metadata
function fetchMetadata(metadataUrl, callback) {
    console.log('STEP 1: Fetching metadata from quandl');
    customRequest(metadataUrl, function(error, response) {
        if (error) {
            console.log("Error fetching metadata from quandl");
            console.log(error);
            callback(error, null);
        } else  {
            console.log("Successfully fetched metadata from Quandl");
            callback(null, response);
        }
    });
}


module.exports = {
    fetchData,
    fetchMetadata
};