var https = require('https');   


  console.log('her1');

module.exports = function(searches, callback) {
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
      var cache = null;
      try{

        if(cache){
          chunk = chunk+chunk;
          cache = null;
        }
        console.log('in try');
        var tweet = JSON.parse(chunk);  
        callback(null, tweet);
        console.log(tweet.text);  
      }catch(e) {
        console.log('ERROR', e, chunk);
        cache = chunk;
      }
    });  
  });  
 request.end();
};

