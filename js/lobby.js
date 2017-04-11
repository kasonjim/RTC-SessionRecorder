/////////////////////////////////////////////////////////////////
//////////////////////   BUTTON HANDLERS   //////////////////////
/////////////////////////////////////////////////////////////////
document.getElementById('open-room').onclick = function() {
  connection.open(getRoomId(), function() {
    disableInputButtons();
    updateCloseLeaveButton(false);
    showRoomURL(connection.sessionid);

    setUserRoleText('IS YOU THE ADMIN? ' + connection.isInitiator);
    setRoomStatusText('<h2>Waiting for participant(s) to join</h2>');
  });
};

document.getElementById('join-room').onclick = function() {
  connection.checkPresence(getRoomId(), function(isRoomExist, roomid) {
    disableInputButtons();
    updateCloseLeaveButton(true);

    if (isRoomExist) {
      connection.join(roomid, function() {
        setUserRoleText('IS YOU THE ADMIN? ' + connection.isInitiator);
      });
    } else {
      enableInputButtons();
      setRoomStatusText('Room does not exist!');
    }
  });
};

document.getElementById('close-room').onclick = function() {
  this.disabled = true;
  if (connection.isInitiator) {
    connection.closeEntireSession(function() {
      hideRoomURL();
    });
  } else {
    connection.leave();
    connection.close();
  }
};


//////////////////////////////////////////////////////////////
/////////////////////  HANDLING ROOM ID  /////////////////////
//////////////////////////////////////////////////////////////
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