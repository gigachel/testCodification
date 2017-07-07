/* JSON expression validator */
const fs = require('fs');

/* Validator function */
const validate = function(obj,expr){
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
      console.log(_original,expr.value,_final)
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

module.exports = function(input_file,expression,style){

  /* prepare file and expression */
  let File = fs.readFileSync(input_file,'utf-8');
  // let _vals = expression.split(';');
  let _vals = [ "", expression]; // HACK
  let _expr = _vals[1].replace(/[=']/g, "!").split('!');
  let Expr = {
    key: _expr[0].replace(/[\[\]']+/g,'').split('.'),
    operand: _expr[1],
    value: _expr[2].replace(/"/g, ''),
    ref: _vals[0]
  }

  /* read through data */
  let Data = null;
  if(style == 'regular') Data = JSON.parse(File).data;
  else Data = JSON.parse(File).data.structureGenerique;

  /* Parse through the data */
  let Final = {truthy:0,falsy:0};
  Data.forEach(function(_obj){
    let _validated = validate(_obj,Expr)
    if(_validated == true) Final.truthy++;
    else if(_validated == false) Final.falsy++;
  })
  return Final;
};
