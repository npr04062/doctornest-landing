// 닥터네스트 전용 랜딩 설정. 이 값만 바꾸면 된다(빌드 불필요).
window.DN_CONFIG = {
  BRAND: 'doctornest',
  ASSET_BASE: 'shared/',           // 공용 자산 경로(index.html 기준)
  GA4_ID: 'G-TJB4WLLS0L',            // GA4 속성 '닥터네스트 랜딩'(계정 스트라디지 407058821, 스트림 15857779060, 2026-09-28 생성)
  PIXEL_ID: '1614368206735019',      // 메타 픽셀(비즈니스 소유 데이터세트, 리뷰지우개와 같은 광고 계정)
  LEAD_ENDPOINT: 'https://script.google.com/macros/s/AKfycbxhftD5G84IeTqyMjw-6KCWWnn-HgAfqTx4Scb8iNszBOaFuW1Yziw35jqePEHHgIgSdA/exec',   // Apps Script 웹 앱 '랜딩 접수 브리지' v1 (2026-09-28 배포, 시트 '랜딩 접수 (닥터네스트·뷰티네스트)')
  LEAD_MODE: 'no-cors',              // Apps Script는 'no-cors'. CORS를 허용하는 자체 API면 'cors'
  VARIANT_DEFAULT: 'a',              // 'a' 원본 그대로 / 'b' 전환 개선안. URL에 ?v=a 또는 ?v=b 를 붙이면 강제된다
  VIDEO_ID: 'QpvVu0G7dtg',            // 유튜브 소개 영상 ID(youtube.com/watch?v=…). 비우면 영상 섹션을 숨긴다
  VIDEO_TITLE: '[닥터네스트] 서비스 소개 영상',
  KAKAO_CHAT_URL: 'https://pf.kakao.com/_Dxidin/chat',                 // 스트라디지 카카오톡 채널(채널명 '스트라디지') 1:1 채팅. 비우면 카카오 버튼을 숨긴다
  CONTACT_NAME: '담당자 정영훈 과장',   // 랜딩에 표시할 담당자 표기
  PHONE_RAW: '01020644352',
  PHONE_DISPLAY: '010-2064-4352',
  OFFICIAL_SITE: 'https://www.doctornest.ai',
  DEBUG: false                       // true면 콘솔에 트래킹 이벤트를 출력한다
};
