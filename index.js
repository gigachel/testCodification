var fs = require('fs');
var url = require('url');
var querystring = require('querystring');

var args = process.argv.slice(2);

var jsonsFolder = __dirname + '/jsons';
var csvFile = __dirname + '/Recette_API_CodificationV1.0.csv';

var csvString = fs.readFileSync(csvFile).toString();
var csvRows = CSVToArray(csvString, ";");

var startLine = Number(args[0]) || 2;
var stopLine = Number(args[1]) ? Number(args[1]) + 1 : csvRows.length;

for (var i = startLine; i < stopLine; i++) {
  var numFile = csvRows[i][2];
  if (fs.existsSync(jsonsFolder + '/Codification_resultat_' + numFile + '.json')) {
    console.log("File Codification_resultat_" + numFile + ".json exist");
    var parsedUrl = url.parse(csvRows[i][1]);
    var parsedQuery = querystring.parse(parsedUrl.query);
    var queryNames = Object.keys(parsedQuery);
    for (var j = 0; j < queryNames.length; j++) {
      if (queryNames[j].indexOf("filter") === 0) {
        var needQueryName = queryNames[j].replace("filter", "");
        doStuff(jsonsFolder + '/Codification_resultat_' + numFile + '.json', needQueryName + "=" + parsedQuery[queryNames[j]]);
        break;
      } else if (j === queryNames.length - 1) {
        console.log("expression not contains 'filter'");
      }
    }
  } else {
    console.log("File Codification_resultat_" + numFile + ".json does not exist");
  }
}



function doStuff(path, expression) {
  console.log("doStuff(): path - " + path + ", expression - " + expression);
}

function CSVToArray( strData, strDelimiter ) {
  strDelimiter = (strDelimiter || ",");
  var objPattern = new RegExp(("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
  var arrData = [[]];
  var arrMatches = null;
  while (arrMatches = objPattern.exec( strData )) {
    var strMatchedDelimiter = arrMatches[ 1 ];
    if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
      arrData.push( [] );
    }
    var strMatchedValue;
    if (arrMatches[ 2 ]){
      strMatchedValue = arrMatches[ 2 ].replace(new RegExp( "\"\"", "g" ), "\"");
    } else {
      strMatchedValue = arrMatches[ 3 ];
    }
    arrData[ arrData.length - 1 ].push( strMatchedValue );
  }
  return( arrData );
}
