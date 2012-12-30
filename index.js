var express = require('express');
var http = require('http');
var path = require('path');



var express = require('express');

var CONFIG = require('config');


if (process.env.REDISTOGO_URL) {
	var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var redis = require("redis").createClient(rtg.port, rtg.hostname);
	redis.auth(rtg.auth.split(":")[1]);
} else {
	var redis = require("redis").createClient();
}



var config = {
        consumerKey: "sJaEIiV4X014iIC6uvzKDA", /* per appications - manage apps here: https://dev.twitter.com/apps */
     consumerSecret: "40wRAIu9a9bgAKWWltTP7NutSZxEMsPZJ5UhTZitmgw", /* per appications - manage apps here: https://dev.twitter.com/apps */
             domain: "http://192.168.0.2:83",
              login: "/twitter/sessions/connect",
             logout: "/twitter/sessions/logout",
      loginCallback: "/twitter/sessions/callback",  /* internal */
   completeCallback: "/search/gosquared"  /* When oauth has finished - where should we take the user too */
};

twitterAuth = require('./tauth.js')(config);


var stream = require('./stream.js')([
    'ignoring my complaint',
    'ignoring my emails',
    'problem shared',
    'my complaint',
    'Im going to complain',
    'I want to complain',
    'i intend to complain',
    'expect my complaint',
    'investigate my complaint',
    'official complaint',
    'response to my complaint',
    'reply to my complaint',
    'ignoring me regarding complaint',
    'complaint escalated'
], function(error, tweet) {

	setTimeout(function() {
		console.log('follow', tweet.user.screen_name + ' - ' + tweet.text);
		redis.hmset('user:'+tweet.user.screen_name, 'followed', +new Date(), 'tweet', tweet.text);
		twitterAuth.api.friendships.create(
			{ screen_name: tweet.user.screen_name, follow: true }, 
			{ token: CONFIG.twitter.token, secret: CONFIG.twitter.secret }, 
			function(error, data) {
				console.log('done1');
		});
	}, 3000);

});


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8001);
});

 
app.use(express.cookieParser());
app.use(express.session({ secret: 'secret key' }));
app.use(express.bodyParser());

/*
ToDOs - 

track that we previously followed someone. 

Store how long since we followed them. 


unfollow users who have not followed back. 

keep levels even so we do not look like a spam bot.



 */


app.get('/', function(req, res){
  twitterAuth.api.search.tweets({
  	q: 'beagle'
  }, { token: CONFIG.twitter.token, secret: CONFIG.twitter.secret }, 
  function(error, data) {
  	res.send(data);
  });
});

app.get('/unfollow', function(req, res){

	// this has a serios effect on rate limits.
	twitterAuth.method('friends/list', 'GET', {
		cursor: -2
	}, {
			token: CONFIG.twitter.token, 
			secret: CONFIG.twitter.secret
		}, function(error, data) {
		console.log(data);
		var ids = data.data.users.map(function(a) {
			return a.id
		});	
		twitterAuth.method('friendships/lookup', 'GET', {user_id: ids.join(',')}, {token: CONFIG.twitter.token, secret: CONFIG.twitter.secret}, function(e, d) {
			var out = [];
			var c = d.data.length;
			while(c--) {
				if(d.data[c].connections.join('').indexOf('followed_by') < 0) { // they not following us.
					console.log('Unfollow: '+d.data[c].screen_name);

					twitterAuth.api.friendships.destroy(
						{ screen_name: d.data[c].screen_name, follow: true }, 
						{ token: CONFIG.twitter.token, secret: CONFIG.twitter.secret }, 
						function(error, data) {
							console.log('done1');	
						//out.push('unfollowed ' +d.data[c].screen_name +' </br>' );
					});
				}else {
					//console.log('Keep: '+d.data[c].screen_name);
				} 
			}
		});
		res.send('done');
//		res.send(arguments);
	});

});

app.get('/follow', function(req, res){
  twitterAuth.search('problem', CONFIG.twitter.token, CONFIG.twitter.secret, function(error, data) {
  	var tweets = data.tweets;
  	var c = tweets.length;
  	var  out = [];
  	while(c--) {

  		redis.hset('user:'+tweets[c].user.id, 'followed', +new Date());
		// twitterAuth.follow(tweets[c].user.id, CONFIG.twitter.token, CONFIG.twitter.secret, function(err, data) {
		// 	out.push(data);
	 //  	});
  	}
    res.send(out.join(' '));
  });
});

app.get('*', function(req, res) {
	res.send('me no find');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
 });