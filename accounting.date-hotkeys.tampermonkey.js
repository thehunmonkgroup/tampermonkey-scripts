// ==UserScript==
// @name         Date Input Keyboard Shortcuts
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adjust date inputs using keyboard shortcuts
// @match        https://accounting.xylil.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Flag to determine if 'Journal Entry' mode is active
    let isJournalEntryMode = false;

    // Function to check for 'Journal Entry' mode
    function checkJournalEntryMode() {
        const tdElements = document.querySelectorAll('td.titletext');
        for (const td of tdElements) {
            if (td.textContent.trim() === 'Journal Entry') {
                isJournalEntryMode = true;
                break;
            }
        }
    }

    // Function to parse date in MM/DD/YYYY format
    function parseDate(dateStr) {
        const [month, day, year] = dateStr.split('/').map(Number);
        if (!month || !day || !year) return new Date();
        return new Date(year, month - 1, day);
    }

    // Function to format Date object to MM/DD/YYYY
    function formatDate(date) {
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    }

    // Function to add or subtract months, adjusting for month length
    function addMonths(date, months) {
        const originalDay = date.getDate();
        const newDate = new Date(date);
        newDate.setDate(1); // Prevent overflow
        newDate.setMonth(newDate.getMonth() + months);

        // Determine the maximum days in the new month
        const maxDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
        newDate.setDate(Math.min(originalDay, maxDay));

        return newDate;
    }

    // Function to update date inputs
    function updateDateInputs(newDateStr, currentInput) {
        if (isJournalEntryMode) {
            const dateInputs = document.querySelectorAll('input.date');
            dateInputs.forEach(input => {
                input.value = newDateStr;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
        } else {
            currentInput.value = newDateStr;
            currentInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    // Function to handle keydown events
    function handleKeyDown(event) {
        if (!(event.altKey && event.shiftKey)) return;

        const input = event.target;
        if (!input.classList.contains('date')) return;

        const date = parseDate(input.value);
        if (!date) return;

        let newDate;
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                newDate = new Date(date);
                newDate.setDate(newDate.getDate() - 1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                newDate = new Date(date);
                newDate.setDate(newDate.getDate() + 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                newDate = addMonths(date, -1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                newDate = addMonths(date, 1);
                break;
            default:
                return;
        }

        const newDateStr = formatDate(newDate);
        updateDateInputs(newDateStr, input);
    }

    // Initialize the script
    function init() {
        checkJournalEntryMode();

        // Attach event listeners to all date inputs
        const dateInputs = document.querySelectorAll('input.date');
        dateInputs.forEach(input => {
            input.addEventListener('keydown', handleKeyDown);
        });
    }

    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();