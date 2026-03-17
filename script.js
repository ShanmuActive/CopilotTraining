/* ──────────────────────────────────────────────
   Vehicle Telemetry Dashboard – script.js
   Self-contained scaffold with built-in simulation.
   No server or dependencies required.
   ────────────────────────────────────────────── */

(function () {
"use strict";

// ── Configuration ──

var CONFIG = {
  vehicleIds: ["VEH-1001", "VEH-1002", "VEH-1003", "VEH-1004"],
  updateIntervalMs: 1000,
  staleAfterSeconds: 15,
  offlineAfterSeconds: 60,
  historyLimit: 25,
  maxSpeedKmh: 320,
  minBatteryPct: 0,
  maxBatteryPct: 100,
  lowBatteryThreshold: 20,
  highSpeedThreshold: 120,
  alertLimit: 50
};

// ── Application state ──

var state = {
  vehicles: new Map(),
  history: new Map(),
  alerts: [],
  selectedVehicleId: null
};

// ── DOM references ──

var fleetBody = document.getElementById("fleet-body");
var timelineList = document.getElementById("timeline-list");
var timelineEmpty = document.getElementById("timeline-empty");
var timelineTitle = document.getElementById("timeline-title");
var kpiTotal = document.getElementById("kpi-total");
var kpiOnline = document.getElementById("kpi-online");
var kpiStale = document.getElementById("kpi-stale");
var kpiSpeed = document.getElementById("kpi-speed");
var filterVehicle = document.getElementById("filter-vehicle");
var filterStatus = document.getElementById("filter-status");
var filterLowBattery = document.getElementById("filter-low-battery");
var detailTitle = document.getElementById("detail-title");
var detailEmpty = document.getElementById("detail-empty");
var detailContent = document.getElementById("detail-content");
var detailSpeed = document.getElementById("detail-speed");
var detailBattery = document.getElementById("detail-battery");
var detailBatteryBar = document.getElementById("detail-battery-bar");
var detailLocation = document.getElementById("detail-location");
var detailStatus = document.getElementById("detail-status");
var detailTime = document.getElementById("detail-time");
var gpsCanvas = document.getElementById("gps-canvas");
var alertList = document.getElementById("alert-list");
var alertCount = document.getElementById("alert-count");
var alertEmpty = document.getElementById("alert-empty");

// ── Helpers ──

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getStatus(lastUpdateIso) {
  var ageSeconds = Math.max(0, (Date.now() - new Date(lastUpdateIso).getTime()) / 1000);
  if (ageSeconds >= CONFIG.offlineAfterSeconds) return "offline";
  if (ageSeconds >= CONFIG.staleAfterSeconds) return "stale";
  return "online";
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

function statusPill(status) {
  var safe = escapeHtml(status);
  return '<span class="pill ' + safe + '">' + safe + "</span>";
}

// ── Validation (mirrors backend contract) ──

function validateEvent(event) {
  if (!event.vehicle_id || typeof event.vehicle_id !== "string") return false;
  if (isNaN(new Date(event.timestamp_utc).getTime())) return false;
  if (typeof event.speed_kmh !== "number" || event.speed_kmh < 0 || event.speed_kmh > CONFIG.maxSpeedKmh) return false;
  if (!Number.isInteger(event.battery_pct) || event.battery_pct < CONFIG.minBatteryPct || event.battery_pct > CONFIG.maxBatteryPct) return false;
  if (typeof event.lat !== "number" || event.lat < -90 || event.lat > 90) return false;
  if (typeof event.lon !== "number" || event.lon < -180 || event.lon > 180) return false;
  return true;
}

// ── Ingest a telemetry event into state ──

function ingestEvent(event) {
  if (!validateEvent(event)) return;

  // Update current vehicle state
  state.vehicles.set(event.vehicle_id, {
    vehicle_id: event.vehicle_id,
    speed_kmh: event.speed_kmh,
    battery_pct: event.battery_pct,
    lat: event.lat,
    lon: event.lon,
    last_update_utc: event.timestamp_utc
  });

  // Append to history ring buffer
  if (!state.history.has(event.vehicle_id)) {
    state.history.set(event.vehicle_id, []);
  }
  var hist = state.history.get(event.vehicle_id);
  hist.push(event);
  if (hist.length > CONFIG.historyLimit) {
    hist.shift();
  }
}

// ── Rendering ──

function getFilteredVehicles() {
  var list = Array.from(state.vehicles.values());
  var search = filterVehicle.value.trim().toLowerCase();
  var statusFilter = filterStatus.value;
  var lowBatOnly = filterLowBattery.checked;

  return list.filter(function (v) {
    if (search && v.vehicle_id.toLowerCase().indexOf(search) === -1) return false;
    if (statusFilter && getStatus(v.last_update_utc) !== statusFilter) return false;
    if (lowBatOnly && v.battery_pct >= CONFIG.lowBatteryThreshold) return false;
    return true;
  });
}

function renderKpis() {
  var list = Array.from(state.vehicles.values());
  var total = list.length;
  var online = 0;
  var staleCount = 0;
  var speedSum = 0;

  for (var i = 0; i < list.length; i++) {
    var s = getStatus(list[i].last_update_utc);
    if (s === "online") online++;
    if (s === "stale") staleCount++;
    speedSum += list[i].speed_kmh;
  }

  kpiTotal.textContent = total;
  kpiOnline.textContent = online;
  kpiStale.textContent = staleCount;
  kpiSpeed.textContent = total ? (speedSum / total).toFixed(1) : "0.0";
}

function batteryBarHtml(pct) {
  var cls = "battery-fill";
  if (pct < CONFIG.lowBatteryThreshold) cls += " low";
  else if (pct < 50) cls += " mid";
  return '<div class="battery-bar"><div class="' + cls + '" style="width:' + pct + '%"></div></div>';
}

function renderFleet() {
  var list = getFilteredVehicles();
  var html = "";

  for (var i = 0; i < list.length; i++) {
    var v = list[i];
    var status = getStatus(v.last_update_utc);
    var cls = state.selectedVehicleId === v.vehicle_id ? "selected" : "";

    var vid = escapeHtml(v.vehicle_id);
    html +=
      '<tr class="' + cls + '" data-vid="' + vid + '">' +
      "<td>" + vid + "</td>" +
      "<td>" + statusPill(status) + "</td>" +
      "<td>" + escapeHtml(v.speed_kmh.toFixed(1)) + "</td>" +
      "<td>" + escapeHtml(v.battery_pct) + "% " + batteryBarHtml(v.battery_pct) + "</td>" +
      "<td>" + escapeHtml(v.lat.toFixed(4)) + ", " + escapeHtml(v.lon.toFixed(4)) + "</td>" +
      "<td>" + escapeHtml(new Date(v.last_update_utc).toLocaleTimeString()) + "</td>" +
      "</tr>";
  }

  fleetBody.innerHTML = html;

  var rows = fleetBody.querySelectorAll("tr");
  for (var j = 0; j < rows.length; j++) {
    rows[j].addEventListener("click", onRowClick);
  }

  renderKpis();
}

function onRowClick(event) {
  var row = event.currentTarget;
  var vid = row.getAttribute("data-vid");
  state.selectedVehicleId = vid;
  renderFleet();
  renderDetail();
  renderTimeline();
  renderGpsTrail();
}

function renderDetail() {
  if (!state.selectedVehicleId || !state.vehicles.has(state.selectedVehicleId)) {
    detailTitle.textContent = "Vehicle Details";
    detailEmpty.classList.remove("hidden");
    detailContent.classList.add("hidden");
    return;
  }

  var v = state.vehicles.get(state.selectedVehicleId);
  var status = getStatus(v.last_update_utc);

  detailTitle.textContent = "Vehicle Details – " + v.vehicle_id;
  detailEmpty.classList.add("hidden");
  detailContent.classList.remove("hidden");

  detailSpeed.textContent = v.speed_kmh.toFixed(1) + " km/h";
  detailBattery.textContent = v.battery_pct + "%";

  detailBatteryBar.style.width = v.battery_pct + "%";
  detailBatteryBar.className = "battery-fill";
  if (v.battery_pct < CONFIG.lowBatteryThreshold) detailBatteryBar.classList.add("low");
  else if (v.battery_pct < 50) detailBatteryBar.classList.add("mid");

  detailLocation.textContent = v.lat.toFixed(6) + ", " + v.lon.toFixed(6);
  detailStatus.innerHTML = statusPill(status);
  detailTime.textContent = new Date(v.last_update_utc).toLocaleTimeString();
}

function renderGpsTrail() {
  var ctx = gpsCanvas.getContext("2d");
  var w = gpsCanvas.width;
  var h = gpsCanvas.height;
  ctx.clearRect(0, 0, w, h);

  if (!state.selectedVehicleId || !state.history.has(state.selectedVehicleId)) return;

  var events = state.history.get(state.selectedVehicleId);
  if (events.length < 2) return;

  var minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  for (var i = 0; i < events.length; i++) {
    if (events[i].lat < minLat) minLat = events[i].lat;
    if (events[i].lat > maxLat) maxLat = events[i].lat;
    if (events[i].lon < minLon) minLon = events[i].lon;
    if (events[i].lon > maxLon) maxLon = events[i].lon;
  }

  var pad = 20;
  var latRange = maxLat - minLat || 0.001;
  var lonRange = maxLon - minLon || 0.001;

  function toX(lon) { return pad + ((lon - minLon) / lonRange) * (w - 2 * pad); }
  function toY(lat) { return h - pad - ((lat - minLat) / latRange) * (h - 2 * pad); }

  ctx.strokeStyle = "#007f5f";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(toX(events[0].lon), toY(events[0].lat));
  for (var j = 1; j < events.length; j++) {
    ctx.lineTo(toX(events[j].lon), toY(events[j].lat));
  }
  ctx.stroke();

  var last = events[events.length - 1];
  ctx.fillStyle = "#c1121f";
  ctx.beginPath();
  ctx.arc(toX(last.lon), toY(last.lat), 5, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = "#007f5f";
  ctx.beginPath();
  ctx.arc(toX(events[0].lon), toY(events[0].lat), 4, 0, 2 * Math.PI);
  ctx.fill();
}

function renderTimeline() {
  if (!state.selectedVehicleId) {
    timelineTitle.textContent = "Vehicle Timeline";
    timelineEmpty.classList.remove("hidden");
    timelineList.innerHTML = "";
    return;
  }

  timelineTitle.textContent = "Vehicle Timeline – " + state.selectedVehicleId;
  timelineEmpty.classList.add("hidden");

  var events = state.history.get(state.selectedVehicleId) || [];
  var html = "";

  for (var i = events.length - 1; i >= 0; i--) {
    var e = events[i];
    html +=
      "<li>" +
      "<strong>" + escapeHtml(new Date(e.timestamp_utc).toLocaleTimeString()) + "</strong>" +
      "<span>Speed " + escapeHtml(e.speed_kmh.toFixed(1)) + " km/h</span>" +
      "<span>Battery " + escapeHtml(e.battery_pct) + "%</span>" +
      "<span>GPS " + escapeHtml(e.lat.toFixed(4)) + ", " + escapeHtml(e.lon.toFixed(4)) + "</span>" +
      "</li>";
  }

  timelineList.innerHTML = html;
}

// ── Alert engine ──

function addAlert(severity, message) {
  state.alerts.unshift({
    severity: severity,
    message: message,
    time: new Date().toLocaleTimeString()
  });
  if (state.alerts.length > CONFIG.alertLimit) {
    state.alerts.pop();
  }
}

function checkAlerts(event) {
  if (event.battery_pct < CONFIG.lowBatteryThreshold) {
    addAlert("critical", event.vehicle_id + " battery low: " + event.battery_pct + "%");
  }
  if (event.speed_kmh > CONFIG.highSpeedThreshold) {
    addAlert("warning", event.vehicle_id + " speed high: " + event.speed_kmh.toFixed(1) + " km/h");
  }
}

function renderAlerts() {
  if (state.alerts.length === 0) {
    alertEmpty.classList.remove("hidden");
    alertList.innerHTML = "";
    alertCount.textContent = "0";
    alertCount.className = "badge zero";
    return;
  }

  alertEmpty.classList.add("hidden");
  alertCount.textContent = state.alerts.length;
  alertCount.className = "badge";

  var html = "";
  for (var i = 0; i < state.alerts.length; i++) {
    var a = state.alerts[i];
    var cls = a.severity === "critical" ? "alert-critical" : a.severity === "warning" ? "alert-warning" : "alert-info";
    html += '<li class="' + cls + '"><strong>' + escapeHtml(a.time) + '</strong> ' + escapeHtml(a.message) + '</li>';
  }
  alertList.innerHTML = html;
}

// ── Built-in telemetry simulator ──

function simulateTick() {
  for (var i = 0; i < CONFIG.vehicleIds.length; i++) {
    var vid = CONFIG.vehicleIds[i];
    var prev = state.vehicles.get(vid);

    // Smooth transitions from previous values when available
    var speed = prev
      ? clamp(prev.speed_kmh + randomRange(-8, 8), 0, 130)
      : randomRange(20, 90);

    var battery = prev
      ? clamp(prev.battery_pct + Math.round(randomRange(-2, 1)), 5, 100)
      : Math.floor(randomRange(40, 100));

    var lat = prev
      ? clamp(prev.lat + randomRange(-0.002, 0.002), -90, 90)
      : 12.9 + randomRange(-0.05, 0.05);

    var lon = prev
      ? clamp(prev.lon + randomRange(-0.002, 0.002), -180, 180)
      : 77.59 + randomRange(-0.05, 0.05);

    var event = {
      vehicle_id: vid,
      timestamp_utc: new Date().toISOString(),
      speed_kmh: Number(speed.toFixed(1)),
      battery_pct: Math.round(battery),
      lat: Number(lat.toFixed(6)),
      lon: Number(lon.toFixed(6))
    };

    ingestEvent(event);
    checkAlerts(event);
  }

  renderFleet();
  renderDetail();
  renderTimeline();
  renderGpsTrail();
  renderAlerts();
}

// ── Filter event listeners ──

filterVehicle.addEventListener("input", renderFleet);
filterStatus.addEventListener("change", renderFleet);
filterLowBattery.addEventListener("change", renderFleet);

// ── Start ──

renderTimeline();
renderDetail();
renderAlerts();
simulateTick();
setInterval(function () {
  try {
    simulateTick();
  } catch (error) {
    console.error("Telemetry tick failed:", error);
  }
}, CONFIG.updateIntervalMs);

})();
