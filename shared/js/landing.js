/* doctornest.ai 랜딩 동작을 바닐라 JS로 옮긴 것.
   원본 React 모듈: LandingHeader · LandingMotion · HeroMotion · ProductShowcase · MarketingPlayback · FaqAccordion · ConsultationForm
   추가: 접수 엔드포인트 전송, 동의 체크, 완료 패널, 트래킹 이벤트, 변형 B 요소(하단 고정 바) */
(function () {
  'use strict';
  var CFG = window.DN_CONFIG || {};
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).get('mock') === '1') {
    CFG = Object.assign({}, CFG, { LEAD_ENDPOINT: '/mock-lead', LEAD_MODE: 'cors' });
  }
  var variant = window.DN_VARIANT || 'a';
  var track = function (name, params) { if (window.dnTrack) window.dnTrack(name, params); };
  var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.querySelector('.landing-module__i9Fx1W__landing');
  if (!root) return;
  var $ = function (sel, el) { return (el || root).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || root).querySelectorAll(sel)); };

  /* ---------- 설정 경고(접수 엔드포인트 미설정) ---------- */
  var note = document.querySelector('.dn-devnote');
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || new URLSearchParams(location.search).get('debug') === '1';
  if (note && isLocal) {
    var missing = [];
    if (!CFG.LEAD_ENDPOINT) missing.push('LEAD_ENDPOINT(접수 저장 안 됨)');
    if (!CFG.GA4_ID) missing.push('GA4_ID');
    if (missing.length) { note.textContent = '설정 필요 · config.js: ' + missing.join(', '); note.hidden = false; }
  }
  if (!CFG.LEAD_ENDPOINT && window.console) console.warn('[doctornest landing] config.js LEAD_ENDPOINT 비어 있음: 접수가 저장되지 않습니다.');

  /* ---------- 카카오톡 채널 채팅 버튼(설정 KAKAO_CHAT_URL) ---------- */
  var kakaoUrl = (CFG.KAKAO_CHAT_URL || '').trim();
  $$('[data-kakao]', document).forEach(function (a) { if (kakaoUrl) { a.href = kakaoUrl; a.hidden = false; } else { a.hidden = true; } });

  /* ---------- 제안서 받기 모드(2026-10-04): ?offer=pdf 또는 설정 OFFER_DEFAULT='pdf', 파일은 설정 PROPOSAL_FILE ----------
     ?cta=a|b|c|d 로 광고 CTA 문구 A/B 테스트와 같은 문구를 쓴다(대표 확정 네 가지, 없으면 a). 문구 humanize-korean run 2026-10-04-005 */
  var qs = new URLSearchParams(location.search);
  var offerParam = qs.get('offer'), ctaKey = (qs.get('cta') || 'a').toLowerCase();
  var pdfUrl = CFG.PROPOSAL_FILE ? (CFG.ASSET_BASE || 'shared/') + CFG.PROPOSAL_FILE : '';
  var OFFERS = {  // 닥터네스트 CTA A/B 네 칸
    a: { cta: '제안서 받아보기', note: '병원 이름과 연락처를 남기시면 제안서(PDF 12쪽)를 바로 받아 보실 수 있어요.',
         done: '접수되었어요. 제안서를 바로 받아 보세요.', pdf: '제안서 바로 보기', toast: '접수되었어요. 아래에서 제안서를 받아 보세요.' },
    b: { cta: '닥터네스트 소개서 받아보기', note: '병원 이름과 연락처를 남기시면 소개서(PDF 12쪽)를 바로 받아 보실 수 있어요.',
         done: '접수되었어요. 소개서를 바로 받아 보세요.', pdf: '소개서 바로 보기', toast: '접수되었어요. 아래에서 소개서를 받아 보세요.', view: '?t=intro' },
    c: { cta: '15분 화면 시연 받아보기', note: '병원 이름과 연락처를 남기시면 담당자가 15분 화면 시연 일정을 잡아 드려요. 기다리시는 동안 제안서를 먼저 보실 수 있어요.',
         done: '접수되었어요. 담당자가 곧 시연 일정을 잡아 드릴게요.', pdf: '제안서 먼저 보기', toast: '접수되었어요. 담당자가 곧 연락드릴게요.' },
    d: { cta: '연말 특가 조건 받아보기', note: '병원 이름과 연락처를 남기시면 2026년 12월 31일까지 적용되는 월 99,000원(VAT 포함) 조건과 제안서를 바로 받아 보실 수 있어요.',
         done: '접수되었어요. 특가 조건과 제안서를 바로 확인해 보세요.', pdf: '특가 조건과 제안서 보기', toast: '접수되었어요. 아래에서 특가 조건을 확인해 보세요.' }
  };
  if (CFG.BRAND === 'beautynest') {  // 뷰티네스트(2026-10-04): 광고 이미지 버튼과 같은 문구. 문구 humanize-korean run 2026-10-04-007
    OFFERS = {
      demo: { cta: '15분 화면 시연 신청', note: '샵 이름과 연락처를 남기시면 담당자가 15분 화면 시연 일정을 잡아 드려요. 기다리시는 동안 소개서를 먼저 보실 수 있어요.',
              done: '접수되었어요. 담당자가 곧 시연 일정을 잡아 드릴게요.', pdf: '소개서 먼저 보기', toast: '접수되었어요. 담당자가 곧 연락드릴게요.' },
      call: { cta: '5분 무료 통화상담', note: '샵 이름과 연락처를 남기시면 담당자가 5분 통화로 요금과 이용 방법을 안내해 드려요. 기다리시는 동안 소개서를 먼저 보실 수 있어요.',
              done: '접수되었어요. 담당자가 곧 전화드릴게요.', pdf: '소개서 먼저 보기', toast: '접수되었어요. 담당자가 곧 연락드릴게요.' }
    };
    if (!OFFERS[ctaKey]) ctaKey = 'demo';
  }
  if (!OFFERS[ctaKey]) ctaKey = 'a';
  var T = pdfUrl && (offerParam ? offerParam === 'pdf' : CFG.OFFER_DEFAULT === 'pdf') ? Object.assign({ submit: OFFERS[ctaKey].cta, key: ctaKey }, OFFERS[ctaKey]) : null;
  if (T && T.view) pdfUrl += T.view;
  if (T) {
    document.documentElement.setAttribute('data-offer', 'pdf-' + T.key);
    $$('a[href="#consultation"]', document).forEach(function (a) { var sp = a.querySelector('span'); (sp || a).textContent = T.cta; });
    // 첫 화면에서도 광고가 약속한 것을 바로 말한다(폼 위 안내와 같은 문장, 2026-10-04 랜딩 평가 1번)
    var heroActs = $('.landing-module__i9Fx1W__heroActions'), heroSub = heroActs && heroActs.parentElement.querySelector('.dn-hero-sub');
    if (heroActs) (heroSub || heroActs).insertAdjacentHTML('afterend', '<p class="dn-hero-offer">' + T.note + '</p>');
  }

  /* ---------- 광고별 첫 화면 + 첫 화면 가격(2026-10-06, 대표 승인 "너가 얘기한 순서대로 진행해") ----------
     국내 메타 유입 열 명 중 일곱 명이 첫 화면에서 나갔다. 광고에서 본 말(태블릿 서명, 월 99,000원)이 첫 화면에 없었다.
     utm_content의 소재 번호(dn07_b → dn07, bnU7 → bnu7)로 첫 화면 제목을 그 광고 문구로 바꾼다. 문구는 광고 이미지·본문에 쓴
     승인 문구 그대로다(새로 쓰지 않음). 목록에 없는 소재나 직접 방문은 원래 첫 화면을 그대로 둔다.
     가격 한 줄은 DN-09 광고 이미지의 요금 상자 문구 그대로이고, 변형 b 방문자 모두에게 보인다. */
  var hero = $('#about [data-reveal-group]');
  var promoOn = Date.now() < Date.parse('2027-01-01T00:00:00+09:00');   // 연말 특가 문구(월 99,000원)는 2026-12-31까지만
  // 2026-10-07 대표 승인: 뷰티네스트는 10/5 첫 화면으로 되돌린다(광고별 제목·가격 줄 끔). 이 변경 뒤 10/6~7 신청 0건,
  // 스크롤 74→48%, 신청서 시작 11→4%. 이틀 시험 후 판정. 닥터네스트는 그대로.
  if (hero && variant === 'b' && promoOn && CFG.BRAND !== 'beautynest') {
    var adKey = (qs.get('utm_content') || '').toLowerCase().replace(/_[a-d]$/, '');
    var HERO = {
      dn07: { title: '수백만 원짜리 병원 마케팅 오퍼레이션 시스템,<br>월 9만 9천 원 특가 프로모션.' },
      dn09: { title: 'CRM 따로, 마케팅 대행사 따로,<br>DB 마케팅 따로 왜 돈 쓰세요?', copy: '닥터네스트 하나면 전부 해결됩니다.' },
      dn30: { title: '비싼 광고비로 데려온 신환,<br>경쟁 병원으로 도망치게 방치하고 계십니까?' },
      bnu7: { title: '종이 동의서 대신<br>태블릿에 손님이 바로 서명해요.', copy: '이지차트는 월 이용료에 포함돼 있어요.',
              img: 'img/ad-bnu7-tablet.webp', alt: '이지차트 반영구 시술 동의서에 손님이 태블릿으로 서명하는 화면 예시' },
      // 2026-10-06 추가 소재(대표 승인 "둘 다 넣고 올려"). 제목은 각 광고 이미지 헤드라인, 설명은 광고 본문 둘째 줄 그대로
      bnu7s: { title: '종이 동의서 대신<br>태블릿에 손님이 바로 서명해요.', copy: '이지차트는 월 이용료에 포함돼 있어요.',
               img: 'img/ad-bnu7s-tablet.webp', alt: '이지차트 반영구 시술 동의서에 손님이 태블릿으로 서명하는 화면 예시' },
      bnu7n: { title: '종이 동의서 대신<br>태블릿에 손님이 바로 서명해요.', copy: '이지차트는 월 이용료에 포함돼 있어요.',
               img: 'img/ad-bnu7n-tablet.webp', alt: '이지차트 반영구 시술 동의서에 손님이 태블릿으로 이름을 적는 화면 예시' },
      bnu10: { title: '이지차트에는 그날 받은 동의서가<br>날짜별로 그대로 남아 있어요.', copy: '월 이용료에 포함돼 있어요.',
               img: 'img/ad-bnu10-tablet.webp', alt: '이지차트 시술 동의서 목록 화면 예시' },
      bnu11: { title: '이지차트는 손님 이름만 치면<br>지난 시술 기록이 바로 떠요.', copy: '월 이용료에 포함돼 있어요.',
               img: 'img/ad-bnu11-tablet.webp', alt: '이지차트 손님 찾기와 지난 시술 기록 화면 예시' },
      bnu8: { title: '반영구·속눈썹·왁싱 차트를<br>태블릿에서 바로 꺼내 써요.', copy: '이지차트 쓰면 차트 살 일이 없어요.',
              img: 'img/ad-bnu8-tablet.webp', alt: '이지차트 업종별 시술 상담 차트 템플릿 화면 예시' },
      dn32: { title: '국내 SNS 문의부터 해외 메신저까지,<br>클릭 한 번으로 끊김 없이 응대하세요.' },
      dn29b: { title: '플랜 등급·좌석 수·시술 개수<br>제한 없는 병원 전문 All-in-One 솔루션.' },
      dn33: { title: '외국어 몰라도 괜찮습니다.<br>한국어로 답하면 환자 나라 말로 번역돼서 나갑니다.' }
    };
    var H = CFG.BRAND === 'beautynest' ? (adKey.indexOf('bn') === 0 ? HERO[adKey] : null) : (adKey.indexOf('dn') === 0 ? HERO[adKey] : null);
    if (H) {
      var eyebrow = $('.landing-module__i9Fx1W__eyebrow', hero), h1 = $('h1', hero), copy = $('.landing-module__i9Fx1W__heroCopy', hero);
      if (eyebrow) eyebrow.hidden = true;             // "닥터네스트는" 뒤에 광고 문장이 이어지면 어색하다
      if (h1) { h1.innerHTML = H.title; h1.classList.add('dn-hero-ad'); }
      if (copy && H.copy) copy.textContent = H.copy;
      var stage = $('#about .landing-module__i9Fx1W__heroStage');
      if (H.img && stage) {
        stage.innerHTML = '<img class="dn-hero-adimg" src="' + (CFG.ASSET_BASE || 'shared/') + H.img + '" alt="' + H.alt + '" width="1200" height="901" decoding="async" fetchpriority="high">';
        stage.parentElement.classList.add('dn-hero-adtrack');
      }
      document.documentElement.setAttribute('data-hero', adKey);
    }
    var heroCopyEl = $('.landing-module__i9Fx1W__heroCopy', hero), oldSub = $('.dn-hero-sub', hero);
    if (heroCopyEl) heroCopyEl.insertAdjacentHTML('afterend', '<p class="dn-hero-price"><strong>월 99,000원 · 2026년 12월 31일까지</strong><span>VAT 포함 · 설치비 0원 · 약정 없음 · 이후 월 330,000원</span></p>');
    if (oldSub) oldSub.hidden = true;                  // "설치비 0원 · 1년 약정 없이…"는 가격 줄과 겹친다
  }

  /* ---------- 소개 영상(설정 VIDEO_ID): 썸네일 먼저, 클릭하면 유튜브 플레이어 ---------- */
  var videoSec = document.getElementById('video');
  if (videoSec && /^[A-Za-z0-9_-]{6,}$/.test(CFG.VIDEO_ID || '')) {
    var vid = CFG.VIDEO_ID, vFrame = $('[data-video]', videoSec), thumb = $('.dn-video-thumb', videoSec), cap = $('.dn-video-caption', videoSec);
    thumb.src = 'https://i.ytimg.com/vi/' + vid + '/maxresdefault.jpg';
    thumb.addEventListener('error', function () { if (thumb.src.indexOf('maxres') > -1) thumb.src = 'https://i.ytimg.com/vi/' + vid + '/hqdefault.jpg'; });
    if (cap) cap.textContent = CFG.VIDEO_TITLE || '';
    videoSec.hidden = false;
    $('.dn-video-play', videoSec).addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + vid + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      f.title = CFG.VIDEO_TITLE || '소개 영상'; f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; f.setAttribute('allowfullscreen', '');
      vFrame.innerHTML = ''; vFrame.appendChild(f);
      track('video_play', { video_id: vid, title: (CFG.VIDEO_TITLE || '').slice(0, 60) });
    });
  }

  /* ---------- 헤더 · 모바일 메뉴 ---------- */
  var header = $('.landing-module__i9Fx1W__header');
  var menuBtn = header && $('.landing-module__i9Fx1W__menuButton', header);
  var mobileMenu = document.getElementById('landing-mobile-menu');
  if (menuBtn && mobileMenu) {
    var ICON_MENU = menuBtn.innerHTML;
    var ICON_X = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
    var setMenu = function (open) {
      mobileMenu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      menuBtn.innerHTML = open ? ICON_X : ICON_MENU;
    };
    menuBtn.addEventListener('click', function () { setMenu(mobileMenu.hidden); });
    $$('a', mobileMenu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    var logo = $('.landing-module__i9Fx1W__logo', header);
    logo && logo.addEventListener('click', function () { setMenu(false); });
    header.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mobileMenu.hidden) { setMenu(false); menuBtn.focus(); } });
  }

  /* ---------- LandingMotion: 등장 애니메이션 · 숫자 카운트 · 플로팅 CTA · 현재 섹션 표시 ---------- */
  var about = $('#about'), consult = $('#consultation');
  var scrollCta = $('[data-scroll-cta]');
  var dock = document.querySelector('.dn-dock');
  var sectionLinks = $$('[data-section-link]');
  var navSections = ['about', 'difference', 'product', 'pricing', 'faq'].map(function (id) { return $('#' + id); });
  var io = null, anims = [], rafs = [], counted = [], ticking = 0;

  function countUp(el) {
    var target = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    counted.push([el, el.textContent]);
    var start = performance.now();
    var step = function (now) {
      var t = clamp((now - start) / 1200);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))).toLocaleString('ko-KR') + suffix;
      if (t < 1) rafs.push(requestAnimationFrame(step));
    };
    step(start);
  }
  function resetMotion() {
    io && io.disconnect();
    anims.forEach(function (a) { a.cancel(); }); anims = [];
    rafs.forEach(cancelAnimationFrame); rafs = [];
    counted.forEach(function (p) { p[0].textContent = p[1]; }); counted = [];
  }
  var FROM = { rise: 'translateY(16px)', up: 'translateY(32px)', left: 'translateX(-20px)', chip: 'translateX(-12px)', pop: 'scale(.55)', grow: 'scaleY(0)', scale: 'scale(.94)', fade: '' };
  function setupMotion() {
    resetMotion();
    if (reduce.matches) { frame(); return; }
    var groups = new Map();
    $$('[data-reveal-group]').forEach(function (g) {
      if (g.dataset.revealed) return;
      var list = [];
      [g].concat($$('[data-motion]', g)).filter(function (el) { return el.dataset.motion && el.closest('[data-reveal-group]') === g; }).forEach(function (el) {
        var kind = el.dataset.motion, cs = getComputedStyle(el), base = cs.transform === 'none' ? '' : cs.transform, delay = Number(el.dataset.delay || 0);
        var add = function (kf, dur, ease) {
          var a = el.animate(kf, { duration: dur, delay: delay, easing: ease, fill: 'backwards' });
          a.pause(); a.currentTime = 0; anims.push(a); list.push(a);
        };
        if (kind === 'draw') { add([{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], 2000, 'cubic-bezier(.45,0,.2,1)'); return; }
        add([{ opacity: 0 }, { opacity: cs.opacity }], kind === 'chip' ? 500 : 600, 'ease');
        if (kind !== 'fade') {
          var from = (base + ' ' + (FROM[kind || 'rise'] || '')).trim() || 'none';
          add([{ transform: from }, { transform: base || 'none' }], kind === 'pop' ? 500 : kind === 'chip' ? 650 : 800,
            kind === 'pop' ? 'cubic-bezier(.34,1.56,.64,1)' : kind === 'chip' ? 'cubic-bezier(.22,.61,.36,1)' : 'cubic-bezier(.2,.7,.2,1)');
        }
      });
      groups.set(g, list);
    });
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.dataset.revealed = 'true';
        (groups.get(en.target) || []).forEach(function (a) { a.play(); });
        $$('[data-count]', en.target).forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    groups.forEach(function (_, g) { io.observe(g); });
    frame();
  }
  function frame() {
    ticking = 0;
    var vh = innerHeight;
    var show = !!about && about.getBoundingClientRect().bottom <= 44 && !!consult && consult.getBoundingClientRect().top >= .75 * vh;
    if (dock) { dock.dataset.visible = String(show); }
    var cur = '';
    navSections.forEach(function (s) { if (s && s.getBoundingClientRect().top <= .4 * vh) cur = s.id; });
    if (cur === 'difference') cur = 'about';
    sectionLinks.forEach(function (a) { if (a.hash === '#' + cur) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    if (scrollCta) {
      var p = 1 - Math.pow(1 - (reduce.matches ? 1 : clamp((vh - scrollCta.parentElement.getBoundingClientRect().top) / (.7 * vh))), 3);
      scrollCta.style.transform = 'translateY(' + ((1 - p) * 60) + 'px) scale(' + (.88 + .12 * p) + ')';
      scrollCta.style.opacity = String(.3 + .7 * p);
      scrollCta.style.backgroundPosition = ((1 - p) * 40) + '% 0';
    }
  }
  var onScroll = function () { if (!ticking) ticking = requestAnimationFrame(frame); };
  setupMotion();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  reduce.addEventListener('change', setupMotion);

  /* ---------- HeroMotion: 스크롤에 따라 히어로 영상을 문지르는 효과 ---------- */
  var heroTrack = $('.landing-module__i9Fx1W__heroTrack'), heroStage = $('.landing-module__i9Fx1W__heroStage'), heroVideo = $('.landing-module__i9Fx1W__heroVideo');
  if (heroTrack && heroStage) {
    var hRaf = 0, hCur = 0, hTarget = 0, hDist = 0, hTop = 64, hLast = 0, hVisible = false;
    var hSeekTarget = -1, hSeekFails = 0, hSeekBroken = false;   // Range 요청을 못 받는 서버에서는 seek가 0초로 튕기며 폭주하므로 3번 실패하면 스크럽을 끈다
    var hPaint = function () {
      heroStage.style.setProperty('--hero-progress', String(hCur));
      var g = Math.round(245 + 10 * clamp((hCur - .75) / .2));
      heroStage.style.setProperty('--hero-background', 'rgb(' + g + ' ' + g + ' ' + g + ')');
      heroStage.style.setProperty('--hero-screen-opacity', String(1 - clamp((hCur - .17) / .16)));
      heroStage.style.setProperty('--hero-brand-opacity', String(clamp((hCur - .21) / .12) * (1 - clamp((hCur - .75) / .18))));
      heroStage.style.setProperty('--hero-brand-scale', String(.94 + .06 * clamp(hCur / .7)));
      heroStage.style.setProperty('--hero-spread', (1.7 * clamp((hCur - .62) / .25)) + 'em');
      heroStage.style.setProperty('--hero-split', (400 * clamp((hCur - .75) / .15)) + '%');
      if (heroVideo && !hSeekBroken && heroVideo.readyState >= 2 && !heroVideo.seeking && isFinite(heroVideo.duration)) {
        var t = hCur * Math.max(0, heroVideo.duration - 1 / 30);
        if (Math.abs(heroVideo.currentTime - t) > .012) { hSeekTarget = t; heroVideo.currentTime = t; }
      }
    };
    var hTick = function (now) {
      var dt = Math.min(64, now - (hLast || now - 16.67));
      hLast = now;
      hCur += (hTarget - hCur) * (1 - Math.pow(.86, dt / 16.67));
      if (Math.abs(hTarget - hCur) < 5e-4) hCur = hTarget;
      hPaint();
      hRaf = (hCur !== hTarget && hVisible) ? requestAnimationFrame(hTick) : 0;
    };
    var hUpdate = function () {
      hTarget = hDist ? clamp((hTop - heroTrack.getBoundingClientRect().top) / hDist) : 0;
      if (hVisible && hDist && !document.hidden && heroVideo && !heroVideo.getAttribute('src')) { heroVideo.src = heroVideo.dataset.src; heroVideo.load(); }
      if (!hRaf && hVisible && !document.hidden) { hLast = 0; hRaf = requestAnimationFrame(hTick); }
    };
    var hLayout = function () {
      var linked = !reduce.matches && innerHeight >= 600;
      heroTrack.dataset.scrollLinked = String(linked);
      var mw = Math.max(280, Math.min(1260, (innerHeight - 112) * 3024 / 1706));
      heroStage.style.maxWidth = linked ? mw + 'px' : '';
      hTop = Math.max(64, (innerHeight - heroStage.offsetHeight) / 2 + 22);
      hDist = linked ? Math.max(600, 1.5 * innerHeight) : 0;
      heroTrack.style.setProperty('--hero-top', hTop + 'px');
      heroTrack.style.setProperty('--hero-distance', hDist + 'px');
      heroTrack.style.height = linked ? (heroStage.offsetHeight + hDist) + 'px' : '';
      if (!linked) { hTarget = hCur = 0; hPaint(); }
      hUpdate();
    };
    new IntersectionObserver(function (es) { hVisible = es[0].isIntersecting; if (hVisible) hUpdate(); }, { rootMargin: '200px' }).observe(heroTrack);
    new ResizeObserver(hLayout).observe(heroStage);
    hLayout();
    if (heroVideo) {
      heroVideo.addEventListener('loadeddata', hPaint);
      heroVideo.addEventListener('seeked', function () {
        if (hSeekTarget >= 0 && Math.abs(heroVideo.currentTime - hSeekTarget) > .05) {
          if (++hSeekFails >= 3) { hSeekBroken = true; if (window.console) console.warn('[landing] 히어로 영상 seek 실패(서버가 Range 요청을 지원하지 않는 듯). 스크럽을 끕니다.'); return; }
        } else hSeekFails = 0;
        hPaint();
      });
    }
    addEventListener('scroll', hUpdate, { passive: true });
    addEventListener('resize', hLayout);
    reduce.addEventListener('change', hLayout);
    document.addEventListener('visibilitychange', function () { if (document.hidden) { cancelAnimationFrame(hRaf); hRaf = 0; } else hUpdate(); });
  }

  /* ---------- ProductShowcase: 스크롤 연동 탭(마케팅 ↔ 상담) ---------- */
  var prod = $('#product');
  if (prod) {
    var pFrame = $('.landing-module__i9Fx1W__product', prod), pCopy = $('.landing-module__i9Fx1W__productCopy', prod);
    var STEPS = ['marketing', 'chat'];
    var pStep = prod.dataset.step || 'marketing', pLinked = false, pDist = 0, pRafS = 0, pRafL = 0;
    var setStep = function (id) {
      if (pStep === id) return;
      pStep = id; prod.dataset.step = id;
      STEPS.forEach(function (s) {
        var on = s === id;
        var btn = document.getElementById('product-' + s); btn && btn.setAttribute('aria-expanded', String(on));
        var d = document.getElementById('product-' + s + '-description'); if (d) { d.dataset.active = String(on); d.setAttribute('aria-hidden', String(!on)); }
        var p = document.getElementById('product-' + s + '-panel'); if (p) { p.dataset.active = String(on); p.setAttribute('aria-hidden', String(!on)); p.inert = !on; }
      });
    };
    var pOnScroll = function () { pRafS = 0; if (pLinked) setStep((64 - prod.getBoundingClientRect().top) / pDist < .5 ? 'marketing' : 'chat'); };
    var pLayout = function () {
      pRafL = 0;
      var tabs = $$('[data-product-step]', pCopy);
      var hsum = tabs.reduce(function (acc, t) { var cs = getComputedStyle(t); var h3 = t.querySelector('h3'); return acc + (h3 ? h3.offsetHeight : 0) + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom); }, 0);
      var pmax = Math.max.apply(null, tabs.map(function (t) { var p = t.querySelector('p'); return (p ? p.offsetHeight : 0) + 8; }));
      prod.style.setProperty('--product-tabs-height', (hsum + pmax) + 'px');
      pLinked = false; delete prod.dataset.scrollLinked;
      if (reduce.matches || innerHeight < 600) return;
      prod.dataset.scrollLinked = 'true';
      var cs = getComputedStyle(pFrame), mobile = matchMedia('(max-width: 899px)').matches;
      var avail = innerHeight - 64 - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      var mediaH = avail - (mobile ? pCopy.offsetHeight + parseFloat(cs.rowGap) : 0);
      if (mediaH < 160 || (!mobile && pCopy.offsetHeight > avail)) { delete prod.dataset.scrollLinked; return; }
      prod.style.setProperty('--product-media-limit', (710 * mediaH / 552) + 'px');
      prod.style.setProperty('--product-frame-height', pFrame.offsetHeight + 'px');
      pDist = Math.max(700, 1.4 * innerHeight);
      prod.style.setProperty('--product-distance', pDist + 'px');
      pLinked = true;
      pOnScroll();
    };
    var pRo = new ResizeObserver(function () { if (!pRafL) pRafL = requestAnimationFrame(pLayout); });
    pRo.observe(pFrame); pRo.observe(pCopy); $$('p', pCopy).forEach(function (p) { pRo.observe(p); });
    addEventListener('scroll', function () { if (!pRafS) pRafS = requestAnimationFrame(pOnScroll); }, { passive: true });
    addEventListener('resize', function () { if (!pRafL) pRafL = requestAnimationFrame(pLayout); });
    reduce.addEventListener('change', pLayout);
    STEPS.forEach(function (s, i) {
      var btn = document.getElementById('product-' + s);
      btn && btn.addEventListener('click', function () {
        if (!pLinked) { setStep(s); return; }
        var y = scrollY + prod.getBoundingClientRect().top - 64;
        scrollTo({ top: y + pDist * ((i + .5) / STEPS.length), behavior: 'smooth' });
      });
    });
    pLayout();

    /* MarketingPlayback: 마케팅 탭이 보일 때만 영상 재생 */
    var pb = $('.landing-module__i9Fx1W__marketingPlayback', prod), mv = $('.landing-module__i9Fx1W__marketingVideo', prod);
    if (pb) {
      var pbIn = false, wasMk = true;
      var pbSync = function () {
        var mk = prod.getAttribute('data-step') === 'marketing';
        var on = pbIn && mk && !document.hidden && !reduce.matches;
        pb.dataset.playing = String(on);
        if (mv) {
          if (on) { if (!mv.getAttribute('src')) mv.src = mv.dataset.src; if (!wasMk) mv.currentTime = 0; var pr = mv.play(); pr && pr.catch && pr.catch(function () {}); }
          else mv.pause();
        }
        wasMk = mk;
      };
      new IntersectionObserver(function (es) { pbIn = es[0].isIntersecting; pbSync(); }).observe(pb);
      new MutationObserver(pbSync).observe(prod, { attributes: true, attributeFilter: ['data-step'] });
      reduce.addEventListener('change', pbSync);
      document.addEventListener('visibilitychange', pbSync);
    }
  }

  /* ---------- FAQ 아코디언 ---------- */
  var faqList = $('.landing-module__i9Fx1W__faqList');
  if (faqList) {
    var items = $$('.landing-module__i9Fx1W__faqItem', faqList), open = 0;
    var renderFaq = function () {
      items.forEach(function (it, i) {
        var on = open === i, btn = it.querySelector('button'), ans = it.querySelector('.landing-module__i9Fx1W__faqAnswer');
        btn.setAttribute('aria-expanded', String(on));
        if (ans) { ans.dataset.active = String(on); ans.setAttribute('aria-hidden', String(!on)); }
      });
    };
    items.forEach(function (it, i) {
      it.querySelector('button').addEventListener('click', function () {
        open = open === i ? null : i; renderFaq();
        if (open === i) track('faq_open', { question: it.querySelector('button').textContent.trim().slice(0, 60) });
      });
    });
  }

  /* ---------- 상담 신청 폼 ---------- */
  var form = $('form.consultation-form-module___58eVG__form');
  if (form) {
    var SOURCES = { INSTAGRAM: 1, YOUTUBE: 1, REFERRAL: 1, SEARCH: 1, OTHER: 1 };
    var fieldset = form.querySelector('fieldset.consultation-form-module___58eVG__fields');
    var submit = form.querySelector('button[type=submit]');
    var phone = form.elements.phone;
    var state = 'idle', sending = false, reqKey = null, lastPayload = null, toastTimer = 0, started = false, errCount = 0;
    var setState = function (s) {
      state = s;
      form.setAttribute('aria-busy', String(s === 'sending'));
      if (fieldset) fieldset.disabled = (s === 'sending');
      submit.disabled = (s !== 'idle');
      submit.textContent = s === 'sending' ? '접수 중…' : s === 'done' ? '신청 완료' : (T ? T.submit : '무료 상담하기');
    };
    if (T) {
      submit.textContent = T.submit;
      form.insertAdjacentHTML('beforebegin', '<p class="dn-offer-note">' + T.note + '</p>');
      var srcField = form.querySelector('.consultation-form-module___58eVG__sourceField');  // 랜딩 평가 2번: 광고 방문자는 경로를 묻지 않는다
      if (srcField) srcField.hidden = true;
      var biz = form.elements.businessName, bizLab = biz && biz.closest('label');  // 제안서 모드는 병원 이름 필수: 전화번호와 같은 * 표시
      if (biz) { biz.required = true; biz.setAttribute('aria-required', 'true'); }
      if (bizLab && bizLab.firstElementChild) bizLab.firstElementChild.insertAdjacentHTML('beforeend', '<span class="consultation-form-module___58eVG__required" aria-hidden="true"> *</span>');
    }
    if (phone) phone.addEventListener('input', function () {
      var d = phone.value.replace(/\D/g, '').slice(0, 11), i = d.indexOf('02') === 0 ? 2 : 3;
      phone.value = d.length <= i ? d : d.length <= i + 4 ? d.slice(0, i) + '-' + d.slice(i) : d.slice(0, i) + '-' + d.slice(i, -4) + '-' + d.slice(-4);
    });
    /* 2026-10-05: 오류 안내를 칸 바로 아래에 고쳐 쓸 때까지 남긴다. 10/5 국내 방문자 1명이 신청 버튼을 6번 누르고 나갔는데,
       안내가 3초 뜨고 사라지는 토스트뿐이라 어느 칸이 문제인지 알기 어려웠다. */
    var clearErr = function (el) {
      if (!el || !el.name || !el.removeAttribute) return;
      el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby');
      var p = document.getElementById('dn-err-' + el.name); if (p) p.remove();
    };
    var showErrors = function (errors) {
      var shown = 0;
      Array.prototype.forEach.call(form.querySelectorAll('.dn-field-error'), function (p) { p.remove(); });
      Object.keys(errors).forEach(function (n) {
        var el = form.elements.namedItem(n), lab = el && el.closest && el.closest('label');
        if (!lab || !errors[n]) return;
        var p = document.createElement('span');
        p.className = 'dn-field-error'; p.id = 'dn-err-' + n; p.textContent = errors[n];
        el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', p.id);
        if (n === 'consent') lab.insertAdjacentElement('afterend', p); else lab.appendChild(p);
        shown++;
      });
      return shown;
    };
    form.addEventListener('input', function (e) { clearErr(e.target); if (state !== 'done') setState('idle'); });
    form.addEventListener('change', function (e) { clearErr(e.target); });
    form.addEventListener('focusin', function () { if (!started) { started = true; track('form_start', {}); } });
    var toast = function (kind, text) {
      var pos = document.querySelector('.consultation-form-module___58eVG__toastPosition');
      if (!pos) {
        pos = document.createElement('div'); pos.className = 'consultation-form-module___58eVG__toastPosition';
        pos.innerHTML = '<div class="consultation-form-module___58eVG__toast" aria-atomic="true"><img alt="" width="20" height="20"><span></span></div>';
        document.body.appendChild(pos);
      }
      var t = pos.firstElementChild;
      t.setAttribute('role', kind === 'error' ? 'alert' : 'status');
      t.querySelector('img').src = (CFG.ASSET_BASE || 'assets/') + 'img/form-' + kind + '.svg';
      t.querySelector('span').textContent = text;
      t.dataset.visible = 'true'; t.setAttribute('aria-hidden', 'false');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { t.dataset.visible = 'false'; t.setAttribute('aria-hidden', 'true'); }, 3000);
    };
    var fail = function (errors, msg) {
      var first = Object.keys(errors)[0];
      var shown = showErrors(errors);
      if (first) {
        var el = form.elements.namedItem(first);
        if (el && el.setAttribute) {
          el.setAttribute('aria-invalid', 'true');
          if (el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
          if (el.focus) el.focus({ preventScroll: true });
        }
      }
      if (!shown || msg) toast('error', msg || errors[first] || '입력 내용을 확인해 주세요.');  // 칸 아래 안내가 떴으면 토스트는 생략(겹쳐서 가린다)
    };
    var validate = function () {
      var errors = {};
      var clean = function (n) {
        var v = (form.elements[n] && form.elements[n].value) || '';
        if (v.length > 100 || /[\u0000-\u001f\u007f]/.test(v)) { errors[n] = '100자 이내의 올바른 내용을 입력해 주세요.'; return null; }
        return v.trim() || null;
      };
      var businessName = clean('businessName'), contactName = clean('contactName');
      if (T && !businessName && !errors.businessName) errors.businessName = CFG.BRAND === 'beautynest' ? '샵 이름을 입력해 주세요.' : '병원 이름을 입력해 주세요.';  // 제안서 모드는 업체 이름 필수
      var raw = (phone ? phone.value : '').trim(), digits = raw.replace(/[\s()-]/g, '');
      if (!raw) errors.phone = '연락받으실 전화번호를 입력해 주세요.';
      else if (!/^010/.test(digits)) errors.phone = '휴대폰 번호(010)로 입력해 주세요.';  // 2026-10-05 대표 지시: 010 휴대폰 번호만 받는다(유선·임의 번호는 접수 브리지에서 허위 DB로 분류됨)
      else if (!/^010\d{8}$/.test(digits) || raw.length > 30) errors.phone = '연락 가능한 전화번호를 확인해 주세요.';
      var srcEl = form.querySelector('input[name=source]:checked'), src = srcEl ? srcEl.value : '';
      if (src && !SOURCES[src]) errors.source = '서비스를 알게 된 경로를 다시 선택해 주세요.';
      var consent = form.elements.consent;
      if (consent && !consent.checked) errors.consent = '개인정보 수집·이용에 동의해 주세요.';
      return Object.keys(errors).length ? { ok: false, errors: errors } : { ok: true, data: { businessName: businessName, contactName: contactName, phone: digits, source: src || null } };
    };
    var showThanks = function () {
      var box = document.createElement('div');
      box.className = 'dn-thanks'; box.setAttribute('role', 'status');
      box.innerHTML = (T ? '<strong>' + T.done + '</strong><a class="landing-module__i9Fx1W__consultationButton dn-pdf-btn" href="' + pdfUrl + '" target="_blank" rel="noopener" data-track="proposal_download" data-loc="thanks">' + T.pdf + '</a>' : '<strong>상담 신청이 접수되었어요.</strong>') +
        '<p>담당자가 곧 연락드릴게요. 바로 통화를 원하시면 아래 번호로 전화해 주세요.</p>' +
        '<a class="landing-module__i9Fx1W__consultationButton" href="tel:' + (CFG.PHONE_RAW || '') + '" data-track="phone_click" data-loc="thanks">' + (CFG.PHONE_DISPLAY || '') + ' 전화하기</a>' +
        (kakaoUrl ? '<br><a class="dn-kakao-btn" href="' + kakaoUrl + '" target="_blank" rel="noopener" data-track="kakao_click" data-loc="thanks">카카오톡으로 이어서 상담</a>' : '');
      form.hidden = true;
      var offerNote = document.querySelector('.dn-offer-note'); if (offerNote) offerNote.hidden = true;
      form.insertAdjacentElement('afterend', box);
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending || state === 'done') return;
      var v = validate();
      if (!v.ok) { fail(v.errors); track('form_error', { field: Object.keys(v.errors).join(','), attempt: ++errCount }); return; }  // field: GA4 맞춤 측정기준 '오류 칸'
      var payloadStr = JSON.stringify(v.data);
      if (lastPayload !== payloadStr || !reqKey) { lastPayload = payloadStr; reqKey = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(16).slice(2)); }
      if (!CFG.LEAD_ENDPOINT) { fail({}, '접수 서버가 아직 연결되지 않았습니다. 전화로 문의해 주세요.'); return; }
      sending = true; setState('sending');
      var body = Object.assign({}, v.data, {
        requestKey: reqKey, website: new FormData(form).get('website') || '', variant: variant, brand: CFG.BRAND || '', offer: T ? 'pdf-' + T.key : '',
        page: location.href.slice(0, 300), referrer: (document.referrer || '').slice(0, 300),
        attrib: window.dnAttrib ? window.dnAttrib() : {}, userAgent: navigator.userAgent.slice(0, 200), submittedAt: new Date().toISOString()
      });
      var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 15000);
      fetch(CFG.LEAD_ENDPOINT, { method: 'POST', mode: CFG.LEAD_MODE || 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: ctl.signal })
        .then(function (res) {
          if (res.type === 'opaque') return { ok: true };
          return res.json().catch(function () { return {}; }).then(function (j) {
            if (!res.ok || j.ok === false) { if (res.status === 409) reqKey = null; return { ok: false, errors: j.errors || {}, error: j.error }; }
            return { ok: true };
          });
        })
        .then(function (r) {
          if (!r.ok) { setState('idle'); fail(r.errors, r.error || '접수하지 못했어요. 잠시 후 다시 시도해 주세요.'); return; }
          setState('done');
          toast('success', T ? T.toast : '상담 신청이 접수되었어요. 담당자가 곧 연락드릴게요.');
          showThanks();
          track('generate_lead', { source: v.data.source || '', request_key: reqKey });
        })
        .catch(function () { setState('idle'); toast('error', '접수 결과를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'); })
        .then(function () { clearTimeout(to); sending = false; });
    });
  }

  /* ---------- 트래킹: 클릭 · 섹션 도달 · 스크롤 깊이 ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a,button');
    if (!a) return;
    var name = a.dataset.track, href = a.getAttribute('href') || '';
    if (!name && href.indexOf('tel:') === 0) name = 'phone_click';
    if (!name && /kakao/i.test(href)) name = 'kakao_click';
    if (!name && (href === '#consultation' || /doctornest\.ai\/service|\/login|\/downloads/.test(href))) name = 'cta_click';
    if (!name) return;
    track(name, { location: a.dataset.loc || (a.closest('section,header,footer') || {}).id || (a.closest('header') ? 'header' : a.closest('footer') ? 'footer' : 'floating'), label: (a.textContent || '').trim().slice(0, 40), href: href.slice(0, 120) });
  }, true);
  /* 랜딩 평가 3번(2026-10-04): 안쪽 링크(#…)를 눌러 자동으로 스크롤되는 동안 지나간 섹션은 읽은 것이 아니므로 세지 않는다.
     스크롤이 250ms 멈추면 끝난 것으로 보고, 그때 화면에 보이는 섹션만 센다. */
  var autoScroll = false, autoTimer = 0;
  var endAuto = function () { autoScroll = false; recheck(); };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    autoScroll = true; clearTimeout(autoTimer); autoTimer = setTimeout(endAuto, 1500);
  }, true);
  addEventListener('scroll', function () { if (autoScroll) { clearTimeout(autoTimer); autoTimer = setTimeout(endAuto, 250); } }, { passive: true });
  var seen = {};
  var markSeen = function (id) {
    if (seen[id]) return;
    seen[id] = true;
    track('section_view', { section: id });
    if (id === 'pricing') track('pricing_view', {});
  };
  var recheck = function () {
    ['about', 'video', 'difference', 'product', 'care', 'results', 'pricing', 'faq', 'consultation'].forEach(function (id) {
      var el = document.getElementById(id); if (!el || seen[id]) return;
      var r = el.getBoundingClientRect(), vis = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      if (vis > 0 && vis >= Math.min(r.height, innerHeight) * 0.3) markSeen(id);
    });
  };
  var secIo = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (autoScroll || !en.isIntersecting || seen[en.target.id]) return;
      // 화면보다 긴 섹션(difference 2,900px 등)은 비율 0.3에 닿지 못하므로, 보이는 높이가 화면 또는 섹션의 30% 이상이면 도달로 본다
      if (en.intersectionRect.height < Math.min(en.boundingClientRect.height, innerHeight) * 0.3) return;
      markSeen(en.target.id);
      secIo.unobserve(en.target);
    });
  }, { threshold: [0, 0.1, 0.2, 0.3] });
  ['about', 'video', 'difference', 'product', 'care', 'results', 'pricing', 'faq', 'consultation'].forEach(function (id) { var s = document.getElementById(id); s && secIo.observe(s); });
  var depths = [25, 50, 75, 90], fired = {};
  addEventListener('scroll', function () {
    if (autoScroll) return;  // 버튼으로 내려가는 중의 깊이는 읽은 깊이가 아니다
    var max = document.documentElement.scrollHeight - innerHeight; if (max <= 0) return;
    var pct = Math.round(scrollY / max * 100);
    depths.forEach(function (d) { if (pct >= d && !fired[d]) { fired[d] = true; track('scroll_depth', { percent: d }); } });
  }, { passive: true });
})();
