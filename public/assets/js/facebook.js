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
   
//Onclick for fb login
$('#fblogin').click(function(e) {
	/*var loginUrl="http://www.facebook.com/dialog/oauth/?"+
                 "scope=publish_stream&"+
                 "client_id="+APP_ID+"&"+
                 "redirect_uri="+redirect_uri+"&"+
                 "response_type=token";
    window.location=loginUrl;
    */
	
	FB.login(function(response) {
		if (response.authResponse) {
			var uid = response.authResponse.userID;
			FB.api('/me', function(response) {
				parent.location = redirect_login+'?uid='+uid+'&name='+response.name;      			
    		});
		} else {
			alert('請安心授權給籃球幫，我們保證不會在非經你的同意下回傳訊息至Facebook');
		}
	}, {
		scope : 'user_birthday,email,read_stream,user_location,user_work_history,user_photos,user_activities,user_likes'
	});
});

$('#fblogout').click(function(e) {
	FB.logout();
    parent.location = redirect_logout;
});
