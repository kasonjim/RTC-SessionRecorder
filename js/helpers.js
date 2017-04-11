//////////////////////////////////////////////////////////////
/////////////////////  HELPER FUNCTIONS  /////////////////////
//////////////////////////////////////////////////////////////
var socketPort = 1337;

var getRoomId = function() {
  return document.getElementById('room-id').value;
};

// Display/hide URL link for current room (for admins)
var showRoomURL = function(roomid) {
  var roomQueryStringURL = '?roomid=' + roomid;
  var fullURL = window.location.href + roomQueryStringURL;

  var html = '<br /><strong>Room URL:</strong>';
  html += '<a href="' + roomQueryStringURL + '" target="_blank">' + fullURL + '</a>';

  document.getElementById('room-urls').innerHTML = html;
  document.getElementById('room-urls').style.display = 'block';
};

var hideRoomURL = function() {
  document.getElementById('roomStatusText').innerHTML = 'Entire session has been closed.';
  document.getElementById('userRoleText').innerHTML = '';
  document.getElementById('room-urls').innerHTML = '';
  document.getElementById('room-urls').style.display = 'none';
};

// helper functions to disable/enable all buttons
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
var updateCloseLeaveButton = function(state){
  document.getElementById('close-room').disabled = state;

  if (connection.isInitiator) {
    document.getElementById('close-room').innerText = 'Close Room';
  } else {
    document.getElementById('close-room').innerText = 'Leave Room';
  }
};

// Change text on screen
var setRoomStatusText = function(str) {
  document.querySelector('#roomStatusText').innerHTML = str;
};

var setUserRoleText = function(str) {
  document.querySelector('#userRoleText').innerHTML = str;
};