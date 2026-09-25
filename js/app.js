(function () {
  "use strict";

  var DATA = window.JF_HANDBOOK_CONTENT;
  var MEDIA = window.JF_HANDBOOK_MEDIA || {};
  var STORAGE_KEY = "jf-handbook-progress-v1";
  var SIMULATOR_STORAGE_KEY = "jf-session-simulator-v1";
  var app = document.getElementById("app");
  var sidebar = document.getElementById("sidebar");
  var sidebarTree = document.getElementById("sidebar-tree");
  var searchInput = document.getElementById("search-input");
  var resetProgress = document.getElementById("reset-progress");
  var mobileMenu = document.getElementById("mobile-menu");
  var sidebarScrim = document.getElementById("sidebar-scrim");
  var toast = document.getElementById("toast");
  var topModuleProgress = document.getElementById("top-module-progress");
  var topModuleTitle = document.getElementById("top-module-title");
  var topModulePercent = document.getElementById("top-module-percent");
  var topModuleBar = document.getElementById("top-module-bar");
  var allModules = [];
  var moduleBySlug = {};
  var searchIndex = [];
  var revealObserver = null;
  var toastTimer = null;
  var simulatorCleanup = null;
  var speechCleanup = null;
  var lastProgressByModule = {};

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  DATA.parts.forEach(function (part) {
    part.modules.forEach(function (module) {
      module.part = part;
      module.number = allModules.length + 1;
      allModules.push(module);
      moduleBySlug[module.slug] = module;
    });
  });

  function defaultState() {
    return { completed: {}, takeaways: {}, quizBest: {}, quizAttempts: {}, viewedClips: {}, clipProgress: {}, practice: {}, responses: {}, games: {}, interactions: {}, celebratedParts: {}, lastSlug: allModules[0].slug };
  }

  function loadState() {
    var fallback = defaultState();
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object") return fallback;
      return {
        completed: saved.completed && typeof saved.completed === "object" ? saved.completed : {},
        takeaways: saved.takeaways && typeof saved.takeaways === "object" ? saved.takeaways : {},
        quizBest: saved.quizBest && typeof saved.quizBest === "object" ? saved.quizBest : {},
        quizAttempts: saved.quizAttempts && typeof saved.quizAttempts === "object" ? saved.quizAttempts : {},
        viewedClips: saved.viewedClips && typeof saved.viewedClips === "object" ? saved.viewedClips : {},
        clipProgress: saved.clipProgress && typeof saved.clipProgress === "object" ? saved.clipProgress : {},
        practice: saved.practice && typeof saved.practice === "object" ? saved.practice : {},
        responses: saved.responses && typeof saved.responses === "object" ? saved.responses : {},
        games: saved.games && typeof saved.games === "object" ? saved.games : {},
        interactions: saved.interactions && typeof saved.interactions === "object" ? saved.interactions : {},
        celebratedParts: saved.celebratedParts && typeof saved.celebratedParts === "object" ? saved.celebratedParts : {},
        lastSlug: moduleBySlug[saved.lastSlug] ? saved.lastSlug : fallback.lastSlug
      };
    } catch (error) {
      return fallback;
    }
  }

  var state = loadState();

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      showToast("Progress could not be saved on this device.");
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function stripHtml(value) {
    var node = document.createElement("div");
    node.innerHTML = value || "";
    return (node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function iconSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  function completionCount() {
    return allModules.filter(function (module) { return state.completed[module.slug] && moduleProgressPercent(module) === 100; }).length;
  }

  function moduleClipIds(module) {
    return moduleLeadFilms(module).map(function (block) { return block.id; });
  }

  function moduleHasQuiz(module) {
    return module.blocks.some(function (block) { return block.type === "quiz"; });
  }

  function moduleHasPractice(module) {
    return module.blocks.some(function (block) { return block.type === "practice" || block.type === "responseExercise"; });
  }

  function moduleHasInteractive(module) {
    return module.blocks.some(function (block) {
      return ["curveExplorer", "stepExplorer", "routeGame", "choiceGame", "intensityLab", "portalSandbox"].indexOf(block.type) >= 0;
    });
  }

  function responseExerciseBlock(module) {
    return module.blocks.find(function (block) { return block.type === "responseExercise"; }) || null;
  }

  function responseExerciseComplete(module) {
    var block = responseExerciseBlock(module);
    if (!block) return Boolean(state.practice[module.slug]);
    var saved = state.responses[module.slug] || {};
    return block.fields.every(function (field) {
      return String(saved[field.key] || "").trim().length >= 8;
    });
  }

  function moduleTakeawayKeys(module) {
    var keys = [];
    module.blocks.forEach(function (block, blockIndex) {
      if (block.type !== "takeaways") return;
      block.items.forEach(function (_, itemIndex) {
        keys.push(blockIndex + "-" + itemIndex);
      });
    });
    return keys;
  }

  function moduleAccordionKeys(module) {
    var keys = [];
    module.blocks.forEach(function (block, blockIndex) {
      if (block.type !== "accordion") return;
      block.items.forEach(function (_, itemIndex) {
        keys.push(blockIndex + "-" + itemIndex);
      });
    });
    return keys;
  }

  function moduleStepKeys(module) {
    var keys = [];
    module.blocks.forEach(function (block, blockIndex) {
      if (block.type !== "steps") return;
      block.items.forEach(function (_, itemIndex) {
        keys.push("step-" + blockIndex + "-" + itemIndex);
      });
    });
    return keys;
  }

  function genericPracticeBlock(module) {
    return module.blocks.find(function (block) { return block.type === "practice"; }) || null;
  }

  function genericPracticeComplete(module) {
    if (!genericPracticeBlock(module)) return false;
    var saved = state.responses[module.slug] || {};
    return String(saved.practice || "").trim().length >= 20;
  }

  function requirementRows(module) {
    var savedTakeaways = state.takeaways[module.slug] || {};
    var savedInteractions = state.interactions[module.slug] || {};
    var clips = moduleClipIds(module);
    var takeaways = moduleTakeawayKeys(module);
    var accordions = moduleAccordionKeys(module);
    var steps = moduleStepKeys(module);
    var rows = [];
    if (clips.length) rows.push({ key: "video", label: clips.length === 1 ? "Watch the full tutorial" : "Watch every tutorial", done: clips.every(function (id) { return state.viewedClips[id]; }) });
    if (moduleHasInteractive(module)) rows.push({ key: "interactive", label: "Finish the interactive activity", done: Boolean(state.games[module.slug]) });
    if (accordions.length) rows.push({ key: "explore", label: "Open every lesson explainer", done: accordions.every(function (key) { return savedInteractions[key]; }) });
    if (steps.length) rows.push({ key: "steps", label: "Open every lesson step", done: steps.every(function (key) { return savedInteractions[key]; }) });
    if (moduleHasPractice(module)) rows.push({ key: "practice", label: responseExerciseBlock(module) ? "Save all three practice responses" : "Save your practice response", done: responseExerciseBlock(module) ? responseExerciseComplete(module) : genericPracticeComplete(module) });
    if (takeaways.length) rows.push({ key: "takeaways", label: "Confirm every key takeaway", done: takeaways.every(function (key) { return savedTakeaways[key]; }) });
    if (moduleHasQuiz(module)) rows.push({ key: "quiz", label: "Score at least 80% on the quiz", done: (Number(state.quizBest[module.slug]) || 0) >= 80 });
    return rows;
  }

  function moduleMissingRequirements(module) {
    var missing = [];
    var lead = moduleLeadFilms(module);
    var unseen = lead.filter(function (clip) { return !state.viewedClips[clip.id]; }).length;
    if (unseen && module.slug !== "v2-software-films") missing.push("watch the film");
    if (module.slug === "v2-software-films" && unseen) missing.push("watch the films, or open Read the lesson after the first few");
    if (moduleHasQuiz(module) && (Number(state.quizBest[module.slug]) || 0) < 80) missing.push("finish the quiz");
    return missing;
  }

  function moduleProgressPercent(module) {
    var scores = [];
    if (moduleHasQuiz(module)) {
      var quizBest = Number(state.quizBest[module.slug]) || 0;
      scores.push(Math.min(100, Math.round((quizBest / 80) * 100)));
    }
    moduleClipIds(module).forEach(function (clipId) { scores.push(state.viewedClips[clipId] ? 100 : 0); });
    if (moduleHasPractice(module)) scores.push((responseExerciseBlock(module) ? responseExerciseComplete(module) : genericPracticeComplete(module)) ? 100 : 0);
    if (moduleHasInteractive(module)) scores.push(state.games[module.slug] ? 100 : 0);
    var interactionKeys = moduleAccordionKeys(module).concat(moduleStepKeys(module));
    if (interactionKeys.length) {
      var savedInteractions = state.interactions[module.slug] || {};
      scores.push(Math.round((interactionKeys.filter(function (key) { return savedInteractions[key]; }).length / interactionKeys.length) * 100));
    }
    var takeawayKeys = moduleTakeawayKeys(module);
    if (takeawayKeys.length) {
      var savedTakeaways = state.takeaways[module.slug] || {};
      var checked = takeawayKeys.filter(function (key) { return savedTakeaways[key]; }).length;
      scores.push(Math.round((checked / takeawayKeys.length) * 100));
    }
    if (!scores.length) return 100;
    return Math.round(scores.reduce(function (total, score) { return total + score; }, 0) / scores.length);
  }

  function overallProgressPercent() {
    var earned = allModules.reduce(function (total, module) { return total + moduleProgressPercent(module); }, 0);
    return Math.round(earned / allModules.length);
  }

  function partCompletion(part) {
    var done = part.modules.filter(function (module) { return state.completed[module.slug] && moduleProgressPercent(module) === 100; }).length;
    var earned = part.modules.reduce(function (total, module) { return total + moduleProgressPercent(module); }, 0);
    return { done: done, total: part.modules.length, percent: Math.round(earned / part.modules.length) };
  }

  function updateProgressUi() {
    var percent = overallProgressPercent();
    document.getElementById("sidebar-progress").textContent = completionCount() + " of " + allModules.length + " complete";
    document.getElementById("sidebar-progress-bar").style.width = percent + "%";
    var sidebarLevel = document.getElementById("sidebar-level");
    if (sidebarLevel) sidebarLevel.textContent = percent + "% of learning checks complete";
    document.querySelectorAll(".tree-module").forEach(function (link) {
      var module = moduleBySlug[link.dataset.slug];
      var modulePercent = moduleProgressPercent(module);
      var done = Boolean(state.completed[module.slug] && modulePercent === 100);
      link.classList.toggle("done", done);
      link.classList.toggle("started", modulePercent > 0 && !done);
      var stateLabel = link.querySelector("[data-tree-state]");
      if (stateLabel) stateLabel.textContent = done ? "Complete" : (modulePercent ? modulePercent + "%" : "Not started");
    });
    document.querySelectorAll("[data-readiness-value]").forEach(function (value) { value.textContent = percent + "%"; });
  }

  function buildSidebar() {
    sidebarTree.innerHTML = DATA.parts.map(function (part) {
      var progress = partCompletion(part);
      return '<details class="tree-part" open>' +
        '<summary class="tree-part-title"><span>' + escapeHtml(part.title) + '</span><small>' + progress.done + '/' + progress.total + '</small><b aria-hidden="true"></b></summary>' +
        '<div class="tree-part-modules">' +
        part.modules.map(function (module) {
          var percent = moduleProgressPercent(module);
          var done = Boolean(state.completed[module.slug] && percent === 100);
          return '<a class="tree-module' + (done ? ' done' : (percent ? ' started' : '')) + '" data-slug="' + module.slug + '" href="#/module/' + module.slug + '">' +
            '<span class="tree-state-icon" aria-hidden="true"></span><span>' + escapeHtml(module.title) + '</span><small data-tree-state>' + (done ? 'Complete' : (percent ? percent + '%' : 'Not started')) + '</small></a>';
        }).join("") +
        '</div></details>';
    }).join("");
    updateProgressUi();
  }

  function plainBlockText(block) {
    if (block.text) return stripHtml(block.text);
    if (block.items) {
      return block.items.map(function (item) {
        if (typeof item === "string") return item;
        return [item.title, item.text, (item.content || []).join(" ")].filter(Boolean).join(" ");
      }).join(" ");
    }
    if (block.rows) return block.rows.reduce(function (out, row) { return out.concat(row); }, []).join(" ");
    if (block.questions) {
      return block.questions.map(function (question) { return question.q + " " + question.options.join(" "); }).join(" ");
    }
    return "";
  }

  function buildSearchIndex() {
    searchIndex = allModules.map(function (module) {
      var body = module.blocks.map(plainBlockText).join(" ");
      return {
        module: module,
        title: module.title,
        summary: module.summary,
        text: (module.title + " " + module.summary + " " + (module.searchAliases || []).join(" ") + " " + body).replace(/\s+/g, " ").trim()
      };
    });
  }

  function setTopModuleProgress(module) {
    if (!topModuleProgress) return;
    if (!module) {
      topModuleProgress.hidden = true;
      return;
    }
    var percent = moduleProgressPercent(module);
    topModuleProgress.hidden = false;
    topModuleTitle.textContent = module.title;
    topModulePercent.textContent = percent + "%";
    topModuleBar.style.width = percent + "%";
  }

  function setActiveNav(mode) {
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      link.classList.toggle("active", link.dataset.nav === mode);
    });
  }

  function setActiveModule(slug) {
    document.querySelectorAll(".tree-module").forEach(function (link) {
      link.classList.toggle("active", link.dataset.slug === slug);
    });
    document.querySelectorAll(".tree-part").forEach(function (part) {
      part.open = Boolean(slug && part.querySelector('.tree-module[data-slug="' + slug + '"]'));
    });
  }

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
    mobileMenu.setAttribute("aria-expanded", "false");
  }

  function renderHome() {
    setTopModuleProgress(null);
    setActiveNav("");
    setActiveModule("");
    var continueModule = allModules.find(function (module) {
      return !(state.completed[module.slug] && moduleProgressPercent(module) === 100);
    }) || allModules[0];
    app.innerHTML = '<section class="home-hero"><div class="hero-layout">' +
      '<h1>Trainer onboarding</h1>' +
      '<p class="lede">Start at Your First Week. Watch the film, then follow the steps under it.</p>' +
      '<aside class="level-panel">' +
        '<h2>' + escapeHtml(continueModule.title) + '</h2>' +
        '<p>' + escapeHtml(continueModule.part.title) + '</p>' +
        '<a class="continue-module" href="#/module/' + continueModule.slug + '">Start here</a>' +
      '</aside>' +
    '</div></section>' +
    '<div class="start-list">' + DATA.parts.map(function (part) {
      var first = part.modules[0];
      return '<a href="#/module/' + first.slug + '"><span><strong>' + escapeHtml(part.title) + '</strong><span>' + part.modules.length + ' lessons</span></span><em>Open</em></a>';
    }).join("") + '</div>';
  }

  function countUp(element, target) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.textContent = target + "%";
      return;
    }
    var start = performance.now();
    var duration = 900;
    function frame(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = Math.round(target * eased) + "%";
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function renderPath() {
    setTopModuleProgress(null);
    setActiveNav("path");
    setActiveModule("");
    var nextModule = allModules.find(function (module) { return !(state.completed[module.slug] && moduleProgressPercent(module) === 100); }) || allModules[allModules.length - 1];
    app.innerHTML = '<section class="path-page"><div class="container">' +
      '<header class="page-title"><h1>Your Training <span class="ice">Path.</span></h1><p>Complete one training day at a time. Only your current day is expanded, while every lesson remains available in Browse Handbook.</p><div class="path-readiness"><span>Overall learning progress</span><strong data-readiness-value>' + overallProgressPercent() + '%</strong></div></header>' +
      '<a class="path-next" href="#/module/' + nextModule.slug + '"><span>Continue your training</span><strong>Module ' + nextModule.number + ': ' + escapeHtml(nextModule.title) + '</strong><small>' + escapeHtml(nextModule.summary) + '</small></a>' +
      DATA.parts.map(function (part) {
        var progress = partCompletion(part);
        var isCurrent = part === nextModule.part;
        return '<details class="path-part path-part-details reveal"' + (isCurrent ? ' open' : '') + '><summary class="path-part-head"><div><h2>' + escapeHtml(part.title) + '</h2><p>' + escapeHtml(part.description) + '</p></div><span class="status-pill' + (progress.done === progress.total ? ' done' : '') + '">' + progress.done + ' of ' + progress.total + '</span><b aria-hidden="true"></b></summary>' +
          '<ol class="path-list">' + part.modules.map(function (module) {
            var moduleProgress = moduleProgressPercent(module);
            return '<li><a href="#/module/' + module.slug + '"><span class="module-num">' + module.number + '</span><span><strong>' + escapeHtml(module.title) + '</strong><small>' + escapeHtml(module.summary) + '</small></span><span class="status-pill' + (moduleProgress === 100 ? ' done' : '') + '">' + moduleProgress + '%</span></a></li>';
          }).join("") + '</ol></details>';
      }).join("") +
    '</div></section>';
    initReveals();
  }

  function renderHandbook(query) {
    setTopModuleProgress(null);
    setActiveNav("handbook");
    setActiveModule("");
    var cleanQuery = (query || "").trim();
    if (searchInput.value !== cleanQuery) searchInput.value = cleanQuery;
    app.innerHTML = '<section class="search-page"><div class="container">' +
      '<header class="page-title"><h1>Browse the <span class="ice">Handbook.</span></h1><p>Use the sidebar tree or search every lesson, script, table, and takeaway. Press / at any time to focus search.</p></header>' +
      (cleanQuery ? renderSearchResults(cleanQuery) : renderBrowseParts()) +
    '</div></section>';
    initReveals();
  }

  function renderBrowseParts() {
    return renderCoreToolsIndex() + '<div class="search-results">' + DATA.parts.map(function (part) {
      return '<section class="path-part reveal"><div class="path-part-head"><div><h2>' + escapeHtml(part.title) + '</h2><p>' + escapeHtml(part.description) + '</p></div></div><ol class="path-list">' +
        part.modules.map(function (module) {
          var moduleProgress = moduleProgressPercent(module);
          return '<li><a href="#/module/' + module.slug + '"><span class="module-num">' + module.number + '</span><span><strong>' + escapeHtml(module.title) + '</strong><small>' + escapeHtml(module.summary) + '</small></span><span class="status-pill' + (moduleProgress === 100 ? ' done' : '') + '">' + moduleProgress + '%</span></a></li>';
        }).join("") + '</ol></section>';
    }).join("") + '</div>';
  }

  function renderCoreToolsIndex() {
    var tools = [
      { label: "Trainer Portal", slug: "trainer-portal", text: "Daily dashboard and the guided synthetic sandbox" },
      { label: "JF Coach", slug: "support-client-jf-app", text: "Appointments, client book, chat, workouts, and app support" },
      { label: "JF Notes", slug: "jf-notes", text: "Client context, tasks, comments, and reminders" },
      { label: "Program Builder", slug: "program-builder", text: "Draft, preview, and publish approved programs" },
      { label: "Booking Links", slug: "booking-links-ipad", text: "Free Session, Kickstart, Strategy, and Gabrielle links" },
      { label: "Square and payments", slug: "selling-the-kickstart", text: "Payment steps after an approved sale" },
      { label: "Accountability Messages", slug: "accountability-messages", text: "Personal weekly client follow-up" },
      { label: "Incident Report", slug: "incident-reporting", text: "Safety response and same-day reporting" }
    ];
    return '<section class="tools-index reveal" aria-labelledby="tools-index-title"><div><h2 id="tools-index-title">Core tools index</h2><p>Start here when you know the tool but not the lesson.</p></div><div class="tools-index-grid">' + tools.map(function (tool) {
      return '<a href="#/module/' + tool.slug + '"><strong>' + escapeHtml(tool.label) + '</strong><span>' + escapeHtml(tool.text) + '</span></a>';
    }).join("") + '</div></section>';
  }

  function rankResults(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return searchIndex.map(function (entry) {
      var title = entry.title.toLowerCase();
      var summary = entry.summary.toLowerCase();
      var text = entry.text.toLowerCase();
      var score = 0;
      terms.forEach(function (term) {
        if (title === term) score += 40;
        if (title.indexOf(term) !== -1) score += 18;
        if (summary.indexOf(term) !== -1) score += 8;
        var matches = text.split(term).length - 1;
        score += Math.min(matches, 12);
      });
      if (text.indexOf(query.toLowerCase()) !== -1) score += 16;
      return { entry: entry, score: score };
    }).filter(function (result) { return result.score > 0; }).sort(function (a, b) {
      return b.score - a.score || a.entry.module.number - b.entry.module.number;
    });
  }

  function makeSnippet(text, query) {
    var lower = text.toLowerCase();
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var index = lower.indexOf(query.toLowerCase());
    if (index < 0) {
      for (var i = 0; i < terms.length; i += 1) {
        index = lower.indexOf(terms[i]);
        if (index >= 0) break;
      }
    }
    if (index < 0) index = 0;
    var start = Math.max(0, index - 90);
    var end = Math.min(text.length, index + 180);
    var snippet = (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "");
    var escaped = escapeHtml(snippet);
    terms.sort(function (a, b) { return b.length - a.length; }).forEach(function (term) {
      var safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      escaped = escaped.replace(new RegExp("(" + safeTerm + ")", "gi"), "<mark>$1</mark>");
    });
    return escaped;
  }

  function renderSearchResults(query) {
    var results = rankResults(query);
    if (!results.length) return '<div class="empty-state">No lesson matched <strong>' + escapeHtml(query) + '</strong>. Try a shorter term or browse the sidebar.</div>';
    return '<div class="section-head"><h2>' + results.length + ' result' + (results.length === 1 ? '' : 's') + ' for <span class="ice">' + escapeHtml(query) + '</span></h2></div><div class="search-results">' +
      results.map(function (result) {
        var module = result.entry.module;
        return '<a class="search-result reveal" href="#/module/' + module.slug + '"><small>Training day ' + module.part.number + ', Module ' + module.number + '</small><h2>' + escapeHtml(module.title) + '</h2><p>' + makeSnippet(result.entry.text, query) + '</p></a>';
      }).join("") + '</div>';
  }

  function moduleSectionId(module, blockIndex) {
    return module.slug + "-section-" + blockIndex;
  }

  function renderLessonGuide(module) {
    var practice = module.blocks.find(function (block) { return block.type === "practice"; });
    var sections = module.blocks.map(function (block, index) {
      return block.type === "heading" ? { label: block.text, id: moduleSectionId(module, index) } : null;
    }).filter(Boolean);
    var tools = module.toolLinks || [];
    return '<details class="lesson-guide">' +
      '<summary class="lesson-guide-summary"><span><strong>Lesson brief</strong><small>Outcome, live tools, and section map</small></span><span aria-hidden="true">+</span></summary>' +
      '<div class="lesson-guide-grid" aria-label="Lesson action guide">' +
        '<div class="lesson-result"><span>Finish this lesson by</span><strong>' + escapeHtml(practice ? practice.title : "Completing the review") + '</strong><p>' + escapeHtml(practice ? practice.prompt : module.summary) + '</p></div>' +
        '<div class="lesson-direct"><span>Open the live tools</span>' +
          (tools.length ? '<div class="tool-links">' + tools.map(function (tool) {
            return '<a href="' + escapeHtml(tool.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(tool.label) + ' <span aria-hidden="true">&#8599;</span></a>';
          }).join("") + '</div>' : '<p>This is a floor or conversation skill. No system link is required.</p>') +
        '</div>' +
        (sections.length ? '<details class="lesson-map"><summary>Jump to a section <span>' + sections.length + '</span></summary><nav aria-label="Sections in this lesson">' + sections.map(function (section) {
          return '<a href="#' + escapeHtml(section.id) + '">' + escapeHtml(section.label) + '</a>';
        }).join("") + '</nav></details>' : '') +
      '</div></details>';
  }

  function renderModuleTracker(module) {
    var rows = requirementRows(module);
    var done = rows.filter(function (row) { return row.done; }).length;
    var percent = moduleProgressPercent(module);
    return '<section class="module-tracker" data-module-tracker aria-label="Module completion requirements">' +
      '<div class="module-tracker-head"><div><span>Lesson checklist</span><strong data-module-progress-value>' + percent + '%</strong></div><small data-module-task-count>' + done + ' of ' + rows.length + ' required actions completed</small></div>' +
      '<div class="module-progress-track" aria-hidden="true"><span data-module-progress-bar style="width:' + percent + '%"></span></div>' +
      '<div class="module-requirements">' + rows.map(function (row) {
        return '<div class="module-requirement' + (row.done ? ' is-done' : '') + '" data-requirement="' + row.key + '"><i aria-hidden="true"></i><span>' + escapeHtml(row.label) + '</span><strong>' + (row.done ? 'Done' : 'To do') + '</strong></div>';
      }).join("") + '</div></section>';
  }

  function renderModule(slug, options) {
    if (simulatorCleanup) {
      simulatorCleanup();
      simulatorCleanup = null;
    }
    var module = moduleBySlug[slug];
    if (!module) {
      location.hash = "#/";
      return;
    }
    state.lastSlug = slug;
    saveState();
    setActiveNav("path");
    setActiveModule(slug);
    var index = allModules.indexOf(module);
    var previous = allModules[index - 1];
    var next = allModules[index + 1];
    var completed = Boolean(state.completed[slug] && moduleProgressPercent(module) === 100);
    var missingRequirements = moduleMissingRequirements(module);
    var completionCopy = completed
      ? "You can revisit this lesson any time."
      : (missingRequirements.length ? "Before completion: " + missingRequirements.join(", ") + "." : "Every learning check is complete. You can lock in this module.");

    lastProgressByModule[slug] = moduleProgressPercent(module);
    setTopModuleProgress(module);
    var films = moduleLeadFilms(module);
    var rest = module.blocks.filter(function (block) { return block.type !== "clipSlot"; });
    var filmHtml = films.map(function (block) { return renderClipSlot(block, ""); }).join("");
    var restHtml = rest.map(function (block, blockIndex) { return renderBlock(block, module, blockIndex); }).join("");
    app.innerHTML = '<article class="module-page"><div class="narrow">' +
      '<header class="module-header"><div class="module-meta"><span>' + escapeHtml(module.part.title) + '</span></div><h1>' + escapeHtml(module.title) + '</h1><p class="module-summary">' + escapeHtml(module.summary) + '</p></header>' +
      filmHtml +
      (restHtml ? '<div class="module-content">' + restHtml + '</div>' : '') +
      '<footer class="module-footer"><button class="btn-ice complete-btn' + (completed ? ' done' : '') + '" type="button" data-complete="' + slug + '">' + (completed ? 'Done' : 'Mark done') + '</button>' +
      '<nav class="module-pagination" aria-label="Module navigation">' +
        (previous ? '<a href="#/module/' + previous.slug + '">Back</a>' : '<a href="#/">Home</a>') +
        (next ? '<a class="next" href="#/module/' + next.slug + '">Next: ' + escapeHtml(next.title) + '</a>' : '<a class="next" href="#/">Home</a>') +
      '</nav></footer>' +
    '</div></article>';

    bindModuleInteractions(module);
    initReveals();
    var activeLink = sidebar.querySelector('.tree-module[data-slug="' + slug + '"]');
    if (activeLink) activeLink.scrollIntoView({ block: "nearest" });
    if (options && options.play) {
      requestAnimationFrame(function () {
        var simulator = document.getElementById("session-simulator");
        if (simulator) simulator.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      });
    }
  }

  function headlineWithIce(title) {
    return escapeHtml(title);
  }

  function clipPoster(file) {
    return mediaUrl("posters/" + file.replace(/\.mp4$/i, ".webp"));
  }

  function mediaUrl(file, version) {
    var encoded = String(file || "").split("/").map(encodeURIComponent).join("/");
    return "media/" + encoded;
  }

  // Only lessons that have no clip of their own. A wrong film is worse than no film.
  var MODULE_FILMS = {
    "your-first-week": { id: "clip-film-01", title: "My Training setup. The gym induction is in the steps under this film." },
    "one-on-ones-with-gabrielle": { id: "clip-film-10", title: "Booking links. Open 1:1 with Gabrielle." },
    "client-journey": { id: "clip-film-11", title: "Free-session outcome" },
    "retention-mastery": { id: "clip-film-08", title: "Retention tab. The conversation is in the notes under the film." }
  };

  function moduleLeadFilms(module) {
    var own = module.blocks.filter(function (block) { return block.type === "clipSlot"; });
    if (own.length) return own;
    var mapped = MODULE_FILMS[module.slug];
    return mapped ? [{ type: "clipSlot", id: mapped.id, title: mapped.title }] : [];
  }

  function narrationBlockText(block) {
    if (!block || ["quiz", "clipSlot", "sessionSimulator"].indexOf(block.type) >= 0) return "";
    if (block.audioText) return block.audioText;
    var pieces = [];
    if (block.text) pieces.push(block.text);
    if (block.title) pieces.push(block.title);
    if (block.intro) pieces.push(block.intro);
    if (block.prompt) pieces.push(block.prompt);
    if (block.proof) pieces.push(block.proof);
    if (Array.isArray(block.items)) {
      block.items.forEach(function (item) {
        if (typeof item === "string") pieces.push(item);
        else pieces = pieces.concat([item.title || "", item.text || ""], item.content || []);
      });
    }
    if (Array.isArray(block.steps)) block.steps.forEach(function (item) { pieces.push(item.title || "", item.text || ""); });
    if (Array.isArray(block.stages)) block.stages.forEach(function (item) { pieces.push(item.title || "", item.text || ""); });
    return pieces.filter(Boolean).join(". ");
  }

  function lessonAudioTranscript(module) {
    var practiceText = module.blocks.filter(function (block) {
      return block.type === "practice" || block.type === "responseExercise";
    }).map(narrationBlockText);
    var takeawayText = module.blocks.filter(function (block) { return block.type === "takeaways"; }).map(narrationBlockText);
    return [module.title, module.summary].concat(practiceText, ["Key takeaways."], takeawayText)
      .filter(Boolean).join(". ").replace(/\s+/g, " ").replace(/[<>]/g, "").slice(0, 2200);
  }

  function demoPlanText(clipId) {
    return {
      "clip-program-builder": "Program Builder on the live portal. Search, pick the demo client, read Ongoing context, then stop before publish.",
      "clip-jf-notes": "JF Notes isolated demo board. Open the right card. Facts and next step, not a personality label.",
      "clip-accountability-messages": "Portal weekly messages. Four types, seven-day lock, read the week before you type. Send is shown, not tapped.",
      "clip-booking-links": "Post Free Session, Kickstart Strategy, and 1:1 with Gabrielle. Ongoing PT is Add appointment in JF Coach.",
      "clip-jf-coach-trainer-home": "My Training white V2 app. Let's set you up, then Strong on What do you want to work on.",
      "clip-jf-coach-client-book": "Jordan Demo Open app, Training, Lower Body Strength preview. Start session is a live write, so this film stops at Preview.",
      "clip-jf-coach-trainer-messaging": "Everyday JF Coach chat. Draft the line. Do not send in the film.",
      "clip-jf-coach-add-appointment": "Add to schedule, 1on1 types, then Cancel. Select appointments with Reschedule selected and Cancel selected. Book session is not tapped.",
      "clip-jf-coach-reschedule-cancel": "The same appointment film: add sheet, then select mode for reschedule and cancel. 12 hour policy is spoken on that screen.",
      "clip-retention-tab": "Retention tile for Jordan Demo. Overdue program, missing photos, the setup miss list after Kickstart.",
      "clip-jf-app-health-score": "My Training Challenge and Habits. Health Score, My Day, today's challenge.",
      "clip-support-client-jf-app": "Ongoing setup on Jordan Demo V2: Habits, Food, Progress. Booking is the Schedule film. Publish is the Programs film.",
      "clip-free-session-flow": "Session Notes dry run. Pick Not interested, write objections, do not submit a live client.",
      "clip-21-day-onboarding-overview": "What you still check on their phone after they self-onboard: habits, food, photos.",
      "clip-square-payment": "Real Square Point of Sale. 21 Day Kickstart at 99 dollars 99, customer on the sale, Tap to Pay. Charge is not taken. Customer names are blurred.",
      "clip-bug-button": "Portal bug button, bottom left. Stay on the page. Do not send JF Coach app crashes here.",
      "clip-team-meetings": "More, Team Meetings. Watch the recording you missed. Go live when you can."
    }[clipId] || "";
  }

  function renderClipSlot(block, cls) {
    var media = MEDIA[block.id];
    if (!media || !media.file) {
      return '<section class="clip-player clip-unavailable ' + cls + '"><p>No film for this lesson yet. Read the notes below.</p></section>';
    }
    var src = mediaUrl(media.file, media.version);
    return '<section class="clip-player film-card is-ready ' + cls + '" data-clip-id="' + escapeHtml(block.id) + '">' +
      '<div class="clip-media"><video controls playsinline preload="metadata" src="' + src + '" aria-label="' + escapeHtml(block.title || "") + '"></video></div>' +
      '<p>' + escapeHtml(block.title || "Watch this") + '</p>' +
    '</section>';
  }

  function renderStepExplorer(block, cls) {
    return '<section class="learning-lab ' + cls + '" data-explorer><header><h2>' + escapeHtml(block.title) + '</h2><p class="lab-summary">' + escapeHtml(block.intro) + '</p></header><div class="explorer-tabs" role="tablist">' +
      block.steps.map(function (step, index) { return '<button class="explorer-tab" type="button" role="tab" aria-selected="' + (index === 0) + '" data-explorer-step="' + index + '">' + escapeHtml(step.label) + '</button>'; }).join("") +
      '</div><div class="explorer-stage">' + block.steps.map(function (step, index) { return '<section role="tabpanel" data-explorer-panel="' + index + '"' + (index ? ' hidden' : '') + '><strong>' + escapeHtml(step.title) + '</strong><p>' + escapeHtml(step.text) + '</p></section>'; }).join("") + '</div><p class="lab-status" data-lab-status aria-live="polite">Explore every stage to complete this activity.</p></section>';
  }

  function renderCurveExplorer(block, cls) {
    return '<section class="learning-lab curve-lab ' + cls + '" data-explorer><header><h2>' + escapeHtml(block.title) + '</h2><p class="lab-summary">' + escapeHtml(block.intro) + '</p></header><div class="explorer-tabs curve-tabs" role="tablist">' +
      block.stages.map(function (stage, index) { return '<button class="explorer-tab curve-point" type="button" role="tab" aria-selected="' + (index === 0) + '" data-explorer-step="' + index + '">' + escapeHtml(stage.label) + '</button>'; }).join("") +
      '</div><div class="explorer-stage">' + block.stages.map(function (stage, index) { return '<section role="tabpanel" data-explorer-panel="' + index + '"' + (index ? ' hidden' : '') + '><strong>' + escapeHtml(stage.title) + '</strong><p>' + escapeHtml(stage.text) + '</p></section>'; }).join("") + '</div><p class="lab-status" data-lab-status aria-live="polite">Explore every stage to complete this activity.</p></section>';
  }

  function renderRouteGame(block, cls) {
    return '<section class="learning-lab route-game ' + cls + '" data-route-game><header><h2>' + escapeHtml(block.title) + '</h2><p class="lab-summary">' + escapeHtml(block.intro) + '</p></header><div class="route-list">' +
      block.items.map(function (item, itemIndex) {
        return '<div class="route-item" data-route-item="' + itemIndex + '" data-correct="' + item.answer + '"><strong>' + escapeHtml(item.prompt) + '</strong><div role="group" aria-label="Choose owner for ' + escapeHtml(item.prompt) + '">' +
          block.categories.map(function (category, categoryIndex) { return '<button class="route-button" type="button" data-route-answer="' + categoryIndex + '">' + escapeHtml(category) + '</button>'; }).join("") +
          '</div><p class="lab-feedback" data-route-feedback data-copy="' + escapeHtml(item.feedback) + '" aria-live="polite"></p></div>';
      }).join("") +
      '</div><p class="lab-status" data-lab-status aria-live="polite">Route every item correctly to complete the drill.</p></section>';
  }

  function renderChoiceGame(block, cls) {
    return '<section class="learning-lab choice-game ' + cls + '" data-choice-game><header><h2>' + escapeHtml(block.title) + '</h2><p class="lab-summary">' + escapeHtml(block.intro) + '</p></header><div class="choice-list">' +
      block.rounds.map(function (round, roundIndex) {
        return '<div class="choice-round" data-choice-round="' + roundIndex + '" data-correct="' + round.answer + '"><strong>' + (roundIndex + 1) + '. ' + escapeHtml(round.prompt) + '</strong><div>' +
          round.options.map(function (option, optionIndex) { return '<button class="choice-button" type="button" data-choice-answer="' + optionIndex + '">' + escapeHtml(option) + '</button>'; }).join("") +
          '</div><p class="lab-feedback" data-choice-feedback data-copy="' + escapeHtml(round.feedback) + '" aria-live="polite"></p></div>';
      }).join("") +
      '</div><p class="lab-status" data-lab-status aria-live="polite">Complete every decision to finish the scenario.</p></section>';
  }

  function renderIntensityLab(block, cls) {
    return '<section class="learning-lab intensity-lab ' + cls + '" data-intensity-lab><header><h2>' + escapeHtml(block.title) + '</h2><p class="lab-summary">' + escapeHtml(block.intro) + '</p></header><div class="intensity-controls"><label>Client answer<select data-intensity-answer><option value="">Choose one</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><label>Exercise type<select data-exercise-type><option value="">Choose one</option><option value="accessory">Accessory movement</option><option value="compound">Demanding compound</option><option value="squat-rdl">Squat or RDL</option></select></label></div><div class="intensity-result" data-intensity-result aria-live="polite">Choose both inputs to compare the safe next action.</div></section>';
  }

  function renderPortalSandbox(block, cls) {
    return '<section class="portal-sandbox ' + cls + '" data-portal-sandbox><header><div><span class="sandbox-label">Training sandbox</span><h2>' + escapeHtml(block.title) + '</h2><p>' + escapeHtml(block.intro) + '</p></div><strong>FAKE DATA</strong></header>' +
      '<div class="sandbox-shell"><nav class="sandbox-nav" aria-label="Sandbox tools">' +
        '<button type="button" class="active" data-sandbox-view="home">Home</button><button type="button" data-sandbox-view="clients">Clients</button><button type="button" data-sandbox-view="notes">JF Notes</button><button type="button" data-sandbox-view="programs">Programs</button><button type="button" data-sandbox-view="messages">Messages</button><button type="button" data-sandbox-view="booking">Booking Links</button>' +
      '</nav><div class="sandbox-workspace">' +
        '<section data-sandbox-panel="home"><div class="sandbox-screen-head"><div><small>Demo Trainer Sam</small><h3>Today at Richmond</h3></div><span>3 fake clients</span></div><div class="sandbox-home-grid"><article><strong>Next appointment</strong><h4>Mia Harper</h4><p>5:30 pm, Kickstart 2 of 3</p><button type="button" data-sandbox-jump="clients">Open fake client</button></article><article><strong>Shift checks</strong><ul><li>Confirm trainer identity</li><li>Review client context</li><li>Check bookings and tasks</li></ul></article></div></section>' +
        '<section data-sandbox-panel="clients" hidden><div class="sandbox-screen-head"><div><small>Client book</small><h3>Choose the correct fake client</h3></div></div><div class="sandbox-client-grid"><button type="button" data-sandbox-client="mia"><strong>Mia Harper</strong><span>Kickstart, goal: feel stronger</span></button><button type="button" data-sandbox-client="dylan"><strong>Dylan Nguyen</strong><span>Ongoing, goal: train consistently</span></button><button type="button" data-sandbox-client="priya"><strong>Priya Shah</strong><span>Ongoing, goal: improve confidence</span></button></div><div class="sandbox-client-detail" data-sandbox-client-detail><p>Select a fake client to inspect their stage and next action.</p></div></section>' +
        '<section data-sandbox-panel="notes" hidden><div class="sandbox-screen-head"><div><small>JF Notes</small><h3>Draft useful context</h3></div><span>Mia Harper, fake client</span></div><label for="sandbox-note">Training note</label><textarea id="sandbox-note" rows="4">Kickstart session 2 complete. Mia felt more confident with the goblet squat. Next action: confirm solo workout before session 3.</textarea><button type="button" data-sandbox-save="note">Save local practice note</button><p class="sandbox-result" data-sandbox-result="note">Nothing has been saved or sent.</p></section>' +
        '<section data-sandbox-panel="programs" hidden><div class="sandbox-screen-head"><div><small>Program Builder</small><h3>Preview before publish</h3></div><span>Mia Harper, fake client</span></div><div class="sandbox-fields"><label>Program type<select data-sandbox-program-type><option value="">Choose one</option><option value="kickstart">Kickstart support</option><option value="ongoing">Ongoing strength</option></select></label><label>Start date<input type="date" value="2026-08-03" data-sandbox-program-date></label></div><button type="button" data-sandbox-save="program">Build preview</button><div class="sandbox-program-preview" data-sandbox-result="program">Choose a program type, then build a local preview. Publish is intentionally unavailable.</div></section>' +
        '<section data-sandbox-panel="messages" hidden><div class="sandbox-screen-head"><div><small>Accountability Messages</small><h3>Make the check-in personal</h3></div><span>Mia Harper, fake client</span></div><label for="sandbox-message">Practice message</label><textarea id="sandbox-message" rows="4">Hi Mia, how did the solo workout feel after the squat practice we did together?</textarea><button type="button" data-sandbox-save="message">Save practice draft</button><p class="sandbox-result" data-sandbox-result="message">This sandbox cannot send messages.</p></section>' +
        '<section data-sandbox-panel="booking" hidden><div class="sandbox-screen-head"><div><small>Booking Links</small><h3>Match the link to the completed stage</h3></div></div><div class="sandbox-booking-grid"><button type="button" data-sandbox-booking="free"><strong>Free Session link</strong><span>Use after a Free Session.</span></button><button type="button" data-sandbox-booking="kickstart"><strong>Kickstart link</strong><span>Use after a Kickstart.</span></button><button type="button" data-sandbox-booking="gabrielle"><strong>Gabrielle 1:1 link</strong><span>Use the live link in the portal.</span></button></div><p class="sandbox-result" data-sandbox-result="booking">Choose a link to practise the handoff. No booking will be made.</p></section>' +
      '</div></div><footer><p data-lab-status aria-live="polite">Complete the five safe practice actions: client, note, program preview, message draft, and booking link.</p><span>Local only. No live connection.</span></footer></section>';
  }

  function renderResponseExercise(block, module, cls) {
    var saved = state.responses[module.slug] || {};
    return '<section class="response-exercise ' + cls + '" data-response-exercise><header><span>Written practice</span><h2>' + escapeHtml(block.title) + '</h2><p>' + escapeHtml(block.intro) + '</p></header><div class="response-fields">' + block.fields.map(function (field) {
      return '<label><span>' + escapeHtml(field.label) + '</span><textarea rows="3" data-response-key="' + escapeHtml(field.key) + '" aria-describedby="hint-' + escapeHtml(module.slug + '-' + field.key) + '">' + escapeHtml(saved[field.key] || "") + '</textarea><small id="hint-' + escapeHtml(module.slug + '-' + field.key) + '">' + escapeHtml(field.hint) + '</small></label>';
    }).join("") + '</div><div class="response-actions"><button class="btn-outline" type="button" data-save-responses>Save training responses</button><span data-response-status aria-live="polite">' + (responseExerciseComplete(module) ? 'Saved on this device.' : 'Complete all three responses to finish this practice.') + '</span></div><aside><strong>Optional future design note</strong><p>' + escapeHtml(block.note) + '</p></aside></section>';
  }

  function renderObjectionGame(block, cls) {
    return '<section class="objection-game ' + cls + '" data-objection-game><header><div><span>Optional practice</span><h2>' + escapeHtml(block.title) + '</h2><p>' + escapeHtml(block.intro) + '</p></div><strong data-objection-score>0/10</strong></header><div class="objection-thread" data-objection-thread><p class="client-line"><b>Fake client, Jordan:</b> I like the idea, but I do not know if I can fit this in right now.</p></div><div class="objection-choices" data-objection-choices></div><footer><button type="button" data-objection-reset>Start again</button><span data-objection-status>Choose the response that keeps the conversation honest and useful.</span></footer></section>';
  }

  function renderPractice(block, module, cls) {
    var complete = genericPracticeComplete(module);
    var saved = state.responses[module.slug] || {};
    return '<section class="practice-card ' + cls + '" data-practice-card><header><span>Practice task</span><h2>' + escapeHtml(block.title) + '</h2><p>' + escapeHtml(block.prompt) + '</p><small><strong>What good looks like:</strong> ' + escapeHtml(block.proof) + '</small></header><label><span>Your response</span><textarea rows="4" data-practice-response placeholder="Write the specific action, decision, or result here.">' + escapeHtml(saved.practice || "") + '</textarea><small>Use at least 20 characters. This stays on this device as training progress.</small></label><div class="practice-actions"><button class="btn-outline practice-button' + (complete ? ' is-done' : '') + '" type="button" data-save-practice>' + (complete ? 'Update saved response' : 'Save practice response') + '</button><span data-practice-status aria-live="polite">' + (complete ? 'Saved and counted toward this lesson.' : 'A specific response is required before this practice is complete.') + '</span></div></section>';
  }

  function renderBlock(block, module, blockIndex) {
    var cls = "content-block reveal";
    if (block.type === "heading") return '<h2 id="' + escapeHtml(moduleSectionId(module, blockIndex)) + '" class="content-heading ' + cls + '">' + headlineWithIce(block.text) + '</h2>';
    if (block.type === "prose") return '<p class="content-prose ' + cls + '">' + escapeHtml(block.text) + '</p>';
    if (block.type === "list") return '<ul class="content-list ' + cls + '">' + block.items.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join("") + '</ul>';
    if (block.type === "callout") return '<aside class="callout ' + (block.tone || '') + ' ' + cls + '"><strong>' + escapeHtml(block.title) + '</strong><p>' + escapeHtml(block.text) + '</p></aside>';
    if (block.type === "script") return '<blockquote class="quote-script ' + cls + '"><strong>' + escapeHtml(block.title) + '</strong><p>' + escapeHtml(block.text).replace(/\n/g, "<br>") + '</p></blockquote>';
    if (block.type === "table") return '<div class="table-wrap ' + cls + '"><table class="data-table"><thead><tr>' + block.headers.map(function (header) { return '<th>' + escapeHtml(header) + '</th>'; }).join("") + '</tr></thead><tbody>' + block.rows.map(function (row) { return '<tr>' + row.map(function (cell) { return '<td>' + escapeHtml(cell) + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>';
    if (block.type === "steps") return '<div class="step-rail ' + cls + '">' + block.items.map(function (item, index) { return '<details class="step-row" data-step-key="step-' + blockIndex + '-' + index + '"><summary><span class="step-num">' + String(index + 1).padStart(2, "0") + '</span><h3>' + escapeHtml(item.title) + '</h3><b aria-hidden="true"></b></summary><div class="step-copy"><p>' + escapeHtml(item.text) + '</p></div></details>'; }).join("") + '</div>';
    if (block.type === "accordion") return '<div class="accordion ' + cls + '">' + block.items.map(function (item, index) { var id = module.slug + '-accordion-' + index; return '<section class="accordion-item"><button class="accordion-button" type="button" aria-expanded="false" aria-controls="' + id + '" data-interaction-key="' + blockIndex + '-' + index + '"><span>' + escapeHtml(item.title) + '</span><span aria-hidden="true">+</span></button><div class="accordion-panel" id="' + id + '">' + item.content.map(function (paragraph) { return '<p>' + escapeHtml(paragraph) + '</p>'; }).join("") + '</div></section>'; }).join("") + '</div>';
    if (block.type === "clipSlot") return renderClipSlot(block, cls);
    if (block.type === "sessionSimulator") return renderSessionSimulator(cls);
    if (block.type === "stepExplorer") return renderStepExplorer(block, cls);
    if (block.type === "curveExplorer") return renderCurveExplorer(block, cls);
    if (block.type === "routeGame") return renderRouteGame(block, cls);
    if (block.type === "choiceGame") return renderChoiceGame(block, cls);
    if (block.type === "intensityLab") return renderIntensityLab(block, cls);
    if (block.type === "portalSandbox") return renderPortalSandbox(block, cls);
    if (block.type === "responseExercise") return renderResponseExercise(block, module, cls);
    if (block.type === "objectionGame") return renderObjectionGame(block, cls);
    if (block.type === "portrait") return '<figure class="lesson-portrait ' + cls + '"><img src="' + escapeHtml(block.src) + '" alt="' + escapeHtml(block.alt) + '"><figcaption><strong>' + escapeHtml(block.title) + '</strong><p>' + escapeHtml(block.text) + '</p></figcaption></figure>';
    if (block.type === "practice") return renderPractice(block, module, cls);
    if (block.type === "takeaways") {
      var saved = state.takeaways[module.slug] || {};
      return '<section class="takeaways ' + cls + '"><h2>Key <span class="ice">takeaways.</span></h2><div class="takeaway-list">' + block.items.map(function (item, index) {
        var key = blockIndex + '-' + index;
        return '<label class="takeaway-item"><input type="checkbox" data-takeaway="' + key + '"' + (saved[key] ? ' checked' : '') + '><span>' + escapeHtml(item) + '</span></label>';
      }).join("") + '</div></section>';
    }
    if (block.type === "quiz") {
      var best = Number(state.quizBest[module.slug]) || 0;
      var attempts = state.quizAttempts[module.slug] || {};
      return '<section class="quiz-card ' + cls + '" data-module-quiz data-total="' + block.questions.length + '"><div class="quiz-head"><div><h2>Test the <span class="ice">decision.</span></h2><p>Choose what you would do in the real situation. If a choice is wrong, read the feedback and try again.</p></div><div class="quiz-score" aria-live="polite"><span>Best score</span><strong data-quiz-score>' + best + '%</strong><small data-quiz-progress>0 of ' + block.questions.length + ' correct</small></div></div>' + block.questions.map(function (question, questionIndex) {
        return '<div class="quiz-question" data-question="' + questionIndex + '" data-answered="false"><p>' + (questionIndex + 1) + '. ' + escapeHtml(question.q) + '</p><div class="quiz-options">' + question.options.map(function (option, optionIndex) { return '<button class="quiz-option" type="button" data-answer="' + optionIndex + '" data-correct="' + question.answer + '">' + escapeHtml(option) + '</button>'; }).join("") + '</div><p class="quiz-feedback" aria-live="polite" data-feedback="' + questionIndex + '" data-copy="' + escapeHtml(question.feedback) + '"></p><small class="quiz-attempts" data-question-attempts>Attempts: ' + (Number(attempts[questionIndex]) || 0) + '</small></div>';
      }).join("") + '<button class="quiz-retry" type="button" data-retry-quiz' + (best ? '' : ' hidden') + '>Try the quiz again</button></section>';
    }
    return "";
  }

  function renderSessionSimulator(cls) {
    return '<section id="session-simulator" class="session-simulator ' + cls + '" data-session-simulator>' +
      '<header class="sim-header"><div><h2>Session Simulator</h2><p>Watch every rep, handle the client moments, then enter the count you kept in your head.</p></div>' +
      '<div class="sim-career"><span>Current streak</span><strong id="sim-streak">0</strong><small>Best: <b id="sim-best">0</b></small></div></header>' +
      '<div class="sim-difficulty" role="group" aria-label="Simulator difficulty"><button class="sim-level active" type="button" data-sim-level="rookie"><strong>Rookie</strong><span>Steady tempo</span></button><button class="sim-level" type="button" data-sim-level="pro"><strong>Floor Ready</strong><span>More variation</span></button><button class="sim-level" type="button" data-sim-level="gameplan"><strong>Game Plan</strong><span>Fast and busy</span></button></div>' +
      '<div class="sim-stage" aria-label="Rep simulation area"><div class="sim-stage-top"><span id="sim-status">Choose a level and start the round.</span><strong id="sim-clock">Ready</strong></div>' +
      '<div class="sim-floor"><div class="sim-client" id="sim-client" aria-hidden="true"><span class="sim-head"></span><span class="sim-body"></span><span class="sim-bar"><i></i><i></i></span></div><div class="sim-rep-signal" id="sim-rep-signal" hidden>REP</div><div class="sim-focus-copy"><strong>Keep the count in your head</strong><span>Do not let the prompts steal it.</span></div></div>' +
      '<div class="sim-timer" aria-hidden="true"><span id="sim-timer-bar"></span></div>' +
      '<div class="sim-prompt" id="sim-prompt" hidden><div><span id="sim-prompt-type">Cue check</span><strong id="sim-prompt-copy"></strong></div><div class="sim-answers" id="sim-answers"></div><p id="sim-prompt-feedback" aria-live="polite"></p></div></div>' +
      '<div class="sim-control-row"><button class="btn-ice sim-start" id="sim-start" type="button">Start round</button><p>Keyboard: use 1, 2, or 3 for prompts. Press Enter to submit your rep count.</p></div>' +
      '<form class="sim-count-panel" id="sim-count-panel" hidden><label for="sim-count-input">How many reps did the client complete?</label><div><input id="sim-count-input" type="number" inputmode="numeric" min="0" max="99" required autocomplete="off"><button class="btn-ice" type="submit">Lock in count</button></div></form>' +
      '<div class="sim-result" id="sim-result" hidden aria-live="polite"></div>' +
      '<div class="sim-rules"><strong>Scoring</strong><span>70 points for count accuracy</span><span>30 points for cue and client-question handling</span><span>80 or more keeps your streak alive</span></div>' +
    '</section>';
  }

  function loadSimulatorStats() {
    try {
      var saved = JSON.parse(localStorage.getItem(SIMULATOR_STORAGE_KEY));
      if (!saved || typeof saved !== "object") throw new Error("Invalid simulator data");
      return {
        streak: Number(saved.streak) || 0,
        rounds: Number(saved.rounds) || 0,
        best: saved.best && typeof saved.best === "object" ? saved.best : {}
      };
    } catch (error) {
      return { streak: 0, rounds: 0, best: {} };
    }
  }

  function saveSimulatorStats(stats) {
    try {
      localStorage.setItem(SIMULATOR_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      showToast("Simulator scores could not be saved on this device.");
    }
  }

  function initSessionSimulator() {
    var simulator = app.querySelector("[data-session-simulator]");
    if (!simulator) return function () {};

    var levels = {
      rookie: { label: "Rookie", duration: 18000, tempo: 1180, variance: .12, distraction: 4300 },
      pro: { label: "Floor Ready", duration: 22000, tempo: 930, variance: .25, distraction: 3200 },
      gameplan: { label: "Game Plan", duration: 25000, tempo: 740, variance: .36, distraction: 2300 }
    };
    var moments = [
      { type: "Cue check", prompt: "The client's knees drift inward on the squat.", options: ["Push your knees out", "Move faster", "Hold your breath"], correct: 0 },
      { type: "Cue check", prompt: "The client rounds forward during the row.", options: ["Chest up", "Look at your feet", "Lock your knees"], correct: 0 },
      { type: "Cue check", prompt: "The client loses control on the lowering phase.", options: ["Slow the way down", "Add weight", "Close your eyes"], correct: 0 },
      { type: "Client question", prompt: "Should I feel sharp pain here?", options: ["Keep going", "Stop and check it", "Ignore it for one set"], correct: 1 },
      { type: "Client question", prompt: "Can we make this a little easier?", options: ["Adjust it now", "No, finish at all costs", "Skip every remaining set"], correct: 0 },
      { type: "Client question", prompt: "Am I breathing properly?", options: ["Keep breathing through the reps", "Hold every breath", "Only breathe at the end"], correct: 0 },
      { type: "Encouragement", prompt: "Effort rises with three reps left.", options: ["Strong finish, Sarah", "Good job good job good job", "Say nothing and walk away"], correct: 0 }
    ];
    var stats = loadSimulatorStats();
    var selectedLevel = "rookie";
    var running = false;
    var repCount = 0;
    var handled = 0;
    var correct = 0;
    var endAt = 0;
    var promptActive = null;
    var timers = [];
    var clockInterval = null;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var startButton = simulator.querySelector("#sim-start");
    var client = simulator.querySelector("#sim-client");
    var repSignal = simulator.querySelector("#sim-rep-signal");
    var status = simulator.querySelector("#sim-status");
    var clock = simulator.querySelector("#sim-clock");
    var timerBar = simulator.querySelector("#sim-timer-bar");
    var prompt = simulator.querySelector("#sim-prompt");
    var promptType = simulator.querySelector("#sim-prompt-type");
    var promptCopy = simulator.querySelector("#sim-prompt-copy");
    var answers = simulator.querySelector("#sim-answers");
    var promptFeedback = simulator.querySelector("#sim-prompt-feedback");
    var countPanel = simulator.querySelector("#sim-count-panel");
    var countInput = simulator.querySelector("#sim-count-input");
    var result = simulator.querySelector("#sim-result");

    function schedule(callback, delay) {
      var id = setTimeout(callback, delay);
      timers.push(id);
      return id;
    }

    function clearRoundTimers() {
      timers.forEach(clearTimeout);
      timers = [];
      clearInterval(clockInterval);
      clockInterval = null;
    }

    function updateStatsUi() {
      simulator.querySelector("#sim-streak").textContent = stats.streak;
      simulator.querySelector("#sim-best").textContent = Number(stats.best[selectedLevel]) || 0;
    }

    function pulseRep() {
      if (!running) return;
      repCount += 1;
      repSignal.hidden = false;
      client.classList.remove("is-repping");
      void client.offsetWidth;
      client.classList.add("is-repping");
      schedule(function () {
        client.classList.remove("is-repping");
        repSignal.hidden = true;
      }, reducedMotion ? 150 : 360);
    }

    function scheduleNextRep() {
      if (!running) return;
      var config = levels[selectedLevel];
      var multiplier = 1 + ((Math.random() * 2 - 1) * config.variance);
      var delay = Math.round(config.tempo * multiplier);
      if (Date.now() + delay >= endAt) return;
      schedule(function () {
        pulseRep();
        scheduleNextRep();
      }, delay);
    }

    function answerPrompt(index) {
      if (!running || !promptActive) return;
      var buttons = answers.querySelectorAll("button");
      buttons.forEach(function (button) { button.disabled = true; });
      if (index === promptActive.correct) {
        correct += 1;
        buttons[index].classList.add("correct");
        promptFeedback.textContent = "Good call. Keep counting.";
      } else {
        buttons[index].classList.add("incorrect");
        buttons[promptActive.correct].classList.add("correct");
        promptFeedback.textContent = "Missed it. Reset your focus and keep the count.";
      }
      promptActive = null;
      schedule(function () {
        if (!running) return;
        prompt.hidden = true;
        promptFeedback.textContent = "";
      }, 680);
    }

    function showMoment() {
      if (!running || promptActive) return;
      promptActive = moments[Math.floor(Math.random() * moments.length)];
      handled += 1;
      promptType.textContent = promptActive.type;
      promptCopy.textContent = promptActive.prompt;
      promptFeedback.textContent = "";
      answers.innerHTML = promptActive.options.map(function (option, index) {
        return '<button type="button" data-sim-answer="' + index + '"><kbd>' + (index + 1) + '</kbd><span>' + escapeHtml(option) + '</span></button>';
      }).join("");
      prompt.hidden = false;
    }

    function scheduleNextMoment() {
      if (!running) return;
      var config = levels[selectedLevel];
      var delay = Math.round(config.distraction * (.78 + Math.random() * .44));
      if (Date.now() + delay >= endAt - 900) return;
      schedule(function () {
        showMoment();
        scheduleNextMoment();
      }, delay);
    }

    function updateClock() {
      var config = levels[selectedLevel];
      var remaining = Math.max(0, endAt - Date.now());
      var seconds = Math.ceil(remaining / 1000);
      clock.textContent = seconds + "s";
      timerBar.style.transform = "scaleX(" + Math.max(0, remaining / config.duration) + ")";
    }

    function finishRound() {
      if (!running) return;
      running = false;
      clearRoundTimers();
      client.classList.remove("is-repping");
      repSignal.hidden = true;
      prompt.hidden = true;
      promptActive = null;
      clock.textContent = "Count it";
      timerBar.style.transform = "scaleX(0)";
      status.textContent = "Round complete. Lock in the rep count you kept in your head.";
      startButton.disabled = false;
      startButton.textContent = "Run another round";
      simulator.querySelectorAll("[data-sim-level]").forEach(function (button) { button.disabled = false; });
      countPanel.hidden = false;
      countInput.value = "";
      countInput.focus();
    }

    function startRound() {
      clearRoundTimers();
      running = true;
      repCount = 0;
      handled = 0;
      correct = 0;
      promptActive = null;
      var config = levels[selectedLevel];
      endAt = Date.now() + config.duration;
      result.hidden = true;
      result.innerHTML = "";
      countPanel.hidden = true;
      prompt.hidden = true;
      startButton.disabled = true;
      startButton.textContent = "Round in progress";
      simulator.querySelectorAll("[data-sim-level]").forEach(function (button) { button.disabled = true; });
      status.textContent = config.label + " round. Watch every full rep.";
      timerBar.style.transform = "scaleX(1)";
      updateClock();
      pulseRep();
      scheduleNextRep();
      scheduleNextMoment();
      clockInterval = setInterval(updateClock, 100);
      schedule(finishRound, config.duration);
    }

    function submitCount(event) {
      event.preventDefault();
      var guess = Number(countInput.value);
      if (!Number.isFinite(guess) || guess < 0) return;
      var difference = Math.abs(guess - repCount);
      var countPoints = Math.max(0, 70 - difference * 10);
      var handlingPoints = handled ? Math.round((correct / handled) * 30) : 30;
      var total = countPoints + handlingPoints;
      var keptStreak = total >= 80;
      stats.streak = keptStreak ? stats.streak + 1 : 0;
      stats.rounds += 1;
      stats.best[selectedLevel] = Math.max(Number(stats.best[selectedLevel]) || 0, total);
      saveSimulatorStats(stats);
      updateStatsUi();
      countPanel.hidden = true;
      result.hidden = false;
      result.innerHTML = '<div class="sim-score"><strong>' + total + '</strong><span>out of 100</span></div><div class="sim-result-copy"><h3>' + (keptStreak ? 'Streak secured.' : 'Reset and go again.') + '</h3><p>You entered <b>' + guess + '</b>. The client completed <b>' + repCount + '</b> reps. You handled <b>' + correct + ' of ' + handled + '</b> distractions correctly.</p><div class="sim-score-split"><span>Count accuracy <b>' + countPoints + '/70</b></span><span>Distraction handling <b>' + handlingPoints + '/30</b></span></div></div>';
      status.textContent = "Score locked. Review it, then take another round.";
    }

    function handleSimulatorClick(event) {
      var levelButton = event.target.closest("[data-sim-level]");
      if (levelButton && !running) {
        selectedLevel = levelButton.dataset.simLevel;
        simulator.querySelectorAll("[data-sim-level]").forEach(function (button) { button.classList.toggle("active", button === levelButton); });
        updateStatsUi();
        status.textContent = levels[selectedLevel].label + " selected. Start when you are ready.";
        return;
      }
      var answerButton = event.target.closest("[data-sim-answer]");
      if (answerButton) answerPrompt(Number(answerButton.dataset.simAnswer));
    }

    function handleSimulatorKeydown(event) {
      if (running && promptActive && /^[1-3]$/.test(event.key)) {
        event.preventDefault();
        answerPrompt(Number(event.key) - 1);
      }
    }

    simulator.addEventListener("click", handleSimulatorClick);
    document.addEventListener("keydown", handleSimulatorKeydown);
    startButton.addEventListener("click", startRound);
    countPanel.addEventListener("submit", submitCount);
    updateStatsUi();

    return function () {
      running = false;
      clearRoundTimers();
      simulator.removeEventListener("click", handleSimulatorClick);
      document.removeEventListener("keydown", handleSimulatorKeydown);
    };
  }

  function initClipPlayers(module) {
    app.querySelectorAll("[data-clip-id]").forEach(function (player) {
      var video = player.querySelector("video");
      var clipId = player.dataset.clipId;
      if (!video || !clipId) return;
      function markViewed() {
        if (state.viewedClips[clipId]) return;
        state.viewedClips[clipId] = true;
        saveState();
        refreshModuleProgress(module);
      }
      video.addEventListener("play", markViewed);
      video.addEventListener("ended", markViewed);
    });
  }

  function refreshModuleProgress(module) {
    var percent = moduleProgressPercent(module);
    var rows = requirementRows(module);
    var value = app.querySelector("[data-module-progress-value]");
    var bar = app.querySelector("[data-module-progress-bar]");
    var count = app.querySelector("[data-module-task-count]");
    if (value) value.textContent = percent + "%";
    if (bar) bar.style.width = percent + "%";
    if (count) count.textContent = rows.filter(function (row) { return row.done; }).length + " of " + rows.length + " required actions completed";
    setTopModuleProgress(module);
    rows.forEach(function (row) {
      var element = app.querySelector('[data-requirement="' + row.key + '"]');
      if (!element) return;
      element.classList.toggle("is-done", row.done);
      element.querySelector("strong").textContent = row.done ? "Done" : "To do";
    });
    var completeButton = app.querySelector("[data-complete]");
    if (completeButton) completeButton.disabled = false;
    buildSidebar();
    setActiveModule(module.slug);
    if (percent === 100 && lastProgressByModule[module.slug] < 100) celebrate("module", "Module learning checks complete");
    lastProgressByModule[module.slug] = percent;
  }

  function celebrate(kind, title) {
    var celebration = document.createElement("div");
    celebration.className = "celebration celebration-" + kind;
    celebration.setAttribute("role", "status");
    celebration.innerHTML = '<div class="celebration-burst" aria-hidden="true">' + Array(18).fill("<i></i>").join("") + '</div><div class="celebration-card"><span aria-hidden="true">' + (kind === "part" ? "&#9733;" : "&#10003;") + '</span><strong>' + escapeHtml(title) + '</strong><small>' + (kind === "part" ? "You finished a full training day." : "You can now complete this module.") + '</small></div>';
    document.body.appendChild(celebration);
    requestAnimationFrame(function () { celebration.classList.add("show"); });
    setTimeout(function () {
      celebration.classList.remove("show");
      setTimeout(function () { celebration.remove(); }, 300);
    }, kind === "part" ? 3800 : 2400);
  }

  function completeLearningActivity(module) {
    if (state.games[module.slug]) return;
    state.games[module.slug] = true;
    saveState();
    refreshModuleProgress(module);
    showToast("Activity complete.");
  }

  function initTranscripts() {
    app.querySelectorAll("[data-transcript-src]").forEach(function (details) {
      details.addEventListener("toggle", function () {
        if (!details.open || details.dataset.loaded === "true") return;
        var target = details.querySelector("[data-transcript-copy]");
        target.textContent = "Loading transcript...";
        fetch(details.dataset.transcriptSrc).then(function (response) {
          if (!response.ok) throw new Error("Transcript unavailable");
          return response.text();
        }).then(function (vtt) {
          var previous = "";
          var lines = vtt.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(function (line) {
            return line && line !== "WEBVTT" && !/^\d+$/.test(line) && !/-->/.test(line) && !/^NOTE\b/.test(line);
          }).map(function (line) {
            var clean = line.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
            if (clean === previous) return "";
            previous = clean;
            return clean;
          }).filter(Boolean);
          target.textContent = lines.join(" ");
          details.dataset.loaded = "true";
        }).catch(function () {
          target.textContent = "The transcript could not be loaded. Captions remain available in the video player.";
        });
      });
    });
  }

  function initLessonAudio(module) {
    var audio = app.querySelector("[data-lesson-audio]");
    var speed = app.querySelector("[data-audio-speed]");
    var status = app.querySelector("[data-listen-status]");
    var toggle = app.querySelector("[data-audio-toggle]");
    var scrub = app.querySelector("[data-audio-scrub]");
    var time = app.querySelector("[data-audio-time]");
    if (!audio || !status) return;

    function formatAudioTime(value) {
      if (!Number.isFinite(value)) return "0:00";
      var minutes = Math.floor(value / 60);
      var seconds = Math.floor(value % 60);
      return minutes + ":" + String(seconds).padStart(2, "0");
    }

    function syncAudioControls() {
      if (toggle) {
        toggle.textContent = audio.paused ? "Play" : "Pause";
        toggle.setAttribute("aria-label", audio.paused ? "Play lesson audio" : "Pause lesson audio");
      }
      if (time) time.textContent = formatAudioTime(audio.currentTime) + " / " + formatAudioTime(audio.duration);
      if (scrub && Number.isFinite(audio.duration) && audio.duration > 0) scrub.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    }

    if (toggle) toggle.addEventListener("click", function () {
      if (audio.paused) audio.play().catch(function () { status.textContent = "Audio could not start. Try again or use the transcript."; });
      else audio.pause();
    });
    if (scrub) scrub.addEventListener("input", function () {
      if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = (Number(scrub.value) / 1000) * audio.duration;
    });
    if (speed) speed.addEventListener("change", function () {
      audio.playbackRate = Math.min(2, Math.max(0.75, Number(speed.value) || 1));
    });
    audio.addEventListener("loadedmetadata", syncAudioControls);
    audio.addEventListener("timeupdate", syncAudioControls);
    audio.addEventListener("play", syncAudioControls);
    audio.addEventListener("pause", syncAudioControls);
    audio.addEventListener("ended", syncAudioControls);
    audio.addEventListener("error", function () {
      var wrapper = audio.closest(".lesson-audio");
      if (wrapper) wrapper.classList.add("audio-unavailable");
      status.textContent = "Lesson narration is being regenerated. Use the written lesson for now.";
    });
    syncAudioControls();
    speechCleanup = function () { audio.pause(); };
  }

  function initLearningLabs(module) {
    app.querySelectorAll("[data-portal-sandbox]").forEach(function (sandbox) {
      var tasks = {};
      var status = sandbox.querySelector("[data-lab-status]");
      var clientCopy = {
        mia: "<strong>Mia Harper</strong><p>Kickstart 2 of 3. Goal: feel stronger. Next action: confirm the solo workout before session 3.</p>",
        dylan: "<strong>Dylan Nguyen</strong><p>Ongoing. Goal: train consistently. Next action: review the next four weeks of appointments.</p>",
        priya: "<strong>Priya Shah</strong><p>Ongoing. Goal: improve confidence. Next action: personalise this week's accountability message.</p>"
      };

      function updateSandboxStatus() {
        var complete = ["client", "note", "program", "message", "booking"].filter(function (key) { return tasks[key]; }).length;
        if (state.games[module.slug] || complete === 5) {
          status.textContent = "Sandbox complete. All five practice actions stayed local.";
          if (complete === 5) completeLearningActivity(module);
        } else {
          status.textContent = complete + " of 5 safe practice actions complete.";
        }
      }

      function showSandboxView(view) {
        sandbox.querySelectorAll("[data-sandbox-view]").forEach(function (button) {
          button.classList.toggle("active", button.dataset.sandboxView === view);
        });
        sandbox.querySelectorAll("[data-sandbox-panel]").forEach(function (panel) {
          panel.hidden = panel.dataset.sandboxPanel !== view;
        });
      }

      sandbox.querySelectorAll("[data-sandbox-view]").forEach(function (button) {
        button.addEventListener("click", function () { showSandboxView(button.dataset.sandboxView); });
      });
      sandbox.querySelectorAll("[data-sandbox-jump]").forEach(function (button) {
        button.addEventListener("click", function () { showSandboxView(button.dataset.sandboxJump); });
      });
      sandbox.querySelectorAll("[data-sandbox-client]").forEach(function (button) {
        button.addEventListener("click", function () {
          sandbox.querySelectorAll("[data-sandbox-client]").forEach(function (candidate) { candidate.classList.toggle("selected", candidate === button); });
          sandbox.querySelector("[data-sandbox-client-detail]").innerHTML = clientCopy[button.dataset.sandboxClient];
          tasks.client = true;
          updateSandboxStatus();
        });
      });
      sandbox.querySelectorAll("[data-sandbox-save]").forEach(function (button) {
        button.addEventListener("click", function () {
          var kind = button.dataset.sandboxSave;
          var result = sandbox.querySelector('[data-sandbox-result="' + kind + '"]');
          if (kind === "note") {
            var note = sandbox.querySelector("#sandbox-note").value.trim();
            if (note.length < 20) {
              result.textContent = "Add useful context and a next action before saving.";
              return;
            }
            result.textContent = "Practice note saved inside this page only. Nothing was sent.";
          }
          if (kind === "program") {
            var type = sandbox.querySelector("[data-sandbox-program-type]").value;
            if (!type) {
              result.textContent = "Choose a program type before building the preview.";
              return;
            }
            result.innerHTML = "<strong>Preview ready</strong><p>Fake client: Mia Harper. Type: " + escapeHtml(type === "kickstart" ? "Kickstart support" : "Ongoing strength") + ". Start: 3 August 2026. Publish remains unavailable.</p>";
          }
          if (kind === "message") {
            var message = sandbox.querySelector("#sandbox-message").value.trim();
            if (message.length < 20) {
              result.textContent = "Add one specific goal, action, or recent conversation.";
              return;
            }
            result.textContent = "Practice draft saved inside this page only. This sandbox cannot send messages.";
          }
          tasks[kind] = true;
          updateSandboxStatus();
        });
      });
      sandbox.querySelectorAll("[data-sandbox-booking]").forEach(function (button) {
        button.addEventListener("click", function () {
          sandbox.querySelectorAll("[data-sandbox-booking]").forEach(function (candidate) { candidate.classList.toggle("selected", candidate === button); });
          var copy = {
            free: "Free Session link selected. Use it after a Free Session.",
            kickstart: "Kickstart link selected. Use it after a Kickstart.",
            gabrielle: "Gabrielle 1:1 link selected. Always open the current live link from the Trainer Portal."
          };
          sandbox.querySelector('[data-sandbox-result="booking"]').textContent = copy[button.dataset.sandboxBooking] + " No booking was made.";
          tasks.booking = true;
          updateSandboxStatus();
        });
      });
      updateSandboxStatus();
    });

    app.querySelectorAll("[data-objection-game]").forEach(function (game) {
      var rounds = [
        {
          client: "I like the idea, but I do not know if I can fit this in right now.",
          options: [
            { text: "What part feels hardest to fit in right now?", points: 3, trainer: "That makes sense. What part feels hardest to fit in right now?", reply: "Mostly the schedule. I work late three nights." },
            { text: "Everyone is busy, so you just need to prioritise it.", points: 0, trainer: "Everyone is busy, so you just need to prioritise it.", reply: "That does not really solve my week." },
            { text: "No problem, we can talk later.", points: 1, trainer: "No problem, we can talk later.", reply: "Okay, but I am still unsure what would work." }
          ]
        },
        {
          client: "Mostly the schedule. I work late three nights.",
          options: [
            { text: "Let us map the two days you could realistically train.", points: 3, trainer: "Let us map the two days you could realistically train.", reply: "Tuesday morning and Saturday could work." },
            { text: "The program needs three sessions, no exceptions.", points: 0, trainer: "The program needs three sessions, no exceptions.", reply: "Then it probably is not for me." },
            { text: "Could you wake up earlier every day?", points: 1, trainer: "Could you wake up earlier every day?", reply: "Not every day. Two mornings might be possible." }
          ]
        },
        {
          client: "Tuesday morning and Saturday could work.",
          options: [
            { text: "Good. Shall we use those two times and book the next step?", points: 4, trainer: "Good. Shall we use those two times and book the next step?", reply: "Yes, that feels realistic." },
            { text: "Great, I will book whatever is available.", points: 1, trainer: "Great, I will book whatever is available.", reply: "I need to check the times first." },
            { text: "Perfect, so there is no objection anymore.", points: 0, trainer: "Perfect, so there is no objection anymore.", reply: "I would still like to decide calmly." }
          ]
        }
      ];
      var roundIndex = 0;
      var score = 0;
      var thread = game.querySelector("[data-objection-thread]");
      var choices = game.querySelector("[data-objection-choices]");
      var scoreNode = game.querySelector("[data-objection-score]");
      var gameStatus = game.querySelector("[data-objection-status]");

      function showObjectionRound() {
        choices.innerHTML = rounds[roundIndex].options.map(function (option, index) {
          return '<button type="button" data-objection-choice="' + index + '">' + escapeHtml(option.text) + '</button>';
        }).join("");
      }

      choices.addEventListener("click", function (event) {
        var button = event.target.closest("[data-objection-choice]");
        if (!button) return;
        var option = rounds[roundIndex].options[Number(button.dataset.objectionChoice)];
        score += option.points;
        thread.innerHTML += '<p class="trainer-line"><b>You:</b> ' + escapeHtml(option.trainer) + '</p><p class="client-line"><b>Fake client, Jordan:</b> ' + escapeHtml(option.reply) + '</p>';
        roundIndex += 1;
        scoreNode.textContent = score + "/10";
        if (roundIndex === rounds.length) {
          choices.innerHTML = "";
          gameStatus.textContent = score === 10 ? "10 out of 10. You clarified the concern, matched the real week, and asked for a clear next step." : score + " out of 10. Review where the response judged, assumed, or skipped the next step, then try again.";
          return;
        }
        gameStatus.textContent = option.points >= 3 ? "Useful response. Keep listening." : "The conversation moved on, but there is a stronger response available.";
        showObjectionRound();
      });

      game.querySelector("[data-objection-reset]").addEventListener("click", function () {
        roundIndex = 0;
        score = 0;
        scoreNode.textContent = "0/10";
        thread.innerHTML = '<p class="client-line"><b>Fake client, Jordan:</b> I like the idea, but I do not know if I can fit this in right now.</p>';
        gameStatus.textContent = "Choose the response that keeps the conversation honest and useful.";
        showObjectionRound();
      });
      showObjectionRound();
    });

    app.querySelectorAll("[data-explorer]").forEach(function (explorer) {
      var visited = { "0": true };
      var buttons = Array.prototype.slice.call(explorer.querySelectorAll("[data-explorer-step]"));
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var index = button.dataset.explorerStep;
          visited[index] = true;
          buttons.forEach(function (candidate) {
            candidate.setAttribute("aria-selected", String(candidate === button));
          });
          explorer.querySelectorAll("[data-explorer-panel]").forEach(function (panel) {
            panel.hidden = panel.dataset.explorerPanel !== index;
          });
          var count = Object.keys(visited).length;
          var status = explorer.querySelector("[data-lab-status]");
          status.textContent = count === buttons.length ? "Every stage explored. Activity complete." : count + " of " + buttons.length + " stages explored.";
          if (count === buttons.length) completeLearningActivity(module);
        });
      });
    });

    app.querySelectorAll("[data-route-game]").forEach(function (game) {
      game.addEventListener("click", function (event) {
        var button = event.target.closest("[data-route-answer]");
        if (!button) return;
        var item = button.closest("[data-route-item]");
        if (item.dataset.solved === "true") return;
        var correct = Number(item.dataset.correct);
        var chosen = Number(button.dataset.routeAnswer);
        var feedback = item.querySelector("[data-route-feedback]");
        if (chosen === correct) {
          item.dataset.solved = "true";
          item.querySelectorAll("[data-route-answer]").forEach(function (option) { option.disabled = true; });
          button.classList.add("correct");
          feedback.textContent = "Correct. " + feedback.dataset.copy;
        } else {
          button.classList.add("incorrect");
          feedback.textContent = "Try again. Recheck who owns this appointment or decision.";
        }
        var solved = game.querySelectorAll('[data-route-item][data-solved="true"]').length;
        var total = game.querySelectorAll("[data-route-item]").length;
        game.querySelector("[data-lab-status]").textContent = solved === total ? "Every item routed correctly. Drill complete." : solved + " of " + total + " routed correctly.";
        if (solved === total) completeLearningActivity(module);
      });
    });

    app.querySelectorAll("[data-choice-game]").forEach(function (game) {
      game.addEventListener("click", function (event) {
        var button = event.target.closest("[data-choice-answer]");
        if (!button) return;
        var round = button.closest("[data-choice-round]");
        if (round.dataset.solved === "true") return;
        var correct = Number(round.dataset.correct);
        var chosen = Number(button.dataset.choiceAnswer);
        var feedback = round.querySelector("[data-choice-feedback]");
        if (chosen === correct) {
          round.dataset.solved = "true";
          round.querySelectorAll("[data-choice-answer]").forEach(function (option) { option.disabled = true; });
          button.classList.add("correct");
          feedback.textContent = "Correct. " + feedback.dataset.copy;
        } else {
          button.classList.add("incorrect");
          feedback.textContent = "Try again. Choose the action that protects the client and the process.";
        }
        var solved = game.querySelectorAll('[data-choice-round][data-solved="true"]').length;
        var total = game.querySelectorAll("[data-choice-round]").length;
        game.querySelector("[data-lab-status]").textContent = solved === total ? "Every decision complete. Scenario finished." : solved + " of " + total + " decisions complete.";
        if (solved === total) completeLearningActivity(module);
      });
    });

    var intensity = app.querySelector("[data-intensity-lab]");
    if (intensity) {
      var answer = intensity.querySelector("[data-intensity-answer]");
      var exercise = intensity.querySelector("[data-exercise-type]");
      var result = intensity.querySelector("[data-intensity-result]");
      function updateIntensity() {
        if (!answer.value || !exercise.value) {
          result.textContent = "Choose both inputs to compare the safe next action.";
          return;
        }
        var action = {
          easy: "Increase weight or reps while technique is stable.",
          medium: "Make a small increase or hold the load while refining the movement.",
          hard: "Maintain the load, protect technique, and judge whether safe reps remain."
        }[answer.value];
        var rest = exercise.value === "compound" ? "A demanding compound may need 2 to 3 minutes of rest." : "Most rest periods sit around 60 to 90 seconds, adjusted for the person.";
        var safety = exercise.value === "squat-rdl" ? " Do not train squats or RDLs to failure. Keep safe reps in reserve." : " Aim for about 2 to 3 reps in reserve where appropriate.";
        result.innerHTML = "<strong>Next action</strong><p>" + escapeHtml(action + " " + rest + safety) + "</p>";
        completeLearningActivity(module);
      }
      answer.addEventListener("change", updateIntensity);
      exercise.addEventListener("change", updateIntensity);
    }
  }

  function bindModuleInteractions(module) {
    initClipPlayers(module);
    initTranscripts();
    initLessonAudio(module);
    initLearningLabs(module);
    app.querySelectorAll(".accordion-button").forEach(function (button) {
      button.addEventListener("click", function () {
        var expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
        document.getElementById(button.getAttribute("aria-controls")).classList.toggle("open", !expanded);
        if (!expanded && button.dataset.interactionKey) {
          state.interactions[module.slug] = state.interactions[module.slug] || {};
          state.interactions[module.slug][button.dataset.interactionKey] = true;
          saveState();
          refreshModuleProgress(module);
        }
      });
    });

    app.querySelectorAll(".step-row[data-step-key]").forEach(function (step) {
      step.addEventListener("toggle", function () {
        if (!step.open) return;
        state.interactions[module.slug] = state.interactions[module.slug] || {};
        state.interactions[module.slug][step.dataset.stepKey] = true;
        saveState();
        refreshModuleProgress(module);
      });
    });

    app.querySelectorAll("[data-takeaway]").forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        state.takeaways[module.slug] = state.takeaways[module.slug] || {};
        state.takeaways[module.slug][checkbox.dataset.takeaway] = checkbox.checked;
        saveState();
        refreshModuleProgress(module);
      });
    });

    var practiceButton = app.querySelector("[data-save-practice]");
    if (practiceButton) {
      practiceButton.addEventListener("click", function () {
        var field = app.querySelector("[data-practice-response]");
        var response = field ? field.value.trim() : "";
        var status = app.querySelector("[data-practice-status]");
        if (response.length < 20) {
          state.practice[module.slug] = false;
          if (status) status.textContent = "Add a specific response of at least 20 characters.";
          showToast("Add the action, decision, or result before saving.");
          refreshModuleProgress(module);
          return;
        }
        state.responses[module.slug] = state.responses[module.slug] || {};
        state.responses[module.slug].practice = response;
        state.practice[module.slug] = true;
        saveState();
        practiceButton.classList.add("is-done");
        practiceButton.textContent = "Update saved response";
        if (status) status.textContent = "Saved on this device and counted toward this lesson.";
        refreshModuleProgress(module);
        showToast("Practice response saved locally.");
      });
    }

    var responseButton = app.querySelector("[data-save-responses]");
    if (responseButton) {
      responseButton.addEventListener("click", function () {
        state.responses[module.slug] = state.responses[module.slug] || {};
        app.querySelectorAll("[data-response-key]").forEach(function (field) {
          state.responses[module.slug][field.dataset.responseKey] = field.value.trim();
        });
        var responseComplete = responseExerciseComplete(module);
        state.practice[module.slug] = responseComplete;
        saveState();
        app.querySelector("[data-response-status]").textContent = responseComplete
          ? "Saved on this device. All three responses count toward this lesson."
          : "Each response needs a specific example of at least eight characters.";
        refreshModuleProgress(module);
        showToast(responseComplete ? "Training responses saved locally." : "Add a specific example in every box.");
      });
    }

    app.querySelectorAll(".quiz-option").forEach(function (button) {
      button.addEventListener("click", function () {
        var question = button.closest(".quiz-question");
        if (question.dataset.answered === "true") return;
        var quiz = button.closest("[data-module-quiz]");
        var correct = Number(button.dataset.correct);
        var chosen = Number(button.dataset.answer);
        var questionIndex = question.dataset.question;
        state.quizAttempts[module.slug] = state.quizAttempts[module.slug] || {};
        state.quizAttempts[module.slug][questionIndex] = (Number(state.quizAttempts[module.slug][questionIndex]) || 0) + 1;
        saveState();
        question.querySelector("[data-question-attempts]").textContent = "Attempts: " + state.quizAttempts[module.slug][questionIndex];
        var feedback = question.querySelector(".quiz-feedback");
        if (chosen !== correct) {
          button.classList.add("incorrect");
          button.disabled = true;
          feedback.textContent = "Not quite. Read the situation again and choose another response.";
          return;
        }
        question.dataset.answered = "true";
        question.dataset.wasCorrect = "true";
        question.querySelectorAll(".quiz-option").forEach(function (option) {
          option.disabled = true;
          if (Number(option.dataset.answer) === correct) option.classList.add("correct");
        });
        feedback.textContent = "Correct. " + feedback.dataset.copy;

        var answered = quiz.querySelectorAll('.quiz-question[data-answered="true"]').length;
        var total = Number(quiz.dataset.total);
        quiz.querySelector("[data-quiz-progress]").textContent = answered + " of " + total + " correct";
        if (answered === total) {
          state.quizBest[module.slug] = 100;
          saveState();
          quiz.querySelector("[data-quiz-score]").textContent = "100%";
          quiz.querySelector("[data-quiz-progress]").textContent = "Every answer correct";
          quiz.querySelector("[data-retry-quiz]").hidden = false;
          refreshModuleProgress(module);
          showToast("Quiz complete. Every decision is correct.");
        }
      });
    });

    var retryQuiz = app.querySelector("[data-retry-quiz]");
    if (retryQuiz) retryQuiz.addEventListener("click", function () { renderModule(module.slug); });

    var completeButton = app.querySelector("[data-complete]");
    if (completeButton) completeButton.addEventListener("click", function () {
      var slug = completeButton.dataset.complete;
      if (!state.completed[slug]) {
        var missing = moduleMissingRequirements(module);
        if (missing.length) {
          showToast("Still to do: " + missing.join(", "));
          return;
        }
      }
      state.completed[slug] = !state.completed[slug];
      saveState();
      var finishedPart = state.completed[slug] && module.part.modules.every(function (item) {
        return state.completed[item.slug] && moduleProgressPercent(item) === 100;
      });
      if (finishedPart && !state.celebratedParts[module.part.id]) {
        state.celebratedParts[module.part.id] = true;
        saveState();
      }
      buildSidebar();
      renderModule(slug);
      if (finishedPart) celebrate("part", module.part.title + " complete");
      else showToast(state.completed[slug] ? "Module complete." : "Module moved back to in progress.");
    });

    simulatorCleanup = initSessionSimulator();
  }

  function initReveals() {
    if (revealObserver) revealObserver.disconnect();
    var items = Array.prototype.slice.call(app.querySelectorAll(".reveal"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("in"); });
      return;
    }
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px" });
    items.forEach(function (item) { revealObserver.observe(item); });
  }

  function route() {
    closeSidebar();
    if (speechCleanup) {
      speechCleanup();
      speechCleanup = null;
    }
    if (simulatorCleanup) {
      simulatorCleanup();
      simulatorCleanup = null;
    }
    var hash = location.hash || "#/";
    var queryIndex = hash.indexOf("?");
    var path = queryIndex >= 0 ? hash.slice(0, queryIndex) : hash;
    var params = new URLSearchParams(queryIndex >= 0 ? hash.slice(queryIndex + 1) : "");
    document.body.classList.toggle("route-home", path === "#/" || path === "#");
    window.scrollTo(0, 0);
    if (path === "#/" || path === "#") renderHome();
    else if (path === "#/path") renderPath();
    else if (path === "#/handbook") renderHandbook(params.get("q") || "");
    else if (path.indexOf("#/module/") === 0) renderModule(decodeURIComponent(path.slice(9)), { play: params.get("play") === "1" });
    else renderHome();
    requestAnimationFrame(function () {
      app.focus({ preventScroll: true });
      if (params.get("play") !== "1") {
        window.scrollTo(0, 0);
        requestAnimationFrame(function () { window.scrollTo(0, 0); });
        setTimeout(function () { window.scrollTo(0, 0); }, 120);
      }
    });
  }

  searchInput.addEventListener("input", function () {
    var query = searchInput.value.trim();
    if ((location.hash || "").indexOf("#/handbook") !== 0) {
      location.hash = "#/handbook" + (query ? "?q=" + encodeURIComponent(query) : "");
      return;
    }
    var nextHash = "#/handbook" + (query ? "?q=" + encodeURIComponent(query) : "");
    history.replaceState(null, "", nextHash);
    renderHandbook(query);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      var target = event.target;
      if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
        event.preventDefault();
        if (document.body.classList.contains("route-home")) {
          location.hash = "#/handbook";
          setTimeout(function () {
            searchInput.focus();
            searchInput.select();
          }, 0);
          return;
        }
        searchInput.focus();
        searchInput.select();
        if (window.innerWidth <= 820) {
          document.body.classList.add("sidebar-open");
          mobileMenu.setAttribute("aria-expanded", "true");
        }
      }
    }
    if (event.key === "Escape") closeSidebar();
  });

  mobileMenu.addEventListener("click", function () {
    var open = !document.body.classList.contains("sidebar-open");
    document.body.classList.toggle("sidebar-open", open);
    mobileMenu.setAttribute("aria-expanded", String(open));
  });
  sidebarScrim.addEventListener("click", closeSidebar);
  resetProgress.addEventListener("click", function () {
    var confirmed = window.confirm("Reset all handbook progress on this device? Videos, quiz attempts, practice responses, and completion will be cleared.");
    if (!confirmed) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SIMULATOR_STORAGE_KEY);
    } catch (error) {
      showToast("Progress could not be reset on this device.");
      return;
    }
    state = defaultState();
    buildSidebar();
    route();
    showToast("Training progress reset on this device.");
  });
  window.addEventListener("hashchange", route);

  buildSidebar();
  buildSearchIndex();
  route();
}());
