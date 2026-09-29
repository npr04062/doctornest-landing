/* 트래킹 부트스트랩. <head>에서 동기 로딩된다.
   - 변형(a/b) 결정 → <html data-variant>
   - UTM·클릭 ID 보관(localStorage 'dn_attrib')
   - GA4(gtag) · 메타 픽셀 로딩
   - window.dnTrack(name, params): GA4 이벤트 + 메타 표준 이벤트 매핑 + dataLayer push */
(function () {
  var C = window.DN_CONFIG || {};
  var q = new URLSearchParams(location.search);
  var isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname);
  var trackQ = q.get('track');
  var loadTags = !isLocal || trackQ === '1' || trackQ === 'ga';   // 로컬 미리보기 트래픽이 실제 속성에 섞이지 않게. 확인이 필요하면 ?track=1(GA4+픽셀) 또는 ?track=ga(GA4만)
  var loadPixel = loadTags && !(isLocal && trackQ === 'ga');
  var v = (q.get('v') || C.VARIANT_DEFAULT || 'a').toLowerCase();
  if (v !== 'a' && v !== 'b') v = 'a';
  document.documentElement.setAttribute('data-variant', v);
  window.DN_VARIANT = v;

  window.dnAttrib = function () {
    var key = 'dn_attrib';
    try {
      var cur = JSON.parse(localStorage.getItem(key) || 'null');
      var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid'];
      var o = {}, hit = false;
      keys.forEach(function (k) { var val = q.get(k); if (val) { o[k] = val.slice(0, 120); hit = true; } });
      if (hit || !cur) {
        o.ref = (document.referrer || '').slice(0, 200);
        o.landing = (location.pathname + location.search).slice(0, 200);
        o.ts = new Date().toISOString();
        o.variant = v;
        localStorage.setItem(key, JSON.stringify(o));
        cur = o;
      }
      return cur || {};
    } catch (e) { return {}; }
  };
  window.dnAttrib();

  if (C.GA4_ID && loadTags) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.GA4_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', C.GA4_ID, { landing_variant: v });
    window.gtag('set', 'user_properties', { landing_variant: v });
  }

  if (C.PIXEL_ID && loadPixel) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', C.PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* GA4 이벤트명 → 메타 표준 이벤트. 나머지는 trackCustom */
  var META = {
    generate_lead: ['Lead', { content_name: (C.BRAND || 'doctornest') + '_consult' }],
    phone_click: ['Contact', { content_name: 'phone' }],
    kakao_click: ['Contact', { content_name: 'kakao' }],
    pricing_view: ['ViewContent', { content_name: 'pricing' }]
  };
  window.dnTrack = function (name, params) {
    params = Object.assign({ landing_variant: v }, params || {});
    try { if (window.gtag && C.GA4_ID) window.gtag('event', name, params); } catch (e) {}
    try {
      if (window.fbq && C.PIXEL_ID) {
        var m = META[name];
        var opts = params.request_key ? { eventID: params.request_key } : undefined;
        if (m) window.fbq('track', m[0], Object.assign({}, m[1], { landing_variant: v }), opts);
        else window.fbq('trackCustom', name, params);
      }
    } catch (e) {}
    try { if (!C.GA4_ID) (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params)); } catch (e) {}
    if (C.DEBUG && window.console) console.log('[dnTrack]', name, params);
  };
})();
