const QUANDL_API_KEY = process.env.QUANDL_API_KEY;

const dataUrl = process.env.ENV === 'dev' ? 'http://localhost:6432' : 'http://data.hasura';

const hasura = {
    url: {
        data: dataUrl + '/v1/query'
    }
};

const quandl = {
    url: {
        data: 'https://www.quandl.com/api/v3/datasets'
    }
};

function getQuandlMetadataUrl(vendorCode, datatableCode) {
    var url = quandl.url.data + '/' + vendorCode + '/' + datatableCode + '/metadata.json?api_key=' + QUANDL_API_KEY;
    console.log(url);
    return quandl.url.data + '/' + vendorCode + '/' + datatableCode + '/metadata.json?api_key=' + QUANDL_API_KEY;
}

function getQuandlDataUrl(vendorCode, datatableCode) {
    
    return quandl.url.data + '/' + vendorCode + '/' + datatableCode + '.json?api_key=' + QUANDL_API_KEY;
}

module.exports = {
    hasura,
    quandl,
    getQuandlMetadataUrl,
    getQuandlDataUrl
};