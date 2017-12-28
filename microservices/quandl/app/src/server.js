var utils = require('./utils');
var customRequest = utils.customRequest;
var hasura = require('./hasura');
var quandl = require('./quandl');
var config = require('./config');
var express = require('express');
var app = express();

var bodyParser = require('body-parser');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

//your routes here
app.get('/', function (req, res) {
    res.send("Hello Worldasdasd!!!!");
});

/**
 * request body:
 * {
 *  vendor_code: <>,
 *  datatable_code: <>,
 * }
 *
 */
app.post('/add_data', function (req, res) {
	var quandlCode = req.body.quandl_code;
	quandlCode = quandlCode.split("/");
    var vendorCode = quandlCode[0];
    var datatableCode = quandlCode[1];


	quandl.fetchMetadata(config.getQuandlMetadataUrl(vendorCode, datatableCode), function(error, responseJSON) {
	  if (error) {
	      res.status(401).json({'error': 'Could not fetch quandl metadata'});
	  } else {
	  	  hasura.createHasuraTable(utils.getTableName(vendorCode, datatableCode), responseJSON.dataset.column_names, responseJSON.dataset.column_names[0], function(error, response) {
	          if (error) {
	          		if(error.includes("already exists")) {
	          			res.status(401).json({'error': 'Table already exists.'});
	          		}
	          		else {
	          			res.status(401).json({'error': 'Creating Table failed.'});
	          		}
	          } else {
	              hasura.insertDataToTable('quandl_checkpoint', [{ vendor_code: vendorCode, datatable_code: datatableCode }], function(error, response) {
	                  if (error) {
	                      res.status(401).json({'error': 'Error inserting quandl_checkpoint'});
	                      console.log(error);
	                  } else {
	                      fetchFromQuandlAndInsertIntoHasura(vendorCode, datatableCode, res);
	                  }
	              });
	          }
	      });
	  }
	});
});

function fetchFromQuandlAndInsertIntoHasura(vendorCode, datatableCode, res) {
    quandl.fetchData(config.getQuandlDataUrl(vendorCode, datatableCode), utils.quandlToHasuraConverter, function(error, insertArray) {
        if (error) {
            res.status(401).json({'error': 'Could not get data from quandl'});
        } else {
            hasura.batchInsertDataIntoHasura(utils.getTableName(vendorCode, datatableCode), insertArray, function(error, response) {
                if (error) {
                    res.status(401).json({'error': 'Inserting data into hasura failed' + JSON.stringify(insertArray[0])});
                } else {
                    res.status(200).json({'message': 'Successfully inserted data into table: ' + utils.getTableName(vendorCode, datatableCode)});
                    
                }
            });
        }
    });
}

app.listen(8080, function () {
    console.log('Example app listening on port 8080!');
});
