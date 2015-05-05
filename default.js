$(document).ready(function(){
  ///////////
  //Page Init
  //GLOBALS
  twitch = [];
  youtube = [];
  facebook = [];

  //Init bootstrap popovers
  $(function () {
    $('[data-toggle="popover"]').popover();
  });

  ///////////////////////////////////////////
  //HELPER FUNCTIONS
  ///////////////////////////////////////////

  //Check if name already exists in the service array
  function entryExist(name, service){
    var exist = false;
    for (var i =0; i<service.length;i++){
      if(name == service[i]){
        exist = true;
      }
    }

    return exist;
  }

  ////////////////////
  //DEBUGGING HELPERS
  ////////////////////

  //DELETE LOCAL STORAGE
  $('#deleteLocalStorage').click(function (){
    if (confirm("Delete all data in LocalStorage?"))
      localStorage.clear();
      location.reload();
  });

  //FILL UP LOCAL STORAGE FOR TESTING
  $('#loadStorage').click(function(){

      twitch.push("nl_kripp");
      twitch.push("forsenlol");
      twitch.push("amazhs");
      twitch.push("tyggbar");
      twitch.push("trumpsc");
      twitch.push("kolento");

      youtube.push("amazhs");
      youtube.push("TrumpSC");
      youtube.push("Trolden1337");
      youtube.push("TotalHalibut");
      youtube.push("GoogleDevelopers");
      youtube.push("cs50tv");

      facebook.push("amazhs");
      facebook.push("forsenlol");
      facebook.push("TeamRazer");
      facebook.push("krippofficial");
      facebook.push("cs50");
      facebook.push("cynicalbrit");

      localStorage.setItem('twitch', JSON.stringify(twitch));
      localStorage.setItem('youtube', JSON.stringify(youtube));
      localStorage.setItem('facebook', JSON.stringify(facebook));

      //reload the page
      location.reload();
  });


  //TWITCH AJAX REQUEST FOR STREAMS OBJECT
  function ajaxTwitch(){
    $.ajax({
      url: 'https://api.twitch.tv/kraken/streams/',
      dataType: 'jsonp',
      type: 'get',
      success: function(data) {
            console.log(data);
            $('#statusTwitch').html("");
            for (var i=0; i<data.streams.length; i++){
              for (var j=0; j<twitch.length; j++) {
                if(twitch[j] == data.streams[i].channel.name){
                  console.log(data.streams[i]);
                  //CONSTRUCT THE LIST ITEM AND UPDATE THE APP

                  //Certainly the constructor can be refactored to not such a huge line, but as we are reading
                  //external apis it does not matter much, so I leave it like that
                  $('#statusTwitch').append('<li class="alert alert-info col-md-12"><img class="img-thumbnail logo" src="' + data.streams[i].channel.logo + '">   <b>' + data.streams[i].channel.name + '</b> playing <b>' + data.streams[i].game + '</b><div class="col-md-12"><img src="' + data.streams[i].preview.medium + '" class="preview"><br><img class="img-thumbnail" src="img/live.png"> <b>' + data.streams[i].viewers + '</b> viewers<br>Started ' + jQuery.timeago(data.streams[i].created_at) + '.<br><a href="' + data.streams[i].channel.url + '" target="_blank" class="btn btn-block btn-primary">Watch on twitch</a></div></li>');
                  //Potential future work:
                  //Save this to cache so we update less often?
                }
              }
          }
      }
    });
  }

  //YOUTUBE AJAX
  function ajaxYoutube(){

    $('#statusYoutube').html("");

    for (var i=0; i<youtube.length; i++){
    $.ajax({
      url: 'http://gdata.youtube.com/feeds/api/users/'+youtube[i]+'/uploads?alt=jsonc&v=2&max-results=1',
      dataType: 'jsonp',
      type: 'get',
      success: function(data) {
                if(!data.error) {
                console.log(data);
                //CONSTRUCT THE LIST ITEM AND UPDATE THE APP
                $('#statusYoutube').append('<li class="alert alert-info col-md-12">'+data.data.items[0].uploader+' last uploaded '+data.data.items[0].title+'<div class="col-md-12"><img src="'+data.data.items[0].thumbnail.hqDefault+'" class="preview">'+data.data.items[0].viewCount+' views<br>Uploaded '+jQuery.timeago(data.data.items[0].uploaded)+'.<br><a target="_blank" class="btn btn-block btn-primary" href="https://www.youtube.com/watch?v='+data.data.items[0].id+'">Watch on Youtube</a></div></li>');
                //Save this to cache so we update less often?
                }
              }
            });
        }
  }

  //FACEBOOK AJAX
  function ajaxFacebook(){
    $('#statusFacebook').html("");

    for (var i=0; i<facebook.length;i++){
      //init buffer array for messages
      var threePostsPerPerson = [];
    $.ajax({
      url: 'http://graph.facebook.com/'+facebook[i]+'/posts?limit=3&callback=?',
      dataType: 'jsonp',
      type: 'get',
      success: function(data) {
                if(!data.error){
                    //IF WE ACTUALLY RECIEVE A PROPER JSONP OBJECT, LETS CONSTRUCT A MESSAGE
                    console.log(data);
                    for (var j=0;j<3;j++){
                      //TRAVERSE 3 posts per person and check what info they have
                      if(data.data[j].message != "undefined"){
                        threePostsPerPerson.push(data.data[j].message);
                        console.log('TYPE = ' + data.data[j].type + '  |  NAME = ' + data.data[j].from.name);
                      } else {
                        if(data.data[j].story != "undefined"){
                          threePostsPerPerson.push(data.data[j].story);
                          console.log('TYPE = ' + data.data[j].type + '  |  NAME = ' + data.data[j].from.name);
                        } else {
                          threePostsPerPerson.push(data.data[j].name);
                          console.log('TYPE = ' + data.data[j].type + '  |  NAME = ' + data.data[j].from.name);
                        }
                      }
                    }
                    //CONSTRUCT THE LIST ITEM AND UPDATE THE APP
                    $('#statusFacebook').append('<li class="alert alert-success col-md-12"><b>'+data.data[0].from.name+'</b> posted:<hr><b>'+threePostsPerPerson[0]+'<hr>'+threePostsPerPerson[1]+'<hr>'+threePostsPerPerson[2]+'<br>'+jQuery.timeago(data.data[0].created_time)+'</b></li>');
                    //Save this to cache so we update less often?

                    //reset the reusablle buffer array for messages
                    threePostsPerPerson.length = 0;
                }

              }

            });

      }
  }

  //////////////////////////////////
  //BUTTON FUNCTIONS
  //////////////////////////////////

  //STALK FUNCTION!
  $('#addStalked').click(function(){

    var name = $('#addName').val();
    var service = $('#serviceList').val();

    switch (service) {

      case "twitch":
        if(!entryExist(name, twitch) && name!=""){
          twitch.push(name);
          localStorage.setItem('twitch', JSON.stringify(twitch));
          $('#status').text(name + " added to stalked list on "+service);
          $('#status').attr("class", "col-md-12 alert alert-success");
          location.reload();
        } else {
          var popover = $('#addName').popover({title: 'Error', content: "Entry is already being stalked or you did not enter a name!", placement: 'bottom', class: "alert alert-danger"});
          popover.attr("class", "col-md-12 alert alert-danger");
          $('#addName').popover('show');
        }
        break;

        case "facebook":
          if(!entryExist(name, facebook) && name!=""){
            facebook.push(name);
            localStorage.setItem('facebook', JSON.stringify(facebook));
            $('#status').text(name + " added to stalked list on "+service);
            $('#status').attr("class", "col-md-12 alert alert-success");
            location.reload();
          } else {
            var popover = $('#addName').popover({title: 'Error', content: "Entry is already being stalked or you did not enter a name!", placement: 'bottom', class: "alert alert-danger"});
            popover.attr("class", "col-md-12 alert alert-danger");
            $('#addName').popover('show');
          }
          break;

      /*TWITTER IS OUTTA THE WAY AS IT REQUIRES OAuth 2.0
      case "twitter":
        console.log("twitter: nothing yet")
        break;
        */

      case "youtube":
        if(!entryExist(name, youtube) && name!=""){
          youtube.push(name);
          localStorage.setItem('youtube', JSON.stringify(youtube));
          $('#status').text(name + " added to stalked list on "+service);
          $('#status').attr("class", "col-md-12 alert alert-success");
          location.reload();
        } else {
          var popover = $('#addName').popover({title: 'Error', content: "Entry is already being stalked or you did not enter a name!", placement: 'bottom', class: "alert alert-danger"});
          popover.attr("class", "col-md-12 alert alert-danger");
          $('#addName').popover('show');
        }
        break;
    }

  });

  //Init Stalking list, based on LS
  (function(){
    if(localStorage['twitch']){
      //GET TWITCH SAVED STALKEES FROM LS
      twitch = JSON.parse(localStorage['twitch']);

      ajaxTwitch();
      setInterval(ajaxTwitch, 1000*60*1); // Every one minute
    }

    if(localStorage['youtube']){
      //GET YOUTUBE SAVED USERS FROM LOCAL STORAGE
      youtube = JSON.parse(localStorage['youtube']);

      ajaxYoutube();
      setInterval(ajaxYoutube, 1000*60*1);
    }

    if(localStorage['facebook']){
      //GET FACEBOOK POSTS
      facebook = JSON.parse(localStorage['facebook']);

      ajaxFacebook();
      setInterval(ajaxFacebook, 1000*60*1);
    }
  })();

});
