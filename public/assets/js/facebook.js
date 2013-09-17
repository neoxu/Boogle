const APP_ID = "appid";
const host_url = 'http://127.0.0.1:50845/';
const redirect_login = host_url+'fblogin';
const redirect_logout = host_url+'fblogout';

window.fbAsyncInit = function() {
	//Initiallize the facebook using the facebook javascript sdk
	FB.init({
		appId : APP_ID, // App ID
		cookie : true, // enable cookies to allow the server to access the session
		status : true, // check login status
		xfbml : true,
		oauth : true
	});	
};

(function() 
{
    var e = document.createElement('script');
    e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
    e.async = true;
    document.getElementById('fb-root').appendChild(e);
}());
   
//Onclick for fb login
$('#fblogin').click(function(e) {
	/*var loginUrl="http://www.facebook.com/dialog/oauth/?"+
                 "scope=publish_stream&"+
                 "client_id="+APP_ID+"&"+
                 "redirect_uri="+redirect_login+"&"+
                 "response_type=token";
    parent.location=loginUrl;
    */

	FB.login(function(response) {
		if (response.authResponse) {
			var uid = response.authResponse.userID;
			FB.api('/me', function(response) {		
				try {		
				parent.location = redirect_login + '?uid=' + uid
												 + '&name=' + response.name
												 + '&email=' + response.email 
												 + '&birthday=' + response.birthday
												 + '&location=' + response.location.name;
				} catch (e){
					alert(e);
				}					    			
    		});
		} else {
			alert('請安心授權給籃球幫，我們保證不會在非經您的同意下回傳訊息至Facebook');
		}
	}, {
		scope : 'user_birthday,email,read_stream,user_location,user_work_history,user_photos,user_activities,user_likes'
	});
});

$('#fblogout').click(function(e) {
	FB.logout();
    parent.location = redirect_logout;
});
