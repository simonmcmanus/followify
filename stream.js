var https = require('https');   


  console.log('her1');

module.exports = function(searches) {
  var options = {   
  host : 'stream.twitter.com',   
    path : '/1.1/statuses/filter.json?track='+encodeURI(searches.join(',')),
    method : 'GET',  
    headers : {   
      "Authorization": "Basic dXJwcm9ibGVtc2hhcmVkOjJiZXNvbWUx"
    }
  };
  var request = https.request(options,function(response) {   
    response.on('data',function(chunk){
      console.log('h1');
      try{
        var tweet = JSON.parse(chunk);  
        console.log(tweet.text);  
      }catch(e) {

      }
    });  
  });  
 request.end();
};

