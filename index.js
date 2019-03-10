var TIMEOUT_IN_SECS = 3 * 60
var TIMEOUT_ALERT = 30
var TEMPLATE = '<h1><span class="js-timer-minutes">00</span>:<span class="js-timer-seconds">00</span></h1>'
var STYLE = 'top: 4px; left: 4px; position: fixed;z-index: 1000;color: #4d80aa; \
             border: 2px solid #77a8d0; border-radius: 3px; background-color: #fff'

var WARNING_MESSAGES = [
  'Time you enjoy wasting is not wasted time.',
  'Time flies like an arrow; fruit flies like a banana.',
  'How did it get so late so soon?',
  'Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin.'
]

function padZero(number){
  return ("00" + String(number)).slice(-2);
}

class Timer{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  constructor(timeout_in_secs, timeout_callback){
    this.initial_timeout_in_secs = timeout_in_secs
    this.timeout_callback = timeout_callback
    this.reset()
  }
  getTimestampInSecs(){
    var timestampInMilliseconds = new Date().getTime()
    return Math.round(timestampInMilliseconds / 1000)
  }
  start(){
    if (this.isRunning)
      return
    this.timestampOnStart = this.getTimestampInSecs()
    this.isRunning = true
  }
  stop(){
    if (!this.isRunning)
      return
    this.timeout_in_secs = this.calculateSecsLeft()
    this.timestampOnStart = null
    this.isRunning = false
  }
  reset(timeout_in_secs){
    this.isGone = false
    this.isRunning = false
    this.timestampOnStart = null
    this.timeout_in_secs = this.initial_timeout_in_secs
    return this
  }
  calculateSecsLeft(){
    if (!this.isRunning)
      return this.timeout_in_secs
    if (this.isGone)
      return 0
    var currentTimestamp = this.getTimestampInSecs()
    var secsGone = currentTimestamp - this.timestampOnStart
    if (this.timeout_in_secs > secsGone)
      return this.timeout_in_secs - secsGone;

    setTimeout(this.timeout_callback, 0);
    this.isGone = true
    return 0;
  }
}

class TimerWidget{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  construct(){
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
  mount(rootTag){
    if (this.timerContainer)
      this.unmount()

    // adds HTML tag to current page
    this.timerContainer = document.createElement('div')

    this.timerContainer.setAttribute("style", STYLE)
    this.timerContainer.innerHTML = TEMPLATE

    rootTag.insertBefore(this.timerContainer, rootTag.firstChild)

    this.minutes_element = this.timerContainer.getElementsByClassName('js-timer-minutes')[0]
    this.seconds_element = this.timerContainer.getElementsByClassName('js-timer-seconds')[0]
  }
  update(secsLeft){
    var minutes = Math.floor(secsLeft / 60);
    var seconds = secsLeft - minutes * 60;

    this.minutes_element.innerHTML = padZero(minutes)
    this.seconds_element.innerHTML = padZero(seconds)
  }
  unmount(){
    if (!this.timerContainer)
      return
    this.timerContainer.remove()
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
}


function main(){

  var timer = new Timer(TIMEOUT_IN_SECS, onMainTimerTimeout)
  var timerAlert = new Timer(TIMEOUT_ALERT, onAlertTimerTimeout)
  var timerWidget = new TimerWidget()
  var intervalId = null
  var alertIntervalId = null

  timerWidget.mount(document.body)

  function showWarning(){
    var randomIndex = Math.floor(Math.random() * WARNING_MESSAGES.length)
    window.alert(WARNING_MESSAGES[randomIndex])
  }

  function onAlertTimerTimeout(){
    showWarning()
    timerAlert.reset().start()
  }

  function onMainTimerTimeout(){
    showWarning()
    timerAlert.start()
  }

  function handleIntervalTick(){
    var secsLeft = timer.calculateSecsLeft()
    timerAlert.calculateSecsLeft()
    timerWidget.update(secsLeft)
  }

  function handleVisibilityChange(){
    if (document.hidden) {
      timer.stop()
      clearInterval(intervalId)
      intervalId = null
    } else {
      timer.start()
      intervalId = intervalId || setInterval(handleIntervalTick, 300)
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  handleVisibilityChange()
}

if (document.readyState === "complete" || document.readyState === "loaded") {
  main();
} else {
  // initialize timer when page ready for presentation
  window.addEventListener('DOMContentLoaded', main);
}
