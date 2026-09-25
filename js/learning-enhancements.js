(function () {
  "use strict";

  var data = window.JF_HANDBOOK_CONTENT;
  if (!data || !data.parts) return;

  var modules = {};
  data.parts.forEach(function (part) {
    part.modules.forEach(function (module) {
      modules[module.slug] = module;
    });
  });

  var practice = {
    "your-first-week": ["Run your first-day check", "Without looking back, name the three identities you must verify before opening client information.", "Name the Trainer Portal user, the JF Coach trainer identity, and the shared iPad identity in your response."],
    "one-on-ones-with-gabrielle": ["Prepare a useful 1:1", "Write one real client, system, sales, or delivery issue you would bring to Gabrielle, including the exact screen or example.", "A specific issue is useful. A vague topic is not."],
    "story-and-mission": ["Explain the mission", "Give a 30-second explanation of why Jamie Fitness exists and how your role helps both beginners and new trainers.", "Use your own words. Keep the meaning."],
    "numbers-build-up-curve": ["Diagnose one weak link", "Choose one funnel stage you would review after a disappointing week and name one action you would test next.", "Use the numbers to choose an action, not to judge yourself."],
    "client-journey": ["Teach the journey", "Explain the four client stages to an imaginary new lead without using internal jargon.", "The person should know what happens next and why."],
    "trainer-portal": ["Find the right surface", "Before your next shift, locate JF Notes, Retention, Messages, Booking Links, and the incident tool in the Trainer Portal.", "Do this on your own approved account."],
    "program-builder": ["Preview before publishing", "Open a safe training example and identify the client, program type, start date, and destination you would verify before publishing.", "Do not publish a live program as practice."],
    "jf-notes": ["Leave a useful note", "Draft a short note containing the client context, what happened, and the next action.", "A future trainer should understand the situation without asking you."],
    "retention-tab": ["Read a risk signal", "Choose one example retention flag and explain the evidence you would check before acting.", "Do not guess from the color alone."],
    "accountability-messages": ["Make it personal", "Rewrite a generic check-in so it mentions one real goal, action, or recent conversation.", "Keep it short enough to sound human."],
    "booking-links-ipad": ["Choose the booking owner", "For one ongoing appointment and one Kickstart appointment, say who changes it and which tool they use.", "Use the ownership rule before touching a calendar."],
    "jf-app-health-score": ["Trace one client action", "Pick one client action and explain where it appears in JF Coach and what it can change in the Health Score.", "Separate live client data from portal summaries."],
    "support-client-jf-app": ["Guide without taking over", "Practise explaining one JF Coach task while letting the client keep control of their phone.", "Use one instruction at a time."],
    "daily-ops-toolkit": ["Run a shift scan", "List the three screens you would check at the start of a shift and the one question each screen answers.", "Keep the scan under two minutes."],
    "free-session-to-kickstart": ["Rehearse the handoff", "Say the exact next step for a sale, a no-sale follow-up, and a no-show.", "Each outcome needs a clear owner and record."],
    "selling-the-kickstart": ["Practise the small close", "Say the Kickstart recommendation in your own voice, then ask one direct closing question.", "Record yourself once if you want to hear your pace."],
    "objection-handling": ["Slow the objection down", "Choose one objection and practise: acknowledge it, ask one clarifying question, then respond to the real concern.", "Do not race to a script before understanding the concern."],
    "21-day-onboarding": ["Plan the next week", "Choose a fictional client and write one meals action, one steps action, and one solo-training action that fit their real week.", "Make each action small enough to complete."],
    "count-cue-encourage": ["Run one live set", "During your next safe set, do not call every rep. Give one cue and two specific encouragements.", "Notice whether the cue stayed short enough to keep the set moving."],
    "running-great-sessions": ["Make one safe adjustment", "Choose Easy, Medium, or Hard for a fictional set and explain your next load, rep, or rest decision.", "Technique and safety override the plan."],
    "retention-mastery": ["Prepare a retention conversation", "Write one observation, one open question, and one next action for a client whose engagement has dropped.", "Use evidence, not assumptions."],
    "policy-professionalism": ["Protect the standard", "Choose one difficult boundary and practise the sentence you would use with a client.", "Be kind, direct, and consistent."],
    "pay-tiers-kpis": ["Use a KPI diagnostically", "Choose one KPI, name what it diagnoses, and identify the next skill or process you would review.", "Do not treat one unusual week as a verdict."],
    "payroll-rules": ["Check before claiming", "For a fictional session, identify the client, appointment type, date, completion evidence, and exception you would verify.", "Unknown evidence stays unknown."],
    "working-with-the-va": ["Write a complete handoff", "Draft a VA message with the client stage, appointment, change, client context, and exact action needed.", "The receiver should not need a follow-up question."],
    "incident-reporting": ["Rehearse the first minute", "Say your first three actions when a client becomes faint, before thinking about the report.", "Person and area safety come first."]
  };

  var interactives = {
    "how-your-role-works": {
      type: "routeGame",
      title: "Ownership drill",
      intro: "Route each situation to the person who acts first.",
      categories: ["Trainer", "VA", "Management"],
      items: [
        { prompt: "Reschedule an ongoing client appointment", answer: 0, feedback: "The trainer manages ongoing appointments in JF Coach." },
        { prompt: "Move a Kickstart appointment", answer: 1, feedback: "The VA manages Kickstart scheduling." },
        { prompt: "Resolve a wrong trainer identity or missing client book", answer: 2, feedback: "Stop and report the access problem to management." },
        { prompt: "Run and record a client session", answer: 0, feedback: "Session delivery and accurate records are trainer-owned." }
      ]
    },
    "numbers-build-up-curve": {
      type: "curveExplorer",
      title: "Explore the build-up curve",
      intro: "Move through the benchmark stages. This is a reference pattern, not a guarantee.",
      stages: [
        { label: "Weeks 1 to 5", title: "Create volume", text: "Build consistent booking activity and daily availability while the first clients enter the journey." },
        { label: "Around week 6", title: "Expect the lag", text: "Many clients have not reached their Strategy Session yet. A temporary trough can be normal." },
        { label: "Weeks 7 to 12", title: "Improve the weak link", text: "Use your weekly review with Gabrielle to choose the one funnel stage that needs practice." },
        { label: "By week 12", title: "Stabilise hours", text: "Work toward the hours goal you agreed with Gabrielle while protecting retention and follow-through." }
      ]
    },
    "client-journey": {
      type: "stepExplorer",
      title: "Walk the client journey",
      intro: "Select a stage to see the trainer's job and the handoff that follows.",
      steps: [
        { label: "Free session", title: "Understand and prescribe", text: "Give the person a useful first experience, understand the goal, and prescribe the 21-Day Kickstart when it fits." },
        { label: "Kickstart", title: "Build proof and habits", text: "Deliver three weeks of training, meals, steps, app support, and a solo-training win." },
        { label: "Strategy", title: "Hand over the full context", text: "Book Gabrielle's Strategy Session and complete accurate Post-KSP notes." },
        { label: "Ongoing", title: "Train, progress, and retain", text: "Own session quality, ongoing appointments, records, accountability, and relationship health." }
      ]
    },
    "free-session-to-kickstart": {
      type: "choiceGame",
      title: "Outcome sprint",
      intro: "Choose the next action for each free-session outcome.",
      rounds: [
        { prompt: "The client buys the Kickstart.", options: ["Record payment and book the first Kickstart step", "Wait for the client to contact the VA", "Create an ongoing appointment"], answer: 0, feedback: "Record the sale and complete the approved Kickstart handoff immediately." },
        { prompt: "The client does not buy but is open to follow-up.", options: ["Record the accurate outcome and context", "Mark the session as a sale", "Delete the lead"], answer: 0, feedback: "The next person needs an accurate outcome and useful context." },
        { prompt: "The client no-shows.", options: ["Record the no-show outcome", "Book another free session yourself", "Mark the workout complete"], answer: 0, feedback: "Record what happened so the VA and management can take the correct next action." }
      ]
    },
    "selling-the-kickstart": {
      type: "choiceGame",
      title: "Sales conversation",
      intro: "Choose the line that keeps the conversation personal and direct.",
      rounds: [
        { prompt: "You understand the client's goal. What comes next?", options: ["Recommend the Kickstart and connect it to their goal", "List every service Jamie Fitness offers", "Ask them to read the website later"], answer: 0, feedback: "A clear prescription is easier to understand than a menu." },
        { prompt: "The client pauses after hearing the price.", options: ["Ask what is giving them pause", "Repeat the price louder", "Immediately discount it"], answer: 0, feedback: "Clarify the real concern before responding." },
        { prompt: "The concern is resolved.", options: ["Ask a direct next-step question", "Keep talking until they interrupt", "Change the topic"], answer: 0, feedback: "A calm direct close gives the client a clear decision." }
      ]
    },
    "21-day-onboarding": {
      type: "stepExplorer",
      title: "Build the three-week habit stack",
      intro: "The client adds one layer at a time. Select each week to see the proof you need.",
      steps: [
        { label: "Week 1", title: "Meals", text: "Choose one approved tracking method and discuss what the client actually ate. Proof is useful awareness, not perfect eating." },
        { label: "Week 2", title: "Steps", text: "Keep the meals action, add a realistic walking target, and confirm how it will be tracked." },
        { label: "Week 3", title: "Solo training", text: "The client completes and fully saves one solo workout in JF Coach, including RPE and rating." },
        { label: "Handoff", title: "Strategy ready", text: "Book the Strategy Session and complete Post-KSP notes with intent, goals, needs, and barriers." }
      ]
    },
    "running-great-sessions": {
      type: "intensityLab",
      title: "Intensity and rest lab",
      intro: "Choose the client's answer and the exercise type. Compare your decision with the safe rule."
    },
    "pay-tiers-kpis": {
      type: "choiceGame",
      title: "Find the weak link",
      intro: "Choose the first area to review. KPI trends diagnose a process, not a person.",
      rounds: [
        { prompt: "Free-session attendance is falling.", options: ["Booking quality, reminders, and attendance recovery", "Exercise selection in ongoing sessions", "Quarterly pay tier"], answer: 0, feedback: "Start with booking quality and reminders." },
        { prompt: "Kickstart to Strategy bookings are falling.", options: ["The value script and handoff discipline", "Gym equipment availability", "Program exercise order"], answer: 0, feedback: "Review how the Strategy Session is explained, booked, and handed over." },
        { prompt: "Monthly retention is falling.", options: ["Session quality, progress, contact, and relationship health", "Only increase free-session volume", "Change the pay tier target before checking delivery"], answer: 0, feedback: "Retention is protected by delivery, progress, contact, and relationship quality." }
      ]
    },
    "working-with-the-va": {
      type: "routeGame",
      title: "VA handoff drill",
      intro: "Route the scheduling action, then read the boundary.",
      categories: ["Trainer", "VA"],
      items: [
        { prompt: "Add an ongoing client's recurring appointment", answer: 0, feedback: "The trainer manages ongoing appointments in JF Coach." },
        { prompt: "Reschedule a free session", answer: 1, feedback: "The VA manages free-session scheduling." },
        { prompt: "Move a Kickstart session", answer: 1, feedback: "The VA manages Kickstart scheduling." },
        { prompt: "Keep an ongoing client's calendar accurate", answer: 0, feedback: "Calendar accuracy for ongoing clients remains trainer-owned." }
      ]
    },
    "policy-professionalism": {
      type: "choiceGame",
      title: "Ongoing client operations capstone",
      intro: "Work through one difficult client day. Every choice affects the client, calendar, handoff, or payroll record.",
      rounds: [
        { prompt: "An ongoing client's JF Coach message fails and their next session is tomorrow.", options: ["Retry once through the supported control, confirm the result, then record and report the failure if it persists", "Assume silence means cancellation and remove tomorrow's appointment", "Switch to a personal account so the message reaches them"], answer: 0, feedback: "Check the system before judging the client. Preserve the appointment and report a persistent delivery problem." },
        { prompt: "The client cancels three hours before the session and does not reschedule.", options: ["Keep the forfeited appointment and record the real outcome", "Remove the appointment and create a spare automatically", "Move the appointment to next week without asking"], answer: 0, feedback: "A forfeited late cancellation remains in the calendar and is recorded accurately." },
        { prompt: "The same client permanently changes their weekly time.", options: ["Change this and following, then verify the next future occurrence", "Move this occurrence only and add a note about the new weekly time", "Rebuild the series from its original start date"], answer: 0, feedback: "Use the smallest correct future scope and verify the result. Historical appointments stay read-only." },
        { prompt: "At Friday close, the completed session and forfeited late cancellation remain, while a moved original and paused-client booking are gone.", options: ["The calendar is ready for the payroll check", "Restore the moved original because it happened during this pay week", "Keep the paused booking until management manually removes it"], answer: 0, feedback: "Calendar truth drives payroll. Completed and forfeited sessions remain; moved originals and paused-client bookings do not." }
      ]
    },
    "incident-reporting": {
      type: "choiceGame",
      title: "First-minute decisions",
      intro: "Choose what happens next. Safety comes before documentation.",
      rounds: [
        { prompt: "A client becomes faint beside a machine.", options: ["Stop, make the person and area safe, and stay with them", "Ask the client to sit alone while you notify management", "Move the next client to another exercise and finish the current booking"], answer: 0, feedback: "Immediate care and area safety come first." },
        { prompt: "Their condition worsens.", options: ["Call 000 and follow your first aid responsibilities", "Wait for management to decide whether it is serious", "Arrange a rideshare so they can recover at home"], answer: 0, feedback: "Call 000 for a serious or worsening condition." },
        { prompt: "The person is safe and the immediate response is complete.", options: ["File the specific same-day report", "Send management a short message and complete the form at the end of the week", "Record only the equipment fault because the client recovered"], answer: 0, feedback: "Record objective facts, actions, condition, witnesses, and follow-up the same day." },
        { prompt: "The next day arrives.", options: ["Check in with the person", "Wait for the client to raise it at their next booked session", "Treat the same-day report as the final action"], answer: 0, feedback: "The next-day check-in is part of the standard." }
      ]
    }
  };

  function insertBeforeReview(module, block) {
    var index = module.blocks.findIndex(function (item) {
      return item.type === "takeaways" || item.type === "quiz";
    });
    if (index < 0) module.blocks.push(block);
    else module.blocks.splice(index, 0, block);
  }

  Object.keys(modules).forEach(function (slug) {
    var module = modules[slug];

    module.blocks = module.blocks.filter(function (block) {
      return block.type !== "videoGroup";
    });

    var takeawayBlocks = module.blocks.filter(function (block) {
      return block.type === "takeaways";
    });
    if (takeawayBlocks.length > 1) {
      var combined = [];
      takeawayBlocks.forEach(function (block) {
        block.items.forEach(function (item) {
          if (combined.indexOf(item) < 0) combined.push(item);
        });
      });
      var kept = false;
      module.blocks = module.blocks.filter(function (block) {
        if (block.type !== "takeaways") return true;
        if (kept) return false;
        kept = true;
        block.items = combined;
        return true;
      });
    }

    if (interactives[slug]) insertBeforeReview(module, interactives[slug]);
    if (practice[slug]) {
      insertBeforeReview(module, {
        type: "practice",
        title: practice[slug][0],
        prompt: practice[slug][1],
        proof: practice[slug][2]
      });
    }
  });

  insertBeforeReview(modules["how-your-role-works"], {
    type: "responseExercise",
    title: "Draw your own boundary",
    intro: "Write one example in each box. These responses stay on this device as training progress.",
    audioText: "Draw your boundary. Name one task you own, one task the VA owns, and one decision that must be escalated. Clear ownership prevents dropped work.",
    fields: [
      { key: "owned", label: "One task I own", hint: "Example: keep an ongoing client's appointments accurate." },
      { key: "coordinate", label: "One task I coordinate", hint: "Example: give the VA complete context for a Kickstart change." },
      { key: "escalate", label: "One decision I escalate", hint: "Example: stop and report an identity or client-data mismatch." }
    ],
    note: "Optional future idea: trainers could choose to request AI feedback on a saved practice response. Nothing is analysed or sent anywhere today."
  });

  function collapseExtraCallouts(module) {
    return module;
  }
  function collapseExtraCalloutsUnused(module, visibleCount) {
    if (!module) return;
    var seen = 0;
    var overflow = [];
    module.blocks = module.blocks.filter(function (block) {
      if (block.type !== "callout") return true;
      seen += 1;
      if (seen <= visibleCount) return true;
      overflow.push({
        title: block.title || "Process note",
        content: [block.text]
      });
      return false;
    });
    if (!overflow.length) return;
    var practiceIndex = module.blocks.findIndex(function (block) { return block.type === "practice"; });
    module.blocks.splice(practiceIndex < 0 ? module.blocks.length : practiceIndex, 0, {
      type: "accordion",
      items: overflow
    });
  }

  Object.keys(modules).forEach(function (slug) {
    collapseExtraCallouts(modules[slug], 2);
  });

  var curve = modules["numbers-build-up-curve"];
  if (curve) {
    var curveInsert = curve.blocks.findIndex(function (block) { return block.type === "practice"; });
    curve.blocks.splice(curveInsert < 0 ? curve.blocks.length : curveInsert, 0, {
      type: "callout",
      title: "Use benchmarks as a diagnostic",
      text: "The figures in this lesson are trainer standards as of 29 July 2026. Confirm any later change with Gabrielle before using them in a performance plan."
    });
  }

  var onboarding = modules["21-day-onboarding"];
  if (onboarding) {
    onboarding.blocks = onboarding.blocks.filter(function (block) {
      return !(block.type === "callout" && block.title === "Archive video context");
    });
  }

  var pay = modules["pay-tiers-kpis"];
  if (pay) {
    var removeNext = false;
    pay.blocks = pay.blocks.filter(function (block) {
      if (block.type === "heading" && block.text === "Kickstart Commission") {
        removeNext = true;
        return false;
      }
      if (removeNext && block.type === "prose") {
        removeNext = false;
        return false;
      }
      return true;
    });
    var payInsert = pay.blocks.findIndex(function (block) { return block.type === "takeaways"; });
    pay.blocks.splice(payInsert < 0 ? pay.blocks.length : payInsert, 0, {
      type: "callout",
      tone: "warning",
      title: "Confirm the current Kickstart commission rule",
      text: "Current materials agree that commission triggers only after one client's cumulative Kickstart payments reach $99.99, and that the $69.99 legacy price earns no commission. Historical materials conflict on the commission amount. As of 29 July 2026, confirm the live amount with Jamie or Gabrielle before relying on or quoting it."
    });
    var payQuiz = pay.blocks.find(function (block) { return block.type === "quiz"; });
    if (payQuiz) {
      payQuiz.questions = payQuiz.questions.filter(function (question) {
        return !/commission|instalments|installments|\$69\.99/i.test(question.q);
      });
      payQuiz.questions.push({
        q: "Historical materials disagree on the Kickstart commission amount. What should you do?",
        options: ["Use the largest figure", "Confirm the live amount with Jamie or Gabrielle", "Quote the oldest video", "Assume every discounted sale qualifies"],
        answer: 1,
        feedback: "The payment threshold is documented, but the amount is not resolved in current source material. Confirm it before relying on or quoting it."
      });
    }
  }

  function findBlock(module, type, match) {
    if (!module) return null;
    return module.blocks.find(function (block) {
      return block.type === type && (!match || match(block));
    }) || null;
  }

  function removeHeadingAndFollowing(module, headingText, followingType) {
    if (!module) return;
    var index = module.blocks.findIndex(function (block) {
      return block.type === "heading" && block.text === headingText;
    });
    if (index < 0) return;
    module.blocks.splice(index, module.blocks[index + 1] && module.blocks[index + 1].type === followingType ? 2 : 1);
  }

  var role = modules["how-your-role-works"];
  if (role) {
    var ownershipTable = findBlock(role, "table", function (block) {
      return block.headers && block.headers[0] === "Role";
    });
    if (ownershipTable && ownershipTable.rows[2]) {
      ownershipTable.rows[2][1] = "Lead calling, qualification, and schedule support";
      ownershipTable.rows[2][2] = "Call and qualify approved lead lists, follow inbound opt-ins, manage Free Session and Kickstart scheduling, recover no-shows and gaps, confirm availability, and fill the trainer calendar.";
    }
    var hoursCopy = findBlock(role, "prose", function (block) {
      return block.text.indexOf("Ongoing client hours per week drive") === 0;
    });
    if (hoursCopy) {
      hoursCopy.text = "Ongoing client hours per week are the clearest measure of a stable trainer book. Client count can hide differences in training frequency. Use about 1.2 ongoing hours per client only as a planning estimate. In your first meeting with Gabrielle, set a week-12 hours goal and back-calculate the weekly actions. The current build range is 15 to 20 ongoing hours by roughly week 12, with 20 ongoing hours as the core success bar.";
    }
    role.blocks = role.blocks.filter(function (block) {
      return !(block.type === "callout" && block.title === "A realistic build benchmark") &&
        !(block.type === "prose" && /The economics explain the urgency|successful trainer may net/i.test(block.text || ""));
    });
    var supportCopy = findBlock(role, "prose", function (block) {
      return block.text.indexOf("Building trainers receive two one-on-ones") === 0;
    });
    if (supportCopy) {
      supportCopy.text += " Your first week should contain enough real bookings to build momentum. For roughly the first 1 to 2 weeks, management may protect the hottest opportunities while you prove the basics on moderate-to-high-intent bookings. Once Gabrielle signs off your session, sales, and follow-up fundamentals, lead intensity can increase. Raise an empty calendar or an overload early rather than silently accepting either.";
    }
  }

  var numbers = modules["numbers-build-up-curve"];
  if (numbers) {
    var buildSteps = findBlock(numbers, "steps");
    if (buildSteps) {
      buildSteps.items = [
        { title: "Weeks 1 to 5: create volume", text: "Aim for 18 to 22 bookings each week. Spread them at 3 to 4 per day with at least 1 hour of availability daily." },
        { title: "Around week 6: expect the lag", text: "Many Kickstart clients have not reached their Strategy Session. Keep booking, delivering, recording, and handing off accurately." },
        { title: "Weeks 7 to 12: improve the weak link", text: "Review the funnel with Gabrielle each week. Practise the stage with the largest gap instead of changing every part of the process at once." },
        { title: "By week 12: stabilise the book", text: "Work toward the hours goal agreed with Gabrielle. The current build range is 15 to 20 ongoing hours per week, supported by consistent delivery and strong retention." }
      ];
    }
    var benchmarkTable = findBlock(numbers, "table");
    if (benchmarkTable) {
      benchmarkTable.headers = ["Measure", "Trainer standard", "What it tells you"];
      benchmarkTable.rows = [
        ["Free-session completion", "80%", "Whether opportunities reach a real session."],
        ["Free session to Kickstart", "40%", "Whether the experience and recommendation create a clear first yes."],
        ["Kickstart completion", "90%", "Whether all three sessions are booked and early engagement is protected."],
        ["Kickstart to Strategy booked", "75%", "Whether the handoff is explained and booked before the client drifts."],
        ["Strategy Session show", "75%", "Whether the value and commitment remain clear after booking."],
        ["Strategy Session to ongoing", "75%", "Whether delivery, evidence, fit, and the recommendation support the ongoing decision."],
        ["Full funnel", "8 scheduled Free Sessions to 1 ongoing client", "Whether the complete journey is producing durable hours."],
        ["Monthly retention", "90%", "Whether session quality, progress, contact, and relationship health protect the book."]
      ];
    }
    removeHeadingAndFollowing(numbers, "Know what each hour changes", "list");
    var curveTakeaways = findBlock(numbers, "takeaways");
    if (curveTakeaways) {
      curveTakeaways.items = [
        "I understand why a lag around week 6 can be normal.",
        "I know the early booking volume and spacing target.",
        "I can name every funnel standard and the behavior it diagnoses.",
        "I bring real lost Free Sessions and incomplete handoffs to sales practice."
      ];
    }
  }

  var selling = modules["selling-the-kickstart"];
  if (selling) {
    var salesBenchmark = findBlock(selling, "table", function (block) {
      return block.headers && block.headers[0] === "Measure";
    });
    if (salesBenchmark) {
      salesBenchmark.headers = ["Measure", "Trainer standard", "Coaching response"];
      salesBenchmark.rows = [
        ["Free session to Kickstart", "40%", "Review the session experience, goal discovery, recommendation, and direct close."],
        ["Kickstart completion", "90%", "Book all three sessions immediately and recover any threatened gap early."],
        ["Kickstart to Strategy booked", "75%", "Explain the value, book before graduation ends, and complete the handoff notes."],
        ["Strategy Session to ongoing", "75%", "Improve the Kickstart evidence, client fit, notes, and recommendation context."]
      ];
    }
  }

  var journey = modules["client-journey"];
  if (journey) {
    var journeySteps = findBlock(journey, "steps");
    if (journeySteps && journeySteps.items[2]) {
      journeySteps.items[2].text = "A free Zoom session with PT Manager Gabrielle, with Jamie covering approved overflow. Use the live booking script that explains its tailored value, then record complete Post-KSP notes for the client card.";
    }
    var callNames = findBlock(journey, "list");
    if (callNames) {
      callNames.items = [
        "The post-Free-Session call is the Jamie 15 Minute Fitness Foundation Call.",
        "The post-Kickstart call is the Fitness Strategy Session. Use the live round-robin booking link so Gabrielle or Jamie receives it correctly.",
        "Use the live booking flow. Trainers book the session and complete the template, but do not manually choose or change the internal routing."
      ];
    }
    var valueCopy = findBlock(journey, "prose", function (block) {
      return block.text.indexOf("An ongoing package is usually worth") === 0;
    });
    if (valueCopy) valueCopy.text = "As of 29 July 2026, an ongoing package is usually worth roughly $2,000 to $3,000. The pricing shape is about $60 for 30 minutes, about $85 for 45 minutes, and $110 to $120 for 60 minutes. Confirm live pricing in the approved sales surface before quoting it. Be precise: $85 for a 45-minute session is not an $85 hourly rate.";
  }

  var kickstart = modules["21-day-onboarding"];
  if (kickstart) {
    var habitTable = findBlock(kickstart, "table");
    if (habitTable) {
      habitTable.rows[0][2] = "Lock all three Kickstart sessions into the calendar immediately. Teach the current meal guide and tracking options, then ask about the chosen action in each session.";
    }
    var habitHeading = kickstart.blocks.findIndex(function (block) {
      return block.type === "heading" && block.text === "Accountability without overload";
    });
    if (habitHeading >= 0) {
      kickstart.blocks.splice(habitHeading, 0, {
        type: "callout",
        tone: "warning",
        title: "Protect the 21-day promise",
        text: "Book all three sessions when the client joins. The program is designed to finish inside 21 days and must not drift beyond 4 weeks from purchase. If availability threatens that window, involve the VA or Gabrielle immediately."
      });
    }
    insertBeforeReview(kickstart, {
      type: "choiceGame",
      title: "Strategy handoff judgment",
      intro: "Use the client's Kickstart evidence to create a useful handoff, not a generic sales pitch.",
      rounds: [
        { prompt: "An experienced client already programs independently but repeatedly asks for nutrition accountability. What belongs in the handoff?", options: ["Their stated accountability gap, nutrition behavior, proof from the Kickstart, and what support they value", "A generic claim that every client needs twice-weekly PT", "Only the exercises completed"], answer: 0, feedback: "The Strategy Session should diagnose and prescribe from the client's evidence and stated gap." },
        { prompt: "The client says the proposed support does not match what they need.", options: ["Record the mismatch and the support they would value", "Remove the objection from the notes", "Increase urgency before clarifying the need"], answer: 0, feedback: "Accurate context lets Jamie or Gabrielle adjust the recommendation without over-pitching." },
        { prompt: "Session three is ending and no Strategy Session is booked.", options: ["Book it now and complete the structured handoff", "Wait for the client to request it", "Mark the Kickstart complete and leave the next step blank"], answer: 0, feedback: "Graduation includes the booked Strategy Session and a complete handoff." }
      ]
    });
  }

  var standards = modules["policy-professionalism"];
  if (standards) {
    var sessionStandards = findBlock(standards, "list");
    if (sessionStandards) {
      sessionStandards.items.splice(2, 0,
        "Keep open, positive body language: no hands in pockets, leaning on equipment, or holding the iPad while the client works.",
        "A no-show is not permission to display frustration. Reset, record the outcome, and use the available time for the approved gym-floor or follow-up action."
      );
    }
  }

  var healthScore = modules["jf-app-health-score"];
  if (healthScore) {
    var healthInsert = healthScore.blocks.findIndex(function (block) {
      return block.type === "takeaways";
    });
    healthScore.blocks.splice(healthInsert < 0 ? healthScore.blocks.length : healthInsert, 0,
      {
        type: "heading",
        text: "Score what the client controls"
      },
      {
        type: "prose",
        text: "Use Health Score signals to coach client-controlled behaviors such as solo workouts, check-ins, habits, nutrition, walking, and sleep. Never shame a client or reduce their score because the trainer failed to book, program, message, or record something. Fix the trainer-owned gap first."
      }
    );
  }

  var craft = modules["running-great-sessions"];
  if (craft) {
    var craftInsert = craft.blocks.findIndex(function (block) {
      return block.type === "takeaways";
    });
    craft.blocks.splice(craftInsert < 0 ? craft.blocks.length : craftInsert, 0,
      {
        type: "heading",
        text: "Earn independent-session sign-off"
      },
      {
        type: "steps",
        items: [
          { title: "Demonstrate the basics", text: "Show Gabrielle that you can demonstrate, set up, observe, and cue the core movements you will coach. Bench press technique is an explicit check, not an assumed certification skill." },
          { title: "Shadow and rehearse", text: "Observe or co-deliver sessions where confidence or technique is not yet reliable. Rehearse the exact client type or movement that exposes the gap." },
          { title: "Act on specific feedback", text: "Write the correction, practise it, and show the changed behavior. Feedback is part of the role standard, not a personal verdict." },
          { title: "Work independently when signed off", text: "Do not coach an unfamiliar movement or client situation alone. Ask for observation until the safe path is demonstrated." }
        ]
      },
      {
        type: "callout",
        tone: "warning",
        title: "Qualification is the starting point",
        text: "Certification does not prove practical coaching readiness. Gabrielle may shadow or co-deliver sessions until technique, confidence, communication, and safe judgment are demonstrated."
      }
    );
  }

  if (pay) {
    var kpiTable = findBlock(pay, "table", function (block) {
      return block.headers && block.headers[0] === "KPI";
    });
    if (kpiTable) {
      kpiTable.rows = [
        ["Free-session completion", "80%", "Booking quality, reminders, and attendance recovery."],
        ["Free session to Kickstart", "40%", "The Free Session experience and Kickstart recommendation."],
        ["Kickstart completion", "90%", "Immediate scheduling, early engagement, and recovery."],
        ["Kickstart to Strategy booking", "75%", "Value scripting and handoff discipline."],
        ["Strategy Session show", "75%", "Booking quality, value, and commitment."],
        ["Strategy Session to ongoing", "75%", "Kickstart value, notes, fit, and the Strategy recommendation."],
        ["Monthly client retention", "90%", "Session quality, progress, contact, and relationship health."],
        ["Scheduled Free Sessions to ongoing signups", "8 to 1", "The complete funnel from booked opportunity to ongoing client."],
        ["Average client lifespan", "20 or more weeks", "Long-term service value and retention."],
        ["Ongoing hours by week 12", "Goal agreed with Gabrielle; current build range 15 to 20 per week", "Whether the early build is becoming a stable client book."],
        ["Free-session and Kickstart outcomes", "100% recorded", "Whether the team has enough information to recover, coach, and improve."]
      ];
    }
    removeHeadingAndFollowing(pay, "Current conversion and retention benchmarks", "table");
  }

  function moveCorrectOption(item, targetIndex) {
    if (!item || !item.options || !item.options.length) return;
    var currentIndex = Number(item.answer);
    var target = targetIndex % item.options.length;
    if (currentIndex === target) return;
    var correctOption = item.options[currentIndex];
    item.options = item.options.slice();
    item.options.splice(currentIndex, 1);
    item.options.splice(target, 0, correctOption);
    item.answer = target;
  }

  var quizPosition = 0;
  Object.keys(modules).forEach(function (slug) {
    modules[slug].blocks.forEach(function (block) {
      if (block.type === "quiz") {
        block.questions.forEach(function (question) {
          moveCorrectOption(question, quizPosition);
          quizPosition += 1;
        });
      }
      if (block.type === "choiceGame") {
        block.rounds.forEach(function (round, roundIndex) {
          moveCorrectOption(round, roundIndex + quizPosition);
        });
      }
    });
  });

  var portalBase = "https://jamiefitness.au/trainer-dashboard/";
  var toolLinks = {
    "your-first-week": [
      { label: "Open Trainer Portal", url: portalBase },
      { label: "Install JF Coach", url: "https://apps.apple.com/us/app/jf-coach/id6791106148" },
      { label: "Check Incident Report", url: portalBase + "incident-report.php" }
    ],
    "one-on-ones-with-gabrielle": [{ label: "Book a 1:1", url: portalBase + "booking-links.php" }],
    "how-your-role-works": [{ label: "Open Portal Home", url: portalBase }],
    "numbers-build-up-curve": [{ label: "Open Portal Home", url: portalBase }],
    "client-journey": [{ label: "Open Booking Links", url: portalBase + "booking-links.php" }],
    "trainer-portal": [{ label: "Open Trainer Portal", url: portalBase }],
    "program-builder": [{ label: "Open Program Builder", url: portalBase + "program-builder.php" }],
    "jf-notes": [{ label: "Open JF Notes", url: portalBase + "jfnotes.php" }],
    "retention-tab": [{ label: "Open Retention", url: portalBase + "retention.php" }],
    "accountability-messages": [{ label: "Open Accountability Messages", url: portalBase + "messaging.php" }],
    "booking-links-ipad": [{ label: "Open Booking Links", url: portalBase + "booking-links.php" }],
    "jf-app-health-score": [
      { label: "Open Health Score", url: portalBase + "client-health-score.php" },
      { label: "Open Trainer Portal", url: portalBase }
    ],
    "support-client-jf-app": [{ label: "Open Trainer Portal", url: portalBase }],
    "daily-ops-toolkit": [
      { label: "Open Session Notes", url: portalBase + "fds-notes.php" },
      { label: "Open Member Names", url: portalBase + "member-names.php" },
      { label: "Open Updates", url: portalBase + "updates.php" }
    ],
    "free-session-to-kickstart": [
      { label: "Open Session Notes", url: portalBase + "fds-notes.php" },
      { label: "Open Booking Links", url: portalBase + "booking-links.php" }
    ],
    "selling-the-kickstart": [{ label: "Open Booking Links", url: portalBase + "booking-links.php" }],
    "objection-handling": [{ label: "Open Booking Links", url: portalBase + "booking-links.php" }],
    "21-day-onboarding": [
      { label: "Open Retention", url: portalBase + "retention.php" },
      { label: "Open Booking Links", url: portalBase + "booking-links.php" }
    ],
    "count-cue-encourage": [{ label: "Open Trainer Portal", url: portalBase }],
    "running-great-sessions": [{ label: "Open Trainer Portal", url: portalBase }],
    "retention-mastery": [
      { label: "Open Retention", url: portalBase + "retention.php" },
      { label: "Open Messages", url: portalBase + "messaging.php" },
      { label: "Open Booking Links", url: portalBase + "booking-links.php" }
    ],
    "quarterly-game-plan-playbook": [{ label: "Open Retention", url: portalBase + "retention.php" }],
    "policy-professionalism": [
      { label: "Open Incident Report", url: portalBase + "incident-report.php" },
      { label: "Open JF Notes", url: portalBase + "jfnotes.php" }
    ],
    "pay-tiers-kpis": [{ label: "Open Portal Home", url: portalBase }],
    "payroll-rules": [{ label: "Open Trainer Portal", url: portalBase }],
    "incident-reporting": [{ label: "Open Incident Report", url: portalBase + "incident-report.php" }]
  };

  Object.keys(modules).forEach(function (slug) {
    modules[slug].toolLinks = toolLinks[slug] || [];
  });

  function insertAfterFirstHeading(module, block) {
    var index = module.blocks.findIndex(function (item) { return item.type === "heading"; });
    module.blocks.splice(index < 0 ? 0 : index + 1, 0, block);
  }

  insertAfterFirstHeading(modules["story-and-mission"], {
    type: "portrait",
    src: "media/posters/client-professionalism.webp",
    alt: "Jamie introducing a Jamie Fitness training lesson",
    title: "A welcome from Jamie",
    text: "The handbook carries the same standard Jamie teaches in person: make the client feel safe, understood, and capable."
  });

  insertAfterFirstHeading(modules["policy-professionalism"], {
    type: "portrait",
    src: "media/posters/exercise-demonstration.webp",
    alt: "Jamie teaching exercise demonstration and cueing",
    title: "Professionalism is visible",
    text: "Your preparation, body language, attention, and follow-through teach the client what Jamie Fitness stands for."
  });

  insertBeforeReview(modules["trainer-portal"], {
    type: "portalSandbox",
    title: "Explore the Trainer Portal sandbox",
    intro: "Practise with clearly labelled fake clients. This local training component has no connection to the Trainer Portal, JF Coach, HubSpot, or live client data."
  });

  modules["objection-handling"].blocks = modules["objection-handling"].blocks.filter(function (block) {
    return !(block.type === "clipSlot" && block.id === "clip-price-objections");
  });

  ["retention-mastery"].forEach(function (slug) {
    insertBeforeReview(modules[slug], {
      type: "callout",
      tone: "warning",
      title: "Confirm live offer figures before quoting them",
      text: "The Accountability+ and Quarterly Game Plan figures in this lesson were captured in July 2026 and can change. Confirm the current price, eligibility, inclusions, and referral reward with Jamie or Gabrielle before quoting them to a client."
    });
    collapseExtraCallouts(modules[slug], 2);
  });

  insertBeforeReview(modules["retention-mastery"], {
    type: "callout",
    title: "Quarterly Game Plan, in brief",
    text: "If management uses a Quarterly Game Plan, translate the agreed goal into one observable weekly behavior and review it with evidence. It is a short planning tool, not a separate trainer curriculum."
  });

  insertAfterFirstHeading(modules["one-on-ones-with-gabrielle"], {
    type: "table",
    headers: ["What Gabrielle covers", "Likely rhythm", "Where to book"],
    rows: [
      ["Practical coaching sign-off, session feedback, sales practice, client examples, KPI review, and the next skill to rehearse.", "Building trainers usually have two useful touchpoints each week. The exact weekday and frequency depend on booked hours, current gaps, and Gabrielle's roster.", "Trainer Portal > More > Booking Links. Use Gabrielle's live 1:1 or coaching link shown there, not an old saved URL."]
    ]
  });

  function fence(title, text) {
    return { type: "callout", tone: "warning", title: title, text: text };
  }

  insertAfterFirstHeading(modules["selling-the-kickstart"], fence(
    "Lock all three before you take payment",
    "After they agree, say: Cool, the Kickstart works best when we lock all 3 sessions in now over the next 21 days. Let's book them at the same time each week so it's locked into your routine. If you cannot book all three, write on the JF Notes card: Kickstart sold. No sessions booked."
  ));

  if (modules["v2-software-films"]) {
    insertAfterFirstHeading(modules["v2-software-films"], fence(
      "If the picture and the lesson disagree",
      "Follow the lesson. Some films still show an older screen, or they stop before the click. Do not send, charge, publish, book, or tap Join while you practise."
    ));
  }

  insertAfterFirstHeading(modules["your-first-week"], fence(
    "How you sign in",
    "Log into the Trainer Portal with your own username and password. Open JF Coach from that portal. A pairing code is only for when management sends you a fresh link. Do not borrow someone else's login."
  ));

  insertAfterFirstHeading(modules["daily-ops-toolkit"], fence(
    "Team meetings are on the portal",
    "A signed-in trainer opens More, then Team Meetings, then Watch or Transcript."
  ));

  insertAfterFirstHeading(modules["your-first-week"], fence(
    "Leads and hours",
    "For the first week or two, take moderate to high intent leads. Then go hard. 10 to 15 hours is not the finish line. The first 12 weeks are."
  ));

  insertAfterFirstHeading(modules["support-client-jf-app"], fence(
    "They cannot read the app until they log in",
    "No goals on the profile means the form is not done. No sign-in means they have not logged in. Do not message them in the app about that. They will not see it. Use the Jamie Fitness email."
  ));

  insertAfterFirstHeading(modules["client-journey"], fence(
    "Do not pitch the Kickstart to a manager close",
    "If the note says the gym manager will consult straight after, deliver the session and stop. Do not pitch the Kickstart and do not book a follow-up."
  ));

  insertAfterFirstHeading(modules["21-day-onboarding"], fence(
    "The app videos already go out",
    "Short Kickstart videos go out as Gabrielle, Day 0 then odd days through Day 15. You do not send that sequence. You reinforce it: week 1 meals, week 2 steps, week 3 one solo workout."
  ));

  insertAfterFirstHeading(modules["21-day-onboarding"], fence(
    "Send a support message after Strategy is booked",
    "One personal JF Coach message in admin time, so the handoff does not feel like a drop. A voice message is better. A short video is best. Still complete the Post-KSP note."
  ));

  insertAfterFirstHeading(modules["program-builder"], fence(
    "Today versus the whole phase",
    "A one-off swap is for today. Do not pile extra exercises onto the phase. Gabrielle owns program quality. Do not wait for a separate Jamie approval, and do not publish during this lesson."
  ));

  insertAfterFirstHeading(modules["running-great-sessions"], fence(
    "Ignore the old failure clip",
    "If an older clip says take a squat to failure, or gives different rest for men and women, ignore the clip. Rest until they can speak. Keep 2 or 3 reps in reserve. Do not take squats or Romanian deadlifts to failure."
  ));

  insertAfterFirstHeading(modules["selling-the-kickstart"], fence(
    "Price on the Square screen",
    "Full price is 99.99. A discounted Kickstart can be 69.99, or a split, only when that is the offer you already agreed. If the item is any other amount, stop and ask. Do not invent a price. The film shows 99.99 and does not ban the approved discount."
  ));

  insertAfterFirstHeading(modules["running-great-sessions"], fence(
    "Beginner solos",
    "Do not program a Romanian deadlift for a beginner solo. Use a back extension, reuse their Kickstart exercises, and give a rep range."
  ));

  insertAfterFirstHeading(modules["running-great-sessions"], {
    type: "table",
    headers: ["Equipment", "What you log"],
    rows: [
      ["Dumbbell", "One dumbbell, not the pair. Two 20 kg dumbbells log as 20."],
      ["Barbell", "Bar plus plates. A 20 kg bar plus 10 kg a side logs as 40."],
      ["Smith", "Added plates only. Do not add the bar."],
      ["Cable", "One side only."],
      ["Plate-loaded machine", "Plates only. Not the machine."]
    ]
  });

  insertAfterFirstHeading(modules["jf-app-health-score"], fence(
    "Challenge, as of 25 September 2026",
    "The film is the sky chapter list. This week is Find your distance. Your habits are on that page and are not ticked. Wellbeing says Mood check-in and breathing exercises. Moods are Awesome, Good, Fine, Bad, and Terrible. Breaths are Box, Long exhale, Equal, and Custom. The film does not open that sheet. Do not tap Join the challenge, Add a habit, Try again, Tell the team, a habit tick, a mood, Play, or Add."
  ));

  ["trainer-portal", "program-builder", "jf-notes", "retention-tab", "accountability-messages", "booking-links-ipad", "jf-app-health-score", "support-client-jf-app", "free-session-to-kickstart", "selling-the-kickstart", "21-day-onboarding"].forEach(function (slug) {
    if (!modules[slug]) return;
    insertAfterFirstHeading(modules[slug], fence(
      "Practice fence",
      "In a film or a drill, do not send a message, charge a card, publish a program, book a live session, or tap Join. Those buttons write to a real client."
    ));
  });

  modules["booking-links-ipad"].blocks.unshift(fence(
    "ClickUp on that screen",
    "ClickUp on that screen means the JF Notes card. Do not open ClickUp. Free Session link after a Free Session. Strategy link after a Kickstart. 1:1 with Gabrielle is in More, then Booking Links."
  ));

  insertBeforeReview(modules["objection-handling"], {
    type: "objectionGame",
    title: "Optional objection practice",
    intro: "Guide a fictional client from hesitation to a clear next step. You can retry any choice and aim for 10 out of 10."
  });

  insertAfterFirstHeading(modules["selling-the-kickstart"], {
    type: "portrait",
    src: "media/posters/sales-script-breakdown.webp",
    alt: "Jamie teaching a trainer sales conversation",
    title: "Keep the conversation human",
    text: "Use the framework to listen, prescribe, and ask clearly. Do not recite a script over the client."
  });

  function warnFirst(slug, title, text) {
    if (!modules[slug]) return;
    modules[slug].blocks.unshift(fence(title, text));
  }

  warnFirst(
    "running-great-sessions",
    "Ignore the old clip",
    "Ignore squat to failure. Ignore different rest for men and women. Ignore ClickUp. Keep 2 to 3 reps in reserve, rest until they can speak, and write notes in JF Notes."
  );
  warnFirst(
    "selling-the-kickstart",
    "Ignore the old clip",
    "Ignore ClickUp. Notes go on the JF Notes card. Full price is $99.99. An agreed discount is $69.99 or Split. Do not say the Kickstart is usually worth $200."
  );
  warnFirst(
    "one-on-ones-with-gabrielle",
    "ClickUp on that screen",
    "ClickUp on that screen means the JF Notes card. Do not open ClickUp."
  );
  warnFirst(
    "support-client-jf-app",
    "This film is the current workout",
    "The film is Jordan's Lower Body Strength. Do not tap Start session."
  );
  warnFirst(
    "jf-app-health-score",
    "Challenge film",
    "The film is the sky chapter list, Find your distance, then Your habits, then Wellbeing. Do not tap Join the challenge, Add a habit, Try again, or Tell the team. Do not open the mood sheet."
  );
  warnFirst(
    "21-day-onboarding",
    "Nothing on this film is logged",
    "The film is Food, Wellbeing, and Progress. Do not log a mood, a breath, food, or a photo."
  );

  Object.keys(modules).forEach(function (slug) {
    modules[slug].blocks.forEach(function (block) {
      if (block.type === "list" && block.items) {
        block.items = block.items.map(function (item) {
          if (item.indexOf("Team Meetings appears in More") === 0 || item.indexOf("recordings page is currently unavailable") >= 0) {
            return "A signed-in trainer opens More, then Team Meetings, then Watch or Transcript.";
          }
          if (item.indexOf("unavailable to ordinary trainer accounts") >= 0) {
            return "Fortnightly team meetings. Attend live. A signed-in trainer opens More, then Team Meetings, then Watch or Transcript.";
          }
          return item;
        });
      }
      if (block.type === "prose" && block.text && block.text.indexOf("Let's set you up") >= 0) {
        block.text = "Switch account, then My Training. The setup screen says Your training. Your game. Do not tap Pick up where you left off or Start again. You book sessions, publish Ongoing, put solos on, take the first photo, and watch them log food. These films use demo names only. They do not send, charge, publish, or book a live session.";
      }
      if (block.type === "callout" && block.title === "V2 change") {
        block.text = "The setup screen says Your training. Your game. Do not tap Pick up where you left off or Start again. The film is Food, Wellbeing, and Progress on their phone. Do not log a mood, a breath, food, or a photo. You still book the series, publish Ongoing, put solos on, and take the first photo.";
      }
      if (block.type === "takeaways" && block.items) {
        block.items = block.items.map(function (item) {
          if (item.indexOf("Let's set you up") >= 0) {
            return "I can open My Training. The setup screen says Your training. Your game. I do not tap Pick up where you left off or Start again.";
          }
          return item;
        });
      }
      if (block.type === "clipSlot" && block.id === "clip-film-05") {
        block.title = "05 Challenge. Sky chapter list, Your habits, then Wellbeing. Nothing is tapped.";
      }
      if (block.type === "clipSlot" && block.id === "clip-jf-app-health-score") {
        block.title = "Challenge film. Sky chapter list. Your habits and Wellbeing are on the page. Nothing is tapped.";
      }
      if (block.type === "clipSlot" && block.id === "clip-support-client-jf-app") {
        block.title = "Log a workout. Lower Body Strength. Start session is not tapped.";
      }
      if (block.type === "clipSlot" && block.id === "clip-jf-coach-client-book") {
        block.title = "Open app shows Lower Body Strength. Start session is not tapped.";
      }
      if (block.type === "clipSlot" && block.id === "clip-21-day-onboarding-overview") {
        block.title = "Ongoing setup. Food, Wellbeing, and Progress. Nothing is logged.";
      }
    });
  });

  var searchAliases = {
    "trainer-portal": ["trainer dashboard", "portal home", "core tools", "software", "daily systems"],
    "jf-notes": ["ClickUp", "notes", "tasks", "reminders", "client deal card"],
    "booking-links-ipad": ["booking link", "Gabrielle link", "free session link", "Kickstart link", "calendar", "iPad"],
    "program-builder": ["programming", "workout builder", "program workspace", "publish program"],
    "selling-the-kickstart": ["Square", "payment", "tap to pay", "Kickstart sale"],
    "free-session-to-kickstart": ["Square", "payment", "free session", "Kickstart"],
    "accountability-messages": ["messages", "check-in", "weekly accountability", "client follow-up"],
    "incident-reporting": ["incident form", "injury", "first aid", "report"],
    "one-on-ones-with-gabrielle": ["Gabrielle booking", "coaching sign-off", "1:1", "feedback"]
  };
  Object.keys(searchAliases).forEach(function (slug) {
    if (modules[slug]) modules[slug].searchAliases = searchAliases[slug];
  });

  var path = [
    {
      id: "day-one",
      title: "Day 1: Jamie Fitness and Your Systems",
      description: "Understand the business, packages, support rhythm, and the software you will use before working with client information.",
      slugs: ["your-first-week", "story-and-mission", "how-your-role-works", "one-on-ones-with-gabrielle", "client-journey", "trainer-portal", "support-client-jf-app", "booking-links-ipad", "jf-notes", "program-builder"]
    },
    {
      id: "day-two",
      title: "Day 2: Coaching and Cueing",
      description: "Build the floor fundamentals: professional conduct, safety, incident response, counting, cueing, encouragement, and session flow.",
      slugs: ["policy-professionalism", "incident-reporting", "count-cue-encourage", "running-great-sessions"]
    },
    {
      id: "day-three",
      title: "Day 3: Advanced Coaching and Retention",
      description: "Coach the 21-day habit journey, use client progress signals, deliver accountability, and protect long-term results.",
      slugs: ["21-day-onboarding", "jf-app-health-score", "accountability-messages", "retention-tab", "daily-ops-toolkit", "retention-mastery"]
    },
    {
      id: "day-four",
      title: "Day 4: Sales, Growth, and Administration",
      description: "Run the Free Session close, handle objections, understand your numbers and pay, and hand work to the right owner.",
      slugs: ["free-session-to-kickstart", "selling-the-kickstart", "objection-handling", "numbers-build-up-curve", "pay-tiers-kpis", "payroll-rules", "working-with-the-va"]
    },
    {
      id: "software-films",
      title: "Software films",
      description: "The 15 current walkthroughs. Watch the one that matches the job.",
      slugs: ["v2-software-films"]
    }
  ];

  data.parts = path.map(function (part, index) {
    return {
      id: part.id,
      number: index + 1,
      title: part.title,
      description: part.description,
      modules: part.slugs.map(function (slug) { return modules[slug]; })
    };
  });

  var moduleNumber = 0;
  data.parts.forEach(function (part) {
    part.modules.forEach(function (module) {
      moduleNumber += 1;
      module.number = moduleNumber;
    });
  });
}());
