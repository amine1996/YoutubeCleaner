// ==UserScript==
// @name        Youtube Cleaner
// @namespace   https://github.com/amine1996
// @description Remove videos from authors you don't want to see
// @include     https://www.youtube.com/
// @include     https://www.youtube.com/*
// @version     1
// @grant       none
// ==/UserScript==

var Actions = {
  REPLACE: 0,
  DELETE: 1
}

var ACTION = Actions.DELETE;
var GARBAGE_TITLE = 'Garbage';
var GARBAGE_REAL_NAME = 'Garbage';
var GARBAGE_THUMBNAIL = 'http://discardstudies.files.wordpress.com/2011/09/garbage_strike_queen_sherbourne_014.jpg';
var GARBAGE_AUTHORS = [
  GARBAGE_REAL_NAME, //Needed to refresh bugged elements
  'SQUEEZIE',
  'KENTIN',
  'NORMAN FAIT DES VIDÉOS',
  'Dr Nozman',
  'Guillaume Pley',
  'Nabil \'Aiekillu\' Lahrech',
  'Youtunes',
  'Amixem',
  'Agentgb',
  'Sulivan Gwed',
  'Bilal Hassani',
  'Pierre Croce',
  'Daniil le Russe',
  'Touche pas à mon poste !',
  'Cauet',
  'TheKAIRI78',
  'CYRIL /SUPERKONAR',
  'IbraPlus',
  'Doozy',
  "Jojo Bernard"
];

/*
 * Get all element with tags corresponding to a video thumbnail
 */
function getVideoElements()
{
  //Normal videos
  var normalVideoElements = Array.prototype.slice.call(document.querySelectorAll('ytd-grid-video-renderer'));
  
  //Recommandations
  var compactVideoElements = Array.prototype.slice.call(document.querySelectorAll('ytd-compact-video-renderer'));
  var videoElements = {
    'normal': normalVideoElements,
    'compact': compactVideoElements
  };
  return videoElements;
} 

/*
 * Create an array of video objects contains elements for the video author, video title and video image
 */
function getVideoObjects(videoElements)
{
  var videoObjects = []
  videoElements['normal'].forEach(function (videoElem) {
    var videoElement = videoElem;
    var videoAuthor = videoElem.querySelector('[id=byline-container]');
    var videoTitle = videoElem.getElementsByTagName('h3') [0];
    var videoImage = videoElem.getElementsByTagName('img') [0];
    videoObjects.push({
      'element': videoElement,
      'author': videoAuthor,
      'title': videoTitle,
      'image': videoImage
    })
  });
  videoElements['compact'].forEach(function (videoElem) {
    var videoElement = videoElem;
    var videoAuthor = videoElem.querySelector('[id=byline]');
    var videoTitle = videoElem.querySelector('[id=video-title]');
    var videoImage = videoElem.getElementsByTagName('img') [0];
    videoObjects.push({
      'element': videoElement,
      'author': videoAuthor,
      'title': videoTitle,
      'image': videoImage
    })
  });
  
  console.log(videoObjects);
  return videoObjects;
} 

/*
 * For each video object that is garbage (existing in global_garbage array), change title, image and author or delete
 * caller : Event or function firing the function
 */
function setGarbage(caller)
{
  console.log('Caller : '+caller+', Setting garbage...');
  var videoElements = getVideoElements();
  var videoObjects = getVideoObjects(videoElements);
  var garbageVideos = videoObjects.filter(function (garbageVideo) {
    return GARBAGE_AUTHORS.indexOf(garbageVideo['author'].textContent.trim().toLowerCase()) !== - 1;
  });
  garbageVideos.forEach(function (garbageVideo) {
    if (ACTION == Actions.REPLACE)
    {
      garbageVideo['author'].textContent = GARBAGE_REAL_NAME;
      garbageVideo['image'].setAttribute('src', GARBAGE_THUMBNAIL);
      garbageVideo['title'].textContent = GARBAGE_TITLE;
    } 
    else if (ACTION == Actions.DELETE)
    {
      garbageVideo['element'].remove();
    }
  });
}

/*
 * Main function
 */
function main()
{
  //Set author list to lower case
  GARBAGE_AUTHORS = GARBAGE_AUTHORS.map(function (author) {
    return author.toLowerCase();
  });
  
  //While loading change to garbage every 100ms
  var whileLoading = setInterval(function () {
    setGarbage("whileLoading");
  }, 100);
  
  //After loading is finished
  window.addEventListener('load', function () {
    //Stop setting garbage every 100ms
    clearInterval(whileLoading);
    
    //Add animation end event handling
    document.getElementsByTagName('ytd-app')[0].addEventListener('animationend', function () {
      setGarbage("animationEnd event");
    });
   
    //Wrapping afterNextRender function to set garbage
    var nativeAfterNextRender = Polymer.RenderStatus.afterNextRender;
    Polymer.RenderStatus.afterNextRender = function(){
      nativeAfterNextRender.apply(this,arguments);
      setGarbage("afterNextRender");
    }

    //Wrapping _atEndOfMicrotask function to set garbage with a 500ms timer to avoid spam
    var lastSetGarbage = new Date().getTime();
    var nativeAtEndOfMicrotask = Polymer.Async._atEndOfMicrotask;
    Polymer.Async._atEndOfMicrotask = function(){
      nativeAtEndOfMicrotask.apply(this,arguments);
      
      if(new Date().getTime() - lastSetGarbage > 500)
      {
        lastSetGarbage = new Date().getTime();
        setGarbage("_atEndOfMicrotask");
      }
    }
      
  });
}

main();
