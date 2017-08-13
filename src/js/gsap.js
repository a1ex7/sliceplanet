var tl = new TimelineMax();
// var Splitter = require('split-html-to-chars');

tl
  .fromTo('.logo', 1, {x:-200,opacity:0}, {x:0,opacity:1})
  .fromTo('.contacts', 1, {x:200,opacity:0}, {x:0,opacity:1}, '-=1')
  .staggerFromTo('.menu__item', 0.2, {opacity:0, x:10}, {opacity:1, x:0}, 0.1, '-=0.5')
  .fromTo('.slide__title', 1, {opacity:0}, {opacity:1})