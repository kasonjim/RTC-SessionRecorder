///////////////////////////////////////////////////////////////
//////////////////////   RECORDER Code   //////////////////////
///////////////////////////////////////////////////////////////

// Initial setup
window.onbeforeunload = function() {
  document.getElementById('start').disabled = false;
  document.getElementById('stop').disabled = true;
  document.getElementById('save').disabled = true;
};

// Get main recording element
var elementToShare = document.getElementById('elementToShare');
// Create canvas
var canvas2d = document.createElement('canvas');
var context = canvas2d.getContext('2d');
canvas2d.width = elementToShare.clientWidth;
canvas2d.height = elementToShare.clientHeight;
canvas2d.style.top = 0;
canvas2d.style.left = 0;
canvas2d.style.zIndex = -1;
(document.body || document.documentElement).appendChild(canvas2d);

// State variables
var isRecordingStarted = false;
var isStoppedRecording = false;

// Defining the videoRecorder instance and data storage variable
var currentVideoBlob;
var canvasRecorder = new CanvasRecorder(canvas2d, {
  disableLogs: true
});

// Constantly checks state of recording/not-recording
var looper = function() {
  if (!isRecordingStarted) {
    return setTimeout(looper, 500);
  }
  html2canvas(elementToShare, {
    grabMouse: true,
    onrendered: function(canvas) {
      context.clearRect(0, 0, canvas2d.width, canvas2d.height);
      context.drawImage(canvas, 0, 0, canvas2d.width, canvas2d.height);

      if (isStoppedRecording) {
        return;
      }

      setTimeout(looper, 1);
    }
  });
};
looper();

// Button action for "START"
document.getElementById('start').onclick = function() {
  this.disabled = true;
  document.getElementById('save').disabled = true;

  // Set states
  isStoppedRecording = false;
  isRecordingStarted = true;
  // Reset data
  canvasRecorder.clearRecordedData();

  // Start recording
  canvasRecorder.record();

  setTimeout(function() {
    document.getElementById('stop').disabled = false;
  }, 1000);
};

// Button action "STOP"
document.getElementById('stop').onclick = function() {
  this.disabled = true;
  document.getElementById('start').disabled = false;

  isStoppedRecording = true;
  isRecordingStarted = false;

  canvasRecorder.stop(function(blob) {
    currentVideoBlob = blob;
    document.getElementById('save').disabled = false;
    looper();
  });
};

// Button action for "SAVE"
document.getElementById('save').onclick = function() {
  console.log('VIDEO BLOB', currentVideoBlob);
  convertStreams();
};

var convertStreams = function() {
  var date = new Date();
  var formatted = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} (${date.getTime()})`;
  invokeSaveAsDialog(currentVideoBlob, 'DC ' + formatted + '.webm');
};