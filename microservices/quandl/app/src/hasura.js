const utils = require('./utils');
const customRequest = utils.customRequest;
const config = require('./config');

/**
 *
 * @param objects
 * @param callback
 */
function insertDataToTable(tableName, objects, callback) {
    const options = {
        method: 'POST',
        url: config.hasura.url.data,
        headers: utils.adminHeaders,
        body: JSON.stringify({
            type: 'insert',
            args: {
                table: tableName,
                objects: objects
            }
        })
    };
    customRequest(options, callback);
}

function batchInsertDataIntoHasura(tableName, insertArray, callback) {
    console.log('Size of insertArray: ' + insertArray.length);
    var batchArray = []; 
    var isLastTime = false;
    if (insertArray.length < 1000) {
        batchArray = insertArray;
        isLastTime = true;
    } else {
        batchArray = insertArray.splice(0, 1000);        
    }

    if (batchArray.length === 0) {
        callback(null, "Successful");
        return;
    }
    insertDataToTable(tableName, batchArray, function (error, response) {
        if (error) {
            callback(error, null);
        } else {
            batchInsertDataIntoHasura(tableName, isLastTime ? [] : insertArray, callback);
        }
    });
}

function createHasuraTable(tableName, columns, primaryKey, callback) {
    console.log('STEP 2: Creating table in Hasura: ' + tableName);
    if (columns.length === 0) {
        console.log('Column length is 0. Exiting');
        callback('Column length is 0', null);
        return;
    }
    var sqlStatement = 'CREATE TABLE ' + tableName + '(';
    columns.forEach(function(column, index, array) {
        sqlStatement += utils.getValidColumnName(column) + ' ' + utils.getPostgresqlTypeFromColumnType(column);
        if (index !== array.length - 1 || (primaryKey && primaryKey.length > 0)) {
            sqlStatement += ', ';
        }
    });
    if (primaryKey) {
        sqlStatement += 'PRIMARY KEY(';
        sqlStatement += primaryKey;   
        sqlStatement += ')';
    }
    sqlStatement += ');';
    customRequest({
        method: 'POST',
        url: config.hasura.url.data,
        headers: utils.adminHeaders,
        body: JSON.stringify({
            type : "run_sql",
            args : {
                sql : sqlStatement
            }
        })
    }, function(error, response) {
        if (error) {
            console.log('Creating table failed');
            console.log(error);
            callback(error, null);
        } else {
            //Successful
            console.log('Creating table successful');
            trackTableInHasura(tableName, callback);
        }
    });
}

function trackTableInHasura(tableName, callback) {
    console.log('STEP 3: Track created table in Hasura');
    customRequest({
        method: 'POST',
        url: config.hasura.url.data,
        headers: utils.adminHeaders,
        body: JSON.stringify({
            type: 'add_existing_table_or_view',
            args: {
                name: tableName
            }
        })
    }, function(error, response) {
        if (error) {
            console.log("Error tracking table on Hasura");
            console.log(error);
            callback("Error tracking table on Hasura", null);
        } else {
            console.log("Successfully tracked table on Hasura");
            callback(null, "Successfully tracked table on Hasura");
        }
    });
}

module.exports = {
    insertDataToTable,
    trackTableInHasura,
    createHasuraTable,
    batchInsertDataIntoHasura
};