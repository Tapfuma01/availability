window.nb = window.nb ||{};
/* ============================================
            Default Settings:
===============================================*/
nb.config = {};
nb.nb_DateSelection = {};
nb.nb_DateSelection.nb_CheckInField_DatePicker;
nb.nb_DateSelection.nb_CheckOutField_DatePicker;
nb.config.nb_baseUrl = "https://book.nightsbridge.com/" ;

/*====================Please Provide Config:====================
*=============================================================== */
nb.config.nb_bbid = "31710"; //Change this to your BBID

/*====================Label Configuration====================
============================================================*/
nb.config.initialised = false;
nb.config.customFormat = "d-M-Y";
nb.config.language = "en-GB";

nb.nb_DateWidget = function(nb){
  /*====================Initialize Variables====================
  * ============================================================*/
  let durationOfStay = 1;
  let checkInDate = new Date();
  let checkOutDate = new Date();
  let today = new Date();
  let yesterday = new Date();
  let tomorrow = new Date();
  yesterday.setDate(checkInDate.getDate() - 1);
  tomorrow.setDate(today.getDate() + 1);
  checkOutDate.setDate(checkInDate.getDate() + 1);

  /*====================General Document element functions====================
  * ==========================================================================*/
// Check Availability and Navigate to booking Form
  function nb_CheckAvailabilityOnBookingForm(){
    let nb_bookingUrl = (nb.config.nb_baseUrl + nb.config.nb_bbid + "?startdate=" + encodeURI(getBookingFormFormat(checkInDate)) + "&enddate=" + encodeURI(getBookingFormFormat(checkOutDate)));
    window.open(nb_bookingUrl, '_blank');
    return nb_bookingUrl;
  }
// Update the inner html of elements
  function updateElementText(element, text, parent = false){
    parent ? document.getElementById(element).parentElement.innerText = text : document.getElementById(element).innerText = text;
  }

  function updateElementValue(element, text){
    document.getElementById(element).value = text;
  }

// Return element value
  function getElementValue(element){
    return document.getElementById(element).value;
  }

// Returns a formatted date from a date object to an iso standard and then to customFormat / "d-M-Y"
  function getCustomDateFormat(date) {
    let dateArray = date.toLocaleString(nb.config.language).slice(0, 10).split("/"),
        dateString = date.toString(nb.config.language).slice(0, 10).split(" ");
    return dateString[2] + "-" + dateString[1] + "-" + dateArray[2];
  }

//Return a format accepted by the booking form
  function getBookingFormFormat(date){
    const options = { year: 'numeric', day:'2-digit', month: '2-digit'};
    const dateFormatted = date.toLocaleString(nb.config.language, options).replace(/\//g, '-');
    const dateString = dateFormatted.split("-");
    return dateString[2] + "-" + dateString[1] + "-" + dateString[0];
  }
  /*====================Duration Handler=========================
          Update and determine the number of nights booked
  ===============================================================*/

  function dateDiff(date1, date2, sign = false){
    let diff_ms = date1 <= date2 ? date2 - date1 : date1 - date2;

    let min = 60,
        hour = 24,
        sec = 60,
        milli = 1000;
    return Math.floor(((diff_ms / milli)/sec/min/hour));
  }

  function daysInMs(numberOfDays){
    let min = 60,
        hour = 24,
        sec = 60,
        milli = 1000;

    return numberOfDays * hour * min * sec * milli;
  }

  /*====================Event Hooks====================
  =====================================================*/
  document.addEventListener("readystatechange", ()=> {
    // todo: readystatechange called twice, WP enque script correctly.
    if(!nb.config.initialised){
      nb.config.initialised = true;
      initWidget(nb.config.initialised);
    }
  });

  let initWidget = function(initialised) {
    nb.nb_DateSelection.nb_CheckInField_DatePicker = document.getElementById("nb_CheckInDate").flatpickr({
      "dateFormat":nb.config.customFormat,
      "minDate": yesterday,
      "mode": "single",
      "disableMobile": "true",
      "altInput": "true",
      "altFormat": nb.config.customFormat,
      "onChange": function (selectedDates, dateStr){
        checkInDate = selectedDates[0];
        // if checkInDate is after checkOutDate
        if (checkInDate >= checkOutDate) {
          // update checkOutdate to the selected duration
          const newDate = new Date(checkInDate.getTime() + daysInMs(durationOfStay));
          checkOutDate = newDate;
          nb.nb_DateSelection.nb_CheckOutField_DatePicker.setDate(getCustomDateFormat(checkOutDate), true, nb.config.customFormat);
          document.querySelector("#nb_CheckOutDate+input").value = getCustomDateFormat(checkOutDate);
        } else {
          // otherwise just update duration
          durationOfStay = dateDiff(checkInDate, checkOutDate);
        }
      }
    });

    nb.nb_DateSelection.nb_CheckOutField_DatePicker = document.getElementById("nb_CheckOutDate").flatpickr({
      "dateFormat":nb.config.customFormat,
      "minDate": checkInDate,
      "mode": "single",
      "disableMobile": "true",
      "altInput": "true",
      "altFormat": nb.config.customFormat,
      "onChange": function (selectedDates, dateStr){
        checkOutDate = selectedDates[0];
        // if checkOutDate is before checkInDate
        if (checkOutDate <= checkInDate) {
          // update checkInDate to the selected duration
          const newDate = new Date(checkOutDate.getTime() - daysInMs(durationOfStay));
          checkInDate = newDate;
          nb.nb_DateSelection.nb_CheckInField_DatePicker.setDate(getCustomDateFormat(checkInDate), true, nb.config.customFormat);
          document.querySelector("#nb_CheckOutDate+input").value = getCustomDateFormat(checkInDate);
        } else {
          // otherwise just update duration
          durationOfStay = dateDiff(checkInDate, checkOutDate);
        }
      }
    });
    //Initialise check in picker element
    nb.nb_DateSelection.nb_CheckInField_DatePicker.setDate(getCustomDateFormat(checkInDate), true, nb.config.customFormat);
    document.querySelector("#nb_CheckInDate+input").value = getCustomDateFormat(today);
    nb.nb_DateSelection.nb_CheckOutField_DatePicker.setDate(getCustomDateFormat(checkOutDate), true, nb.config.customFormat);
    document.querySelector("#nb_CheckOutDate+input").value = getCustomDateFormat(tomorrow);

    //Initialise availability and book now functions
    document.getElementById("nb_checkAvailabilityBtn").addEventListener("click", nb_CheckAvailabilityOnBookingForm);
  }

}(window.nb);
