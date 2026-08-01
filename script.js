(function () {
  var term = document.getElementById('terminal');
  if (!term) return;

  // Respect reduced-motion preference: skip the typing animation, but still
  // resolve and show the visitor IP.
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PROMPT = 'guest@poor.network:~$ ';

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function typeInto(el, text, speed) {
    return new Promise(function (resolve) {
      var i = 0;
      (function tick() {
        el.textContent = text.slice(0, i);
        if (i++ <= text.length) {
          setTimeout(tick, speed);
        } else {
          resolve();
        }
      })();
    });
  }

  function line(className) {
    var el = document.createElement('div');
    el.className = className;
    return el;
  }

  async function getIP() {
    try {
      var res = await fetch('https://api.ipify.org?format=json');
      var data = await res.json();
      return data.ip;
    } catch (e) {
      return 'unknown';
    }
  }

  async function run() {
    var ip = await getIP();

    var script = [
      { cmd: 'whoami', out: ['cam'] },
      {
        cmd: 'cat bio.txt',
        out: [
          'Network engineer. Info sec. Coffee.'
        ]
      },
      { cmd: 'curl -s ifconfig.me', out: [] }
    ];

    term.textContent = '';

    for (var i = 0; i < script.length; i++) {
      var step = script[i];

      var row = line('line');
      var promptSpan = document.createElement('span');
      promptSpan.className = 'prompt';
      promptSpan.textContent = PROMPT;
      var cmdSpan = document.createElement('span');
      row.appendChild(promptSpan);
      row.appendChild(cmdSpan);
      term.appendChild(row);

      if (reduceMotion) {
        cmdSpan.textContent = step.cmd;
      } else {
        await typeInto(cmdSpan, step.cmd, 35);
        await sleep(200);
      }

      for (var j = 0; j < step.out.length; j++) {
        var out = line('line output');
        out.textContent = step.out[j];
        term.appendChild(out);
      }

      if (!reduceMotion) {
        await sleep(350);
      }
    }

    var thanks = line('line thanks');
    thanks.textContent = 'thanks for visiting ' + ip + '!';
    term.appendChild(thanks);

    var finalRow = line('line');
    var finalPrompt = document.createElement('span');
    finalPrompt.className = 'prompt';
    finalPrompt.textContent = PROMPT;
    var cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '█';
    finalRow.appendChild(finalPrompt);
    finalRow.appendChild(cursor);
    term.appendChild(finalRow);
  }

  document.addEventListener('DOMContentLoaded', run);
})();
