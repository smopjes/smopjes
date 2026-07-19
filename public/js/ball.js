(function () {
  'use strict';

  var statusPill = document.getElementById('status-pill');
  var startBtn = document.getElementById('start-btn');
  var stopBtn = document.getElementById('stop-btn');
  var resetBallBtn = document.getElementById('reset-ball-btn');
  var insecureBanner = document.getElementById('insecure-banner');
  var unsupportedBanner = document.getElementById('unsupported-banner');

  var axEl = document.getElementById('ax');
  var ayEl = document.getElementById('ay');
  var azEl = document.getElementById('az');
  var raEl = document.getElementById('ra');
  var rbEl = document.getElementById('rb');
  var rgEl = document.getElementById('rg');
  var spinRpmEl = document.getElementById('spin-rpm');
  var spinMarker = document.querySelector('#spin-dial .marker');
  var shotSpeedEl = document.getElementById('shot-speed');
  var shotDetailEl = document.getElementById('shot-detail');
  var shotLogEl = document.getElementById('shot-log');

  var maze = document.getElementById('maze');
  var mazeCtx = maze.getContext('2d');
  var graph = document.getElementById('accel-graph');
  var graphCtx = graph.getContext('2d');

  var isSecure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var hasMotion = typeof window.DeviceMotionEvent !== 'undefined';

  if (!isSecure) insecureBanner.classList.remove('hidden');
  if (!hasMotion) unsupportedBanner.classList.remove('hidden');
  if (!isSecure || !hasMotion) startBtn.disabled = true;

  // --- Ball-in-maze physics state ---
  var R = maze.width / 2;
  var ballRadius = 12;
  var ball = { x: R, y: R, vx: 0, vy: 0 };
  var trail = [];
  var TILT_GAIN = 26; // px/s^2 per m/s^2
  var DAMPING = 0.985;

  function resetBall() {
    ball.x = R; ball.y = R; ball.vx = 0; ball.vy = 0;
    trail = [];
  }
  resetBallBtn.addEventListener('click', resetBall);

  function stepMaze(gx, gy, dt) {
    ball.vx += gx * TILT_GAIN * dt;
    ball.vy -= gy * TILT_GAIN * dt;
    ball.vx *= DAMPING;
    ball.vy *= DAMPING;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    var dx = ball.x - R, dy = ball.y - R;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var maxDist = R - ballRadius - 4;
    if (dist > maxDist) {
      var nx = dx / dist, ny = dy / dist;
      ball.x = R + nx * maxDist;
      ball.y = R + ny * maxDist;
      var vDotN = ball.vx * nx + ball.vy * ny;
      ball.vx -= 1.6 * vDotN * nx;
      ball.vy -= 1.6 * vDotN * ny;
    }

    trail.push({ x: ball.x, y: ball.y });
    if (trail.length > 40) trail.shift();
  }

  function drawMaze() {
    mazeCtx.clearRect(0, 0, maze.width, maze.height);

    mazeCtx.strokeStyle = 'rgba(255,255,255,0.15)';
    mazeCtx.lineWidth = 1;
    mazeCtx.beginPath();
    mazeCtx.arc(R, R, R - ballRadius - 4, 0, Math.PI * 2);
    mazeCtx.stroke();

    for (var i = 0; i < trail.length; i++) {
      var p = trail[i];
      var alpha = (i / trail.length) * 0.35;
      mazeCtx.fillStyle = 'rgba(255,179,0,' + alpha.toFixed(2) + ')';
      mazeCtx.beginPath();
      mazeCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      mazeCtx.fill();
    }

    mazeCtx.fillStyle = '#ffb300';
    mazeCtx.beginPath();
    mazeCtx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    mazeCtx.fill();
    mazeCtx.strokeStyle = '#1a1200';
    mazeCtx.lineWidth = 1.5;
    mazeCtx.stroke();
  }

  // --- Acceleration graph ---
  var magHistory = [];
  var MAG_HISTORY_MAX = 120;

  function drawGraph() {
    var w = graph.width, h = graph.height;
    graphCtx.clearRect(0, 0, w, h);
    if (magHistory.length < 2) return;

    var maxMag = 25;
    graphCtx.strokeStyle = '#29b6f6';
    graphCtx.lineWidth = 2;
    graphCtx.beginPath();
    for (var i = 0; i < magHistory.length; i++) {
      var x = (i / (MAG_HISTORY_MAX - 1)) * w;
      var y = h - Math.min(magHistory[i] / maxMag, 1) * h;
      if (i === 0) graphCtx.moveTo(x, y); else graphCtx.lineTo(x, y);
    }
    graphCtx.stroke();
  }

  // --- Shot detection ---
  var SHOT_START = 14;   // m/s^2 linear-accel magnitude to arm a shot
  var SHOT_END = 4;
  var SHOT_MAX_MS = 300;
  var COOLDOWN_MS = 700;

  var shotState = 'idle'; // idle | tracking
  var shotSamples = [];
  var shotStartTime = 0;
  var cooldownUntil = 0;
  var lastRotMagAtShot = 0;
  var lastRotMag = 0;

  function handleShotSample(mag, t, rotMag) {
    if (shotState === 'idle') {
      if (t < cooldownUntil) return;
      if (mag > SHOT_START) {
        shotState = 'tracking';
        shotStartTime = t;
        shotSamples = [{ t: t, mag: mag }];
        lastRotMagAtShot = rotMag;
      }
      return;
    }
    // tracking
    shotSamples.push({ t: t, mag: mag });
    lastRotMagAtShot = Math.max(lastRotMagAtShot, rotMag);
    var elapsed = t - shotStartTime;
    if (mag < SHOT_END || elapsed > SHOT_MAX_MS) {
      finishShot();
    }
  }

  function finishShot() {
    shotState = 'idle';
    cooldownUntil = performance.now() + COOLDOWN_MS;

    var deltaV = 0;
    for (var i = 1; i < shotSamples.length; i++) {
      var dt = (shotSamples[i].t - shotSamples[i - 1].t) / 1000;
      var avgMag = (shotSamples[i].mag + shotSamples[i - 1].mag) / 2;
      deltaV += avgMag * dt;
    }
    var kmh = Math.min(deltaV * 3.6, 180);
    var rpm = lastRotMagAtShot / 6;

    if (kmh < 3) return; // too small to count as a real shot

    shotSpeedEl.textContent = kmh.toFixed(1);
    shotSpeedEl.className = 'speed';
    shotDetailEl.textContent = 'km/u — spin ' + rpm.toFixed(0) + ' rpm (indicatief)';

    var li = document.createElement('li');
    var now = new Date();
    var timeStr = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    li.innerHTML = '<span>' + kmh.toFixed(1) + ' km/u &middot; ' + rpm.toFixed(0) + ' rpm</span><span class="t">' + timeStr + '</span>';
    shotLogEl.insertBefore(li, shotLogEl.firstChild);
    while (shotLogEl.children.length > 5) {
      shotLogEl.removeChild(shotLogEl.lastChild);
    }
  }

  // --- Sensor wiring ---
  var gravityEst = { x: 0, y: 0, z: 0 };
  var lastEventTime = null;
  var spinAngle = 0;
  var running = false;

  function onDeviceMotion(event) {
    var now = performance.now();
    var dt = lastEventTime === null ? 0.016 : (now - lastEventTime) / 1000;
    dt = Math.min(Math.max(dt, 0.001), 0.1);
    lastEventTime = now;

    var g = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
    var rot = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };

    var linear = event.acceleration && (event.acceleration.x || event.acceleration.y || event.acceleration.z)
      ? event.acceleration
      : (function () {
          var lp = 0.8;
          gravityEst.x = lp * gravityEst.x + (1 - lp) * (g.x || 0);
          gravityEst.y = lp * gravityEst.y + (1 - lp) * (g.y || 0);
          gravityEst.z = lp * gravityEst.z + (1 - lp) * (g.z || 0);
          return {
            x: (g.x || 0) - gravityEst.x,
            y: (g.y || 0) - gravityEst.y,
            z: (g.z || 0) - gravityEst.z
          };
        })();

    axEl.textContent = (linear.x || 0).toFixed(1);
    ayEl.textContent = (linear.y || 0).toFixed(1);
    azEl.textContent = (linear.z || 0).toFixed(1);

    var alpha = rot.alpha || 0, beta = rot.beta || 0, gamma = rot.gamma || 0;
    raEl.textContent = alpha.toFixed(0);
    rbEl.textContent = beta.toFixed(0);
    rgEl.textContent = gamma.toFixed(0);

    var rotMag = Math.sqrt(alpha * alpha + beta * beta + gamma * gamma);
    lastRotMag = rotMag;
    var rpm = rotMag / 6;
    spinRpmEl.textContent = rpm.toFixed(0);

    spinAngle = (spinAngle + gamma * dt) % 360;
    if (spinMarker) spinMarker.style.transform = 'rotate(' + spinAngle.toFixed(1) + 'deg)';

    stepMaze(g.x || 0, g.y || 0, dt);

    var linMag = Math.sqrt((linear.x || 0) * (linear.x || 0) + (linear.y || 0) * (linear.y || 0) + (linear.z || 0) * (linear.z || 0));
    magHistory.push(linMag);
    if (magHistory.length > MAG_HISTORY_MAX) magHistory.shift();

    handleShotSample(linMag, now, rotMag);
  }

  function renderLoop() {
    drawMaze();
    drawGraph();
    if (running) requestAnimationFrame(renderLoop);
  }

  function setStatus(text, cls) {
    statusPill.textContent = text;
    statusPill.className = 'status-pill' + (cls ? ' ' + cls : '');
  }

  function startSensors() {
    var needsPermission = typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function';

    var begin = function () {
      window.addEventListener('devicemotion', onDeviceMotion);
      running = true;
      setStatus('✅ Actief', 'active');
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
      requestAnimationFrame(renderLoop);
    };

    if (needsPermission) {
      DeviceMotionEvent.requestPermission().then(function (result) {
        if (result === 'granted') {
          begin();
        } else {
          setStatus('❌ Toestemming geweigerd', 'error');
        }
      }).catch(function () {
        setStatus('❌ Kon geen toestemming vragen', 'error');
      });
    } else {
      begin();
    }
  }

  function stopSensors() {
    window.removeEventListener('devicemotion', onDeviceMotion);
    running = false;
    setStatus('⏸️ Gestopt');
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    lastEventTime = null;
  }

  startBtn.addEventListener('click', startSensors);
  stopBtn.addEventListener('click', stopSensors);

  drawMaze();
  drawGraph();
})();
