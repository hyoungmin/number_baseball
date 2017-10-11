var express = require('express');
var pug = require('pug');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser('awekfjhak!@#!ZSDF'));

app.get('/number_baseball/initialize',function(req,res){
  if(req.signedCookies.input_arr) {
    res.clearCookie('input_arr');
  }
  if(req.signedCookies.result_arr) {
    res.clearCookie('result_arr');
  }
  if(req.signedCookies.possible_digit) {
    res.clearCookie('possible_digit');
  }

    res.redirect('/number_baseball');

});


app.get('/number_baseball',function(req,res){

var compiledFunction = pug.compileFile('./pug/number_baseball.pug');

var option = {};
  if(req.signedCookies.input_arr) {
      option.input_arr = req.signedCookies.input_arr;
      option.result_arr = req.signedCookies.result_arr;
  }
  if(req.signedCookies.possible_digit) {
    option.possible_digit = req.signedCookies.possible_digit;
  }

  res.send(compiledFunction(option));
});

app.post('/number_baseball',function(req,res){

  var isExist = function(array,value) {
    var result = false;

    for(var i = 0; i<array.length;i++){
        if(array[i] == value) {
          result = true;
          break;
        }
    }
    return result;
  }

  //해당 상수는 나중에 입력 받을 수 있도록 하자. 지금은 말고
  var min = 1;
  var max = 9;
  var digit = 3;

  var min_value = min;
  var max_value = max;

  for(var i = 0; i< digit-1; i++){
    min_value *= 10;
    max_value *= 10;
    min_value += min;
    max_value += max;
  }

  var input = parseInt(req.body.input);

  var circle = parseInt(req.body.circle);
  var triangle = parseInt(req.body.triangle);
  var miss = digit - circle - triangle;

  var valid = false;

  //유효성 검사 당장 급한 기본적인것만
  if(input>=min_value && input<=max_value) {
    if(circle>=0 && circle <= digit) {
      if(triangle >= 0 && triangle <= digit) {
        if(miss >= 0 && miss <= digit) {
          if(circle + triangle + miss == digit) {
            valid = true;
          }
        }
      }
    }
  }

  if(valid) {
  //나중에 유효성 검사 더 제대로 추가 필요, 지금은 그냥 하자
  var result = 100 * circle + 10* triangle + miss;

  if(req.signedCookies.input_arr) {
    var input_arr = req.signedCookies.input_arr;
    var result_arr = req.signedCookies.result_arr;
    input_arr.push(input);
    result_arr.push(result);
  } else {
    var input_arr = [input];
    var result_arr = [result];
  }

  //possible_digit[i][j] -> 앞에서 i+1번째에 j라는 숫자가 들어갈수 있는지?
  var possible_digit = new Array();

  //알고리즘 들어감
  for(var i = 0;i<digit;i++) {
    possible_digit[i] = new Array(max+1);
    for(var j = 0; j < max+1;j++) {
      if(j<min) possible_digit[i][j] = false;
      else possible_digit[i][j] = true;
    }
  }


  var input_split = new Array();
  var result_split = new Array();
  for(var i = 0;i<input_arr.length;i++){

    //나눌때 앞에서 부터 input_split[0] [1] 이렇게 들어가도록
    var input_tmp = parseInt(input_arr[i]);
    var result_tmp = parseInt(result_arr[i]);
    for(var j=0;j<digit;j++){
          input_split[digit-j-1] = input_tmp%10;
          result_split[digit-j-1] = result_tmp%10;
          input_tmp = parseInt(input_tmp/10);
          result_tmp = parseInt(result_tmp/10);
    }
    //다 틀리면 해당 숫자는 전부 경우의 수에서 제거
    if(miss == digit) {
      for(var j = 0; j<digit;j++) {
        for(var k = 0;k<digit;k++) {
          possible_digit[j][input_split[k]] = false;
        }
      }
    }
    //맞는게 하나도 없으면 각 숫자를 각 자리수에서 제거
    if(circle == 0) {
        for(var j = 0; j<digit;j++) {
          possible_digit[j][input_split[j]] = false;
        }
    }
    //동그라미가 세모가 합쳐서 0이라면 나머지 숫자들 전부 제거
    if(miss == 0) {
      for(var k=min;k<max;k++){
        if(!isExist(input_split,k)) {
            for(var j=0;j<digit;j++) {
              possible_digit[j][k] = false;
            }
        }
      }
    }

    //동그라미가 섞여있는 경우



  }

  //console.log(possible_digit);

  //알고리즘 끝
  res.cookie('possible_digit',possible_digit,{signed:true})
  res.cookie('input_arr',input_arr,{signed:true});
  res.cookie('result_arr',result_arr,{signed:true});
}
  res.redirect('/number_baseball');
});

app.listen(3000,function(req,res){
  console.log('connected to 3000 port');
})
