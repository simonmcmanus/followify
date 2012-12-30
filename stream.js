var https = require('https');   


  console.log('her1');

module.exports = function(searches, callback) {
  var options = {   
  host : 'stream.twitter.com',   
    path : '/1.1/statuses/filter.json?track='+encodeURI(searches.join(','))+'&delimited=50000',
    method : 'GET',  
    headers : {   
      "Authorization": "Basic dXJwcm9ibGVtc2hhcmVkOjJiZXNvbWUx"
    }
  };
  var request = https.request(options,function(response) {
    response.on('data',function(chunk){
     
      try{
//        console.log('try'+''  +chunk);
        var tweet = JSON.parse(chunk);  
        callback(null, tweet);
        
      }catch(e) {
//        console.log('bad', e, ''  +chunk);
        cache = chunk;
      }
    }); 

  });  
 request.end();
};

