/////////////////////////////////////////////////////////
//////////////////////   UI Code   //////////////////////
/////////////////////////////////////////////////////////
document.getElementById('open-room').onclick = function() {
  disableInputButtons();

  connection.open(document.getElementById('room-id').value, function() {
    showRoomURL(connection.sessionid);
    updateCloseLeaveButton();

    document.querySelector('#roomStatusText').innerHTML = '<h2>Waiting for participant(s) to join</h2>';
    document.getElementById('close-room').disabled = false;

    var truth;
    connection.isInitiator ? truth = 'YES' : truth = 'NO';
    document.querySelector('#userRoleText').innerHTML = 'IS YOU THE ADMIN? ' + truth;
  });
};

document.getElementById('join-room').onclick = function() {
  disableInputButtons();
  updateCloseLeaveButton();

  var roomId = document.getElementById('room-id').value;

  connection.checkPresence(roomId, function(isRoomExist, roomid) {
    if (isRoomExist) {
      connection.join(roomid, function() {
        var truth;
        connection.isInitiator ? truth = 'YES' : truth = 'NO';
        document.querySelector('#userRoleText').innerHTML = 'IS YOU THE ADMIN? ' + truth;
      });
    } else {
      enableInputButtons();
      document.querySelector('#roomStatusText').innerHTML = 'Room does not exist!';
    }
  });
};

document.getElementById('close-room').onclick = function() {
  this.disabled = true;
  if (connection.isInitiator) {
    // use this method if you did NOT set "autoCloseEntireSession===true"
    // for more info: https://github.com/muaz-khan/RTCMultiConnection#closeentiresession
    connection.closeEntireSession(function() {
      hideRoomURL();
    });
  } else {
    connection.leave();
    connection.close();
  }
};

/////////////////////////////////////////////////////////////////////////
//////////////////////   RTCMultiConnection Code   //////////////////////
/////////////////////////////////////////////////////////////////////////
var connection = new RTCMultiConnection();
// by default, socket.io server is assumed to be deployed on your own URL
// connection.socketURL = '/';
// comment-out below line if you do not have your own socket.io server
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.socketURL = 'http://localhost:443/';
// connection.socketURL = 'http://idc-socket-server.herokuapp.com:443/';
/*
    Cannot GET /socket.io/
      ?userid=64436r5sw4rts44wvg6a2
      &sessionid=64436r5sw4rts44wvg6a2
      &msgEvent=interviewer.dc-room
      &socketCustomEvent=RTCMultiConnection-Custom-Message
      &autoCloseEntireSession=false
      &maxParticipantsAllowed=2
      &EIO=3
      &transport=polling&t=LjPDyGs
*/

// Initial connection setup
connection.socketMessageEvent = 'interviewer.dc-room';
connection.maxParticipantsAllowed = 2;
connection.enableFileSharing = false; // by default, it is "false".
connection.session = {
  audio: true,
  video: true,
  data: true
};
connection.sdpConstraints.mandatory = {
  OfferToReceiveAudio: true,
  OfferToReceiveVideo: true
};

// handling video sources
connection.videosContainer = document.getElementById('videos-container');
connection.onstream = function(event) {
  var width = parseInt(connection.videosContainer.clientWidth / 3) - 20;
  var mediaElement = getMediaElement(event.mediaElement, {
    title: event.userid,
    buttons: ['full-screen'],
    width: width,
    showOnMouseEnter: false
  });
  connection.videosContainer.appendChild(mediaElement);
  setTimeout(function() {
    mediaElement.media.play();
  }, 5000);
  mediaElement.id = event.streamid;
};
connection.onstreamended = function(event) {
  var mediaElement = document.getElementById(event.streamid);
  if (mediaElement) {
    mediaElement.parentNode.removeChild(mediaElement);
  }
};

