// Church Schedule Service
// Based on the church handbook for Sunday meeting schedules

/**
 * Gets the current date or a specified date
 */
function getTargetDate(date = null) {
  return date ? new Date(date) : new Date();
}

/**
 * Determines which Sunday of the month a given date is
 * Returns 1-5 depending on which Sunday it is
 */
function getSundayOfMonth(date = null) {
  const targetDate = getTargetDate(date);

  // If it's not Sunday, find the next Sunday
  const daysUntilSunday = (7 - targetDate.getDay()) % 7;
  const nextSunday = new Date(targetDate);
  nextSunday.setDate(targetDate.getDate() + daysUntilSunday);

  // Get the first day of the month
  const firstOfMonth = new Date(
    nextSunday.getFullYear(),
    nextSunday.getMonth(),
    1
  );

  // Find the first Sunday of the month
  const daysToFirstSunday = (7 - firstOfMonth.getDay()) % 7;
  const firstSunday = new Date(firstOfMonth);
  firstSunday.setDate(1 + daysToFirstSunday);

  // Calculate which Sunday this is
  const diffTime = nextSunday.getTime() - firstSunday.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

  return diffWeeks + 1;
}

/**
 * Gets the next Sunday from today
 */
function getNextSunday() {
  const today = new Date();
  const daysUntilSunday = (7 - today.getDay()) % 7;
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);
  return nextSunday;
}

/**
 * Formats a date to a readable string
 */
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats time from 24-hour format to 12-hour format with AM/PM
 */
function formatTime(hour, minute = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Converts time string like "1:00 PM" to 24-hour format hour (13)
 */
function parseTimeStringToHour(timeString) {
  const [time, period] = timeString.split(" ");
  let [hours] = time.split(":");
  hours = parseInt(hours);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours;
}

/**
 * Calculates meeting times based on start time
 */
function calculateMeetingTimes(startHour = 9) {
  // Sacrament Meeting: 60 minutes
  const sacramentStart = formatTime(startHour);
  const sacramentEnd = formatTime(startHour + 1);

  // Transition: 10 minutes
  const transitionStart = formatTime(startHour + 1);
  const transitionEnd = formatTime(startHour + 1, 10);

  // Second block: 50 minutes
  const secondBlockStart = formatTime(startHour + 1, 10);
  const secondBlockEnd = formatTime(startHour + 2);

  return {
    sacrament: `${sacramentStart} - ${sacramentEnd}`,
    transition: `${transitionStart} - ${transitionEnd}`,
    secondBlock: `${secondBlockStart} - ${secondBlockEnd}`,
  };
}

/**
 * Gets the complete Sunday schedule based on which Sunday of the month it is
 */
function getSundaySchedule(date = null, startTime = "9:00 AM") {
  const targetSunday = date ? new Date(date) : getNextSunday();
  const sundayNumber = getSundayOfMonth(targetSunday);

  // Convert start time string to 24-hour format hour
  const startHour = parseTimeStringToHour(startTime);
  const times = calculateMeetingTimes(startHour);

  // Base schedule that's always the same
  const baseSchedule = [
    {
      duration: "60 minutes",
      activity: "Sacrament Meeting",
      description: "Worship service with sacrament, talks, and music",
      time: times.sacrament,
    },
    {
      duration: "10 minutes",
      activity: "Transition",
      description: "Transition to classes and meetings",
      time: times.transition,
    },
  ];

  // Variable schedule based on Sunday of the month
  let variableSchedule = [];

  if (sundayNumber === 1 || sundayNumber === 3) {
    // First and third Sundays: Sunday School
    variableSchedule = [
      {
        duration: "50 minutes",
        activity: "Primary (Children)",
        description: "Primary classes including nursery for children",
        time: times.secondBlock,
        ageGroup: "Children (18 months - 11 years)",
      },
      {
        duration: "50 minutes",
        activity: "Sunday School",
        description: "Gospel study classes for youth and adults",
        time: times.secondBlock,
        ageGroup: "Youth & Adults (12+ years)",
      },
    ];
  } else if (sundayNumber === 2 || sundayNumber === 4) {
    // Second and fourth Sundays: Priesthood quorum, Relief Society, Young Women
    variableSchedule = [
      {
        duration: "50 minutes",
        activity: "Primary (Children)",
        description: "Primary classes including nursery for children",
        time: times.secondBlock,
        ageGroup: "Children (18 months - 11 years)",
      },
      {
        duration: "50 minutes",
        activity: "Priesthood Quorum Meetings",
        description: "Priesthood meetings for men and young men",
        time: times.secondBlock,
        ageGroup: "Men & Young Men (12+ years)",
      },
      {
        duration: "50 minutes",
        activity: "Relief Society",
        description: "Relief Society meeting for women",
        time: times.secondBlock,
        ageGroup: "Women (18+ years)",
      },
      {
        duration: "50 minutes",
        activity: "Young Women",
        description: "Young Women meeting",
        time: times.secondBlock,
        ageGroup: "Young Women (12-17 years)",
      },
    ];
  } else if (sundayNumber === 5) {
    // Fifth Sundays: Special meetings for youth and adults
    variableSchedule = [
      {
        duration: "50 minutes",
        activity: "Primary (Children)",
        description: "Primary classes including nursery for children",
        time: times.secondBlock,
        ageGroup: "Children (18 months - 11 years)",
      },
      {
        duration: "50 minutes",
        activity: "Fifth Sunday Meeting",
        description:
          "Combined meeting for youth and adults with special topic. Bishopric determines format and assigns teachers.",
        time: times.secondBlock,
        ageGroup: "Youth & Adults (12+ years)",
        note: "Topic and format determined by bishopric. Youth and adults may meet separately or together.",
      },
    ];
  }

  return {
    date: formatDate(targetSunday),
    sundayOfMonth: sundayNumber,
    schedule: [...baseSchedule, ...variableSchedule],
    totalDuration: "2 hours",
    startTime: startTime,
  };
}

/**
 * Gets a simple description of what type of Sunday it is
 */
function getSundayType(date = null) {
  const sundayNumber = getSundayOfMonth(date);

  if (sundayNumber === 1 || sundayNumber === 3) {
    return "Sunday School Sunday";
  } else if (sundayNumber === 2 || sundayNumber === 4) {
    return "Priesthood & Auxiliary Sunday";
  } else if (sundayNumber === 5) {
    return "Fifth Sunday Combined Meeting";
  }

  return "Regular Sunday";
}

/**
 * Gets common church start times
 */
function getCommonStartTimes() {
  return [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
  ];
}

export {
  getSundaySchedule,
  getSundayType,
  getSundayOfMonth,
  getNextSunday,
  formatDate,
  getCommonStartTimes,
};
