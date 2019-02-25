var pauseUsed,
  settings,
  mode,
  time,
  grace,
  running,
  secondCheck,
  keyupCheck,
  keyupTimer = 0,
  sound,
  deleteWords,
  sounds = {
    baby: new Audio("http://soundbible.com/grab.php?id=557&type=mp3"),
    speaker: new Audio("http://soundbible.com/grab.php?id=2085&type=mp3"),
    buzzer: new Audio("http://soundbible.com/grab.php?id=1811&type=mp3"),
    mosquito: new Audio("http://soundbible.com/grab.php?id=1591&type=mp3"),
    alarm: new Audio("http://soundbible.com/grab.php?id=1787&type=mp3"),
    bagpipes: new Audio("http://soundbible.com/grab.php?id=527&type=mp3")
  };

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("settings").addEventListener("submit", function(e) {
    e.preventDefault();

    pauseUsed = false;
    settings = $("#settings").serializeArray();
    mode = settings[0].value;
    time = settings[1].value * 60; //in seconds
    grace = parseInt(settings[2].value);
    $("#time-remaining").append(convertMinutes(time));

    //display writing screen
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("writing-screen").classList.remove("hidden");
    document.getElementById("livetext").classList.add("warning-none");
    document.getElementById("credit-container").classList.add("hidden");

    //set running status
    running = true;

    //perform a check every second
    secondCheck = setInterval(tick, 1000);
    //start time since typed timer
    keyupCheck = setInterval(timeSinceKeyup, 1000);

    //countdown function, decrement the timer
    function tick() {
      if (running) {
        //decrement the timer
        time -= 1;
        //is the time up?
        if (time < 0) {
          //set time out
          document.getElementById("time-remaining").innerHTML = "00:00";
          //hide/show things
          document.getElementById("timeup-screen").classList.remove("hidden");
          document.getElementById("overlay").classList.remove("hidden");
          document.getElementById("restart").classList.remove("hidden");
          document.getElementById("pause").classList.add("hidden");
          document.getElementById("livetext").removeAttribute("class");
          document.getElementById("livetext").classList.add("warning-none");
          //running status off
          running = false;
          clearInterval(secondCheck);
          clearInterval(keyupCheck);
        } else {
          //display new time
          document.getElementById("time-remaining").innerHTML = convertMinutes(
            time
          );
        }
      }
    }
  });

  //live word counter
  document.getElementById("livetext").addEventListener("keyup", function() {
    var wc = getWordCount(document.getElementById("livetext").value);
    document.getElementById("wordcount").innerHTML = wc;
    //reset keyup timer
    if (running) {
      keyupTimer = 0;
      clearInterval(keyupCheck);
      keyupCheck = setInterval(timeSinceKeyup, 1000);
      document.getElementById("livetext").removeAttribute("class");
      document.getElementById("livetext").classList.add("warning-none");
    }
    //reset sound loop if applicable
    if (sound) {
      sound.loop = false;
      sound.pause();
      sound.currentTime = 0;
    }
    //reset kamikaze mode if applicable
    if (deleteWords);
    {
      clearInterval(deleteWords);
    }
  });

  function timeSinceKeyup() {
    //increase the timer
    keyupTimer++;
    //75% or 50% of the way to grace?
    if (keyupTimer / grace > 0.75 && keyupTimer / grace < 1) {
      document.getElementById("livetext").removeAttribute("class");
      document.getElementById("livetext").classList.add("warning-second");
    } else if (keyupTimer / grace > 0.5 && keyupTimer / grace < 1) {
      document.getElementById("livetext").removeAttribute("class");
      document.getElementById("livetext").classList.add("warning-first");
    }
    //has the grace period been reached? CONSEQUENCES!
    if (keyupTimer === grace) {
      document.getElementById("livetext").removeAttribute("class");
      document.getElementById("livetext").classList.add("warning-final");
      if (mode === "gentle") {
        //display alert
        alert("Get back to writing!");
        //reset here, so the user doesn't keep getting it
        //(this is gentle mode, we can be kind)
        keyupTimer = 0;
        clearInterval(keyupCheck);
        keyupCheck = setInterval(timeSinceKeyup, 1000);
        document.getElementById("livetext").removeAttribute("class");
        document.getElementById("livetext").classList.add("warning-none");
      } else if (mode === "intermediate") {
        //select sound to play (should be random)
        var keys = Object.keys(sounds);
        sound = sounds[keys[Math.floor(Math.random() * keys.length)]];
        sound.loop = true;
        sound.play();
      } else {
        //kamikaze - start deleting things!
        deleteWords = setInterval(kamikaze, 750);
      }
    }
  }

  function kamikaze() {
    var words = document.getElementById("livetext").value.split(" ");
    words.pop();
    document.getElementById("livetext").value = words.join(" ");
  }

  //credits show/hide
  document
    .getElementById("credit-button")
    .addEventListener("click", function() {
      document.getElementById("credits").classList.remove("hidden");
      document.getElementById("overlay").classList.remove("hidden");
    });
  document
    .getElementById("close-credits")
    .addEventListener("click", function() {
      document.getElementById("credits").classList.add("hidden");
      document.getElementById("overlay").classList.add("hidden");
    });
  
  //dismiss timeup box
  document
    .getElementById("written")
    .addEventListener("click", function() {
      document.getElementById("timeup-screen").classList.add("hidden");
      document.getElementById("overlay").classList.add("hidden");
    });

  //pause
  document.getElementById("pause").addEventListener("click", function() {
    if (!pauseUsed) {
      alert(
        "You are now paused! Click OK to return to your writing. You will NOT be able to pause again for this session!"
      );
      pauseUsed = true;
      document.getElementById("pause").classList.add("inactive");
    }
  });
  
  //restart
  document.getElementById("restart").addEventListener("click", function() {
    if (confirm("This will wipe your work and return you to the start screen! If you haven't saved your words yet, do it now!")) {
      //reset everything
      document.getElementById("livetext").removeAttribute("class");
      document.getElementById("livetext").classList.add("warning-none");
      document.getElementById("time-remaining").innerHTML = "";
      document.getElementById("livetext").value = "";
      document.getElementById("restart").classList.add("hidden");
      document.getElementById("pause").removeAttribute("class");
      document.getElementById("start-screen").classList.remove("hidden");
      document.getElementById("writing-screen").classList.add("hidden");
    }
  });
  
});

//converts second count to a mm:ss string for display
function convertMinutes(timer) {
  var mins = String(Math.floor(timer / 60));
  var secs = String(timer - mins * 60);
  if (mins.length < 2) {
    mins = "0" + mins;
  }
  if (secs.length < 2) {
    secs = "0" + secs;
  }
  return mins + ":" + secs;
}

//get word count
function getWordCount(input) {
  //whitespace management (from writtenkitten.co)
  input = input.replace(/^\s*|\s*$/g, ""); //leading/trailing whitespace
  input = input.replace(/\s+/g, " "); //multiple consecutive spaces
  input = input.replace(/\n/g, " "); //new lines

  var words = input.split(" ");
  if (words[0] === "") {
    //set to 0 if all text deleted
    return 0;
  } else {
    //count words in array
    return words.length;
  }
}