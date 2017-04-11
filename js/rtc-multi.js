/////////////////////////////////////////////////////////////////////////
//////////////////////   RTCMultiConnection Code   //////////////////////
/////////////////////////////////////////////////////////////////////////

var connection = new RTCMultiConnection();
// connection.socketURL = '/';
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.socketURL = 'http://localhost:443/';

// Initial connection setup
connection.socketMessageEvent = 'interviewer.dc-room';
connection.maxParticipantsAllowed = 3;
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
  var width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
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
  if (!connection.isInitiator) {
    document.getElementById('recordControls').style.display = 'none';
  }
  updateCloseLeaveButton();

  document.getElementById('close-room').disabled = false;
  setRoomStatusText('You are connected with: ' + connection.getAllParticipants().join(', '));
};

connection.onclose = function() {
  if (connection.getAllParticipants().length) {
    setRoomStatusText('You are still connected with: ' + connection.getAllParticipants().join(', '));
  } else {
    setRoomStatusText('Seems session has been closed or all participants left.');
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

  setRoomStatusText('Entire session has been closed by moderator: ' + event.userid);
  setUserRoleText('');
};

// If room already exist
connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
  // DEPRECATED / NOT USED ANYMORE
  // seems room is already opened
  connection.join(useridAlreadyTaken);
};