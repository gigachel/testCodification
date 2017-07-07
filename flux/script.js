/* JSON expression validator */
const fs = require('fs');
let Logger = [];
let Map = {};


/* Command line inputs */
const input = fs.readFileSync(process.argv[2],'utf-8').trim(); // argument 1 = input file
const Expr = fs.readFileSync(process.argv[3],'utf-8').trim().split('\n') // argument 2 = expressions file

/* Create an expression map converting text to json */
let exprMap = [];
Expr.forEach(function(expr){
  let _vals = expr.split(';');
  let _expr = _vals[1].replace(/[=']/g, "!").split('!');
  exprMap.push({
    key:_expr[0].replace(/[\[\]']+/g,'').split('.'),
    operand:_expr[1],
    value:_expr[2].replace(/"/g, ''),
    ref:_vals[0]
  })
})

/* Validator function */
var validate = function(obj,expr){
  var _original = null;
  expr.key.forEach(function(k){
    _original = (_original ? _original[k] : obj[k]);
  })
  if(_original){
    switch(expr.operand){
      case 'ega': _final = expr.value == _original;
      break;
      case 'neg':_final = expr.value != _original;
      break;
      case 'sup':_final = expr.value > _original;
      break;
      case 'sue':_final = expr.value >= _original;
      break;
      case 'inf':_final = expr.value < _original;
      break;
      case 'ine':_final = expr.value <= _original;
      break;
      case 'com':_final = _original.startsWith(expr.value);
      break;
      case 'nco':_final = !_original.startsWith(expr.value);
      break;
      case 'con':_final = _original.includes(expr.value);
      break;
      case 'ncn':_final = !_original.includes(expr.value);
      break;
      case 'ter':_final = _original.endsWith(expr.value);
      break;
      case 'nte':_final = !_original.endsWith(expr.value);
      break;
    }
    return _final;
  }
}

/* Loop through all the files */
var run = function(data,_file){
  console.log("Running",_file);
  data.forEach(function(_obj){
    exprMap.forEach(function(expr){
      let _ref = expr.ref;
      if(!Map[_file][_ref]) Map[_file][_ref] = {truthy:0,falsy:0,expr:""+expr.key.join('.')+" "+expr.operand+" "+expr.value+""};
      let _validated = validate(_obj,expr)
      if(_validated == true) Map[_file][_ref].truthy++;
      else if(_validated == false) Map[_file][_ref].falsy++;
    })
  })
}

/* Logger function - writes to a csv file */
function Log(){
  console.log(Map);
  for(_file in Map){
    for(_ref in Map[_file]){
      Logger.push(""+_ref+","+Map[_file][_ref].truthy+","+Map[_file][_ref].falsy+","+Map[_file][_ref].expr+","+_file+",")
    }
  }
  var _str = "expression_reference, true_count, false_count, expression_string, file_name";
  Logger.forEach(function(log){_str = _str+"\n"+log});
  fs.writeFileSync('log.csv',_str);
  console.log("Log written at log.csv");
}

/* Main function */
let Files = input.split('\n');
void(function main(){
  if(Files.length == 0) Log();
  else{
    let _file = Files[0];
    Map[_file] = {};
    fs.readFile(_file,{encoding:'utf-8'},function(err,data){
      if(err) console.log(_file,err);
      else{
        if(JSON.parse(data).data && JSON.parse(data).data.structureGenerique) run(JSON.parse(data).data.structureGenerique,_file);
        Files.shift();
        main();
      }
    })
  }
})();
