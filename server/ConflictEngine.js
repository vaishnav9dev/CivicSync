
const REPEAT_DIG_WINDOW_DAYS = 7;

function daysBetween(dateA, dateB) {
  const a = Date.parse(`${dateA}T00:00:00Z`);
  const b = Date.parse(`${dateB}T00:00:00Z`);

  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function datesOverlap(a, b) {
  return a.startDate <= b.endDate &&
         b.startDate <= a.endDate;
}

function getOverlapDays(a, b) {
  const start = a.startDate > b.startDate
    ? a.startDate
    : b.startDate;

  const end = a.endDate < b.endDate
    ? a.endDate
    : b.endDate;

  return daysBetween(start, end) + 1;
}

function getConflict(a, b) {
  if (a.roadSegmentId !== b.roadSegmentId) {
    return null;
  }

  if (datesOverlap(a, b)) {
    return {
      id: `${a.id}-${b.id}`,
      projectA: a.id,
      projectB: b.id,
      roadSegmentId: a.roadSegmentId,
      type: "SCHEDULE_OVERLAP",
      severity: "High",
      overlapDays: getOverlapDays(a, b),
      reason:
        `${a.name} and ${b.name} share ${a.roadSegmentId} ` +
        "and have overlapping work dates.",
      recommendation:
        "Review whether the work can be coordinated or rescheduled."
    };
  }

  let earlier = a;
  let later = b;

  if (b.startDate > a.startDate) {
    earlier = a;
    later = b;
  } else {
    earlier = b;
    later = a;
  }

  const gap = daysBetween(earlier.endDate, later.startDate);

  const sameWorkType = earlier.workType === later.workType;

  if (
    gap >= 1 &&
    gap <= REPEAT_DIG_WINDOW_DAYS &&
    !sameWorkType
  ) {
    return {
      id: `${earlier.id}-${later.id}`,
      projectA: earlier.id,
      projectB: later.id,
      roadSegmentId: earlier.roadSegmentId,
      type: "POTENTIAL_REPEAT_EXCAVATION",
      severity: gap <= 3 ? "High" : "Medium",
      gapDays: gap,
      reason:
        `${later.name} starts ${gap} day(s) after ` +
        `${earlier.name} ends on the same road segment.`,
      recommendation:
        "Verify restoration requirements and whether the work can be coordinated."
    };
  }

  return null;
}

export function detectConflicts(projects) {
  const conflicts = [];

  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const conflict = getConflict(projects[i], projects[j]);

      if (conflict) {
        conflicts.push(conflict);
      }
    }
  }

  return conflicts;
}