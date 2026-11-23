// N&CV Engineering — site.js
(function () {
  var root = document.documentElement;

  root.classList.add('js');

  // section drawing: builds in construction order once, then one system can be isolated
  var sect = document.querySelector('.sect');
  var dwg = document.getElementById('sect');
  if (sect && dwg) {
    sect.classList.add('build');
    var btns = sect.querySelectorAll('.ly');
    var focus = function (layer) {
      if (!layer || layer === 'all') dwg.removeAttribute('data-focus');
      else dwg.setAttribute('data-focus', layer);
    };
    var setPressed = function (layer) {
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.layer === layer ? 'true' : 'false'); });
    };
    var current = 'all';
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        current = (b.dataset.layer === current) ? 'all' : b.dataset.layer;
        setPressed(current); focus(current);
      });
    });
  }

  // mobile menu
  var btn = document.querySelector('.nav__toggle');
  var list = document.getElementById('nav-list');
  if (btn && list) {
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'ปิดเมนู' : 'เมนู';
    });
    list.addEventListener('click', function (e) {
      if (e.target.closest('a')) { list.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'เมนู'; }
    });
  }

  // project gallery: open full photo in a dialog
  var lb = document.getElementById('lb');
  if (lb && lb.showModal) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb__bar p');
    document.querySelectorAll('.gal__btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var im = b.querySelector('img');
        lbImg.src = b.dataset.full; lbImg.alt = im.alt; lbCap.textContent = im.alt;
        lb.showModal();
      });
    });
    lb.querySelector('.lb__close').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  // forms (quote + job application) -> Web3Forms
  // ใส่ access key ที่ได้จาก web3forms.com ตรงนี้ ฟอร์มทั้งสองจะส่งเข้าอีเมลบริษัท
  var WEB3FORMS_KEY = '';
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var msg = form.querySelector('.form__msg');
    var btn = form.querySelector('button[type=submit]');
    var btnText = btn.textContent;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'form__msg';
      var missing = [];
      form.querySelectorAll('[required]').forEach(function (el) {
        var bad = !el.value.trim();
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad) missing.push(el.dataset.label || el.name);
      });
      if (missing.length) {
        msg.textContent = 'ยังไม่ได้กรอก: ' + missing.join(', ');
        msg.classList.add('err');
        form.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      var tel = form.querySelector('input[type=tel]');
      if (tel && tel.value.replace(/\D/g, '').length < 9) {
        tel.setAttribute('aria-invalid', 'true');
        msg.textContent = 'เบอร์โทรต้องมีอย่างน้อย 9 หลัก';
        msg.classList.add('err'); tel.focus(); return;
      }
      if (form.elements.botcheck && form.elements.botcheck.checked) return;
      if (!WEB3FORMS_KEY) {
        msg.textContent = 'ฟอร์มยังไม่เปิดใช้ ระหว่างนี้โทร 089-023-1676 หรือส่งทาง LINE';
        msg.classList.add('err'); return;
      }
      btn.disabled = true; btn.textContent = 'กำลังส่ง…';
      var data = new FormData(form);
      data.append('access_key', WEB3FORMS_KEY);
      data.append('subject', form.dataset.subject);
      data.append('from_name', 'เว็บไซต์ N&CV Engineering');
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.success) throw new Error(j.message || 'fail');
          form.reset();
          msg.textContent = form.dataset.ok;
          msg.classList.add('ok');
        })
        .catch(function () {
          msg.textContent = 'ส่งไม่สำเร็จเพราะการเชื่อมต่อ โทร 089-023-1676 แทนได้';
          msg.classList.add('err');
        })
        .then(function () { btn.disabled = false; btn.textContent = btnText; });
    });
  });
})();
