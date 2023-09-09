// ==UserScript==
// @name         Accounting Date Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Provides keyboard shortcuts and auto copy for https://accounting.xylil.com
// @author       Chad Phillips
// @match        https://accounting.xylil.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  const handler = function(e) {
    if (e.shiftKey && e.altKey) {
      let currentDate = new Date(this.value);
      switch (e.keyCode) {
        case 37: // left arrow
          this.value = adjustDate(currentDate, -1);
          break;
        case 38: // up arrow
          this.value = adjustMonth(currentDate, 1);
          break;
        case 39: // right arrow
          this.value = adjustDate(currentDate, 1);
          break;
        case 40: // down arrow
          this.value = adjustMonth(currentDate, -1);
          break;
      }

      // If the name of the input element is 'date_', copy the new date value to other date elements
      if (this.name === 'date_') {
        let newDateValue = this.value;
        let otherDateElements = ['doc_date', 'event_date'];

        for (let j = 0; j < otherDateElements.length; j++) {
          let otherDateElement = document.getElementsByName(otherDateElements[j])[0];
          if (otherDateElement) {
            otherDateElement.value = newDateValue;
          }
        }
      }
    }
  }
  function attachHandlers() {
    const dateElement = document.getElementsByName('date_')[0];
    if (dateElement) {
      dateElement.removeEventListener('keydown', handler);
      dateElement.addEventListener('keydown', handler);
    }
    document.addEventListener('focusin', function(e) {
      if (e.target.classList.contains('date')) {
        // Remove the event listener before adding it to ensure it's only added once
        e.target.removeEventListener('keydown', handler);
        e.target.addEventListener('keydown', handler);
      }
    });
  }

  function adjustDate(date, days) {
    date.setDate(date.getDate() + days);
    return formatDate(date);
  }

  function adjustMonth(date, months) {
    let day = date.getDate();
    date.setMonth(date.getMonth() + months);

    // If the day of the month has changed, set the date to the last day of the previous month
    if (date.getDate() != day) {
      date.setDate(0);
    }

    return formatDate(date);
  }

  function formatDate(date) {
    let day = ('0' + date.getDate()).slice(-2);
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();

    return month + '/' + day + '/' + year;
  }
  setTimeout(function() {
    attachHandlers();
  }, 100); // Delay in milliseconds
})();
