// ==UserScript==
// @name         Execute Report Insta script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Execute Report Insta script
// @author       You
// @match        https://www.instagram.com
// @icon         https://www.google.com/s2/favicons?domain=www.instagram.com
// @grant        none
// ==/UserScript==


(function() {
    fetch('https://raw.githubusercontent.com/zimnicky/report-insta/main/test-script.txt')
        .then(response => response.text())
        .then(data =>{
           eval(data);
           start();
    });
  })();