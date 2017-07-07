var fs = require('fs');
var doStuff = require('./short');

var paramFile = __dirname + '/testCodification_param.json';
var params = JSON.parse(fs.readFileSync(paramFile).toString('utf8').replace(/^\uFEFF/, '')); // remove BOM from file data
var jsonsFolder = __dirname + '/' + params.targetPath;


var inCsvFile = __dirname + '/' + params.inFile;
var outCsvFile = __dirname + '/' + params.outFile;
var csvString = fs.readFileSync(inCsvFile).toString('utf8').replace(/^\uFEFF/, '');
var csvRows = parseCsv(csvString, params.inSeparator);

var codeLineStart = Number(params.codeLineStart) - 1; // -1 for header of csv
var codeCount = Number(params.codeCount);
var codeLineEnd = codeLineStart + codeCount;
var codeColumn = Number(params.codeColumn) - 1;
var expColumn = Number(params.expColumn) - 1;
var trueColumn = Number(params.trueColumn) - 1;
var falseColumn = Number(params.falseColumn) - 1;
var expPattern = params.expPattern;

var newCsvRows = []; // for new csv file
newCsvRows.push(csvRows[0]); // for header of csv

for (var i = codeLineStart; i < codeLineEnd; i++) {
  var numFile = csvRows[i][codeColumn];
  var jsonFileName = params.targetFilePattern.replace("[CODE]", numFile);
  if (fs.existsSync(jsonsFolder + '/' + jsonFileName)) {
    console.log(jsonFileName + " exist");
    var expRegEx = new RegExp(expPattern, 'g');
    var matches = expRegEx.exec(csvRows[i][expColumn]);
    if (matches && matches[1]) {
      var doStuffResults = doStuff(jsonsFolder + '/' + jsonFileName, matches[1]);
      csvRows[i][trueColumn] = doStuffResults.truthy; // dummy results
      csvRows[i][falseColumn] = doStuffResults.falsy; // dummy results
    } else {
      console.log("expression not contains " + expPattern);
    }
  } else {
    console.log(jsonFileName + " does not exist");
  }
  newCsvRows.push(csvRows[i]);
}

fs.writeFileSync(outCsvFile, buildCsv(newCsvRows, params.outSeparator));




// function doStuff(path, expression) { // dummy
//   return {
//     path: path,
//     expression: expression
//   };
// }

function buildCsv(array, separator) {
  var lineArray = [];
  for (var i = 0; i < array.length; i++) {
    lineArray.push(array[i].join(separator));
  }
  return lineArray.join("\n");
}

function parseCsv(strData, strDelimiter) {
  strDelimiter = (strDelimiter || ",");
  var objPattern = new RegExp(("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
  var arrData = [[]];
  var arrMatches = null;
  while (arrMatches = objPattern.exec(strData)) {
    var strMatchedDelimiter = arrMatches[1];
    if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
      arrData.push([]);
    }
    var strMatchedValue;
    if (arrMatches[2]){
      strMatchedValue = arrMatches[2].replace(new RegExp( "\"\"", "g" ), "\"");
    } else {
      strMatchedValue = arrMatches[3];
    }
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  return( arrData );
}