// Handling session / rooms
connection.onopen = function() {
  updateCloseLeaveButton();
  document.getElementById('close-room').disabled = false;
  document.querySelector('#roomStatusText').innerHTML = 'You are connected with: ' + connection.getAllParticipants().join(', ');

};
connection.onclose = function() {
  if (connection.getAllParticipants().length) {
    document.querySelector('#roomStatusText').innerHTML = 'You are still connected with: ' + connection.getAllParticipants().join(', ');
  } else {
    document.querySelector('#roomStatusText').innerHTML = 'Seems session has been closed or all participants left.';
  }
};
connection.onEntireSessionClosed = function(event) {
  document.getElementById('close-room').disabled = true;
  connection.isInitiator ? enableInputButtons() : disableInputButtons();

  connection.attachStreams.forEach(function(stream) {
    stream.stop();
  });
  // don't display alert for moderator
  if (connection.userid === event.userid) {
    return;
  }
  document.querySelector('#roomStatusText').innerHTML = 'Entire session has been closed by the moderator: ' + event.userid;
  document.querySelector('#userRoleText').innerHTML = '';
};

// If room already exist
connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
  // seems room is already opened
  connection.join(useridAlreadyTaken);
};

// helper function to disable/enable all buttons
var disableInputButtons = function() {
  document.getElementById('open-room').disabled = true;
  document.getElementById('join-room').disabled = true;
  document.getElementById('room-id').disabled = true;
};

var enableInputButtons = function() {
  document.getElementById('open-room').disabled = false;
  document.getElementById('join-room').disabled = false;
  document.getElementById('room-id').disabled = false;
};

// Helper function to change text of leave/close room based on role
var updateCloseLeaveButton = function(){
  if (connection.isInitiator) {
    document.getElementById('close-room').innerText = 'Close Room';
  } else {
    document.getElementById('close-room').innerText = 'Leave Room';
  }
};


//////////////////////////////////////////////////////////////
/////////////////////  HANDLING ROOM ID  /////////////////////
//////////////////////////////////////////////////////////////
var showRoomURL = function(roomid) {
  var roomQueryStringURL = '?roomid=' + roomid;
  var fullURL = window.location.href + roomQueryStringURL;

  var html = '<h2>Unique URL for your room:</h2>';
  html += '<a href="' + roomQueryStringURL + '" target="_blank">' + fullURL + '</a>';

  document.getElementById('room-urls').innerHTML = html;
  document.getElementById('room-urls').style.display = 'block';
};

var hideRoomURL = function() {
  document.querySelector('#roomStatusText').innerHTML = 'Entire session has been closed.';
  document.querySelector('#userRoleText').innerHTML = '';
  document.getElementById('room-urls').innerHTML = '';
  document.getElementById('room-urls').style.display = 'none';
};

var roomParams = function() {
  var params = {};
  var r = /([^&=]+)=?([^&]*)/g;
  var d = function(s) {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  };
  var match;
  var search = window.location.search;
  while (match = r.exec(search.substring(1))) {
    params[d(match[1])] = d(match[2]);
  }
  window.params = params;
};
roomParams();

var roomid = '';
if (localStorage.getItem(connection.socketMessageEvent)) {
  roomid = localStorage.getItem(connection.socketMessageEvent);
} else {
  roomid = connection.token();
}

document.getElementById('room-id').value = roomid;
document.getElementById('room-id').onkeyup = function() {
  localStorage.setItem(connection.socketMessageEvent, this.value);
};

var hashString = location.hash.replace('#', '');
if (hashString.length && hashString.indexOf('comment-') === 0) {
  hashString = '';
}

var roomid = params.roomid;
if (!roomid && hashString.length) {
  roomid = hashString;
}

if (roomid && roomid.length) {
  document.getElementById('room-id').value = roomid;
  localStorage.setItem(connection.socketMessageEvent, roomid);
// auto-join-room
  (function reCheckRoomPresence() {
    connection.checkPresence(roomid, function(isRoomExists) {
      if (isRoomExists) {
        connection.join(roomid);
        return;
      }
      setTimeout(reCheckRoomPresence, 5000);
    });
  })();
  disableInputButtons();
}