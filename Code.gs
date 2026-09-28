/**
 * 👑 공주님 옷 입히기 게임 - Google Apps Script 서버 코드
 *
 * 사용 방법
 *  1. script.google.com 에서 새 프로젝트를 만듭니다.
 *  2. 이 파일 내용을 Code.gs 에 붙여 넣습니다.
 *  3. [+] > HTML 로 "Index" 라는 파일을 만들고 Index.html 내용을 붙여 넣습니다.
 *  4. 배포 > 새 배포 > 유형: 웹 앱 으로 배포하면 게임 주소가 생깁니다.
 */

var SLOT_COUNT = 3;
var PROP_PREFIX = 'princess_outfit_';

// 저장할 수 있는 항목(키)과 허용되는 값 형식
var OUTFIT_KEYS = [
  'bg', 'skin', 'hair', 'hairColor', 'face', 'dress', 'dressColor',
  'shoes', 'shoeColor', 'crown', 'necklace', 'item', 'name'
];

/** 웹 앱 주소로 접속하면 게임 화면을 보여줍니다. */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('👑 공주님 옷 입히기')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 저장된 옷차림 목록(슬롯 1~3)을 돌려줍니다.
 * 저장된 적이 없는 슬롯은 null 입니다.
 */
function getOutfits() {
  var props = PropertiesService.getUserProperties();
  var list = [];
  for (var i = 1; i <= SLOT_COUNT; i++) {
    var raw = props.getProperty(PROP_PREFIX + i);
    var item = null;
    if (raw) {
      try {
        item = JSON.parse(raw);
      } catch (e) {
        item = null;
      }
    }
    list.push(item);
  }
  return list;
}

/**
 * 옷차림을 슬롯에 저장합니다.
 * @param {number} slot 1 ~ 3
 * @param {Object} outfit 옷차림 정보
 */
function saveOutfit(slot, outfit) {
  slot = Number(slot);
  if (!(slot >= 1 && slot <= SLOT_COUNT && Math.floor(slot) === slot)) {
    throw new Error('저장 칸 번호가 올바르지 않아요.');
  }
  var clean = sanitizeOutfit_(outfit);
  clean.savedAt = new Date().toISOString();
  PropertiesService.getUserProperties()
    .setProperty(PROP_PREFIX + slot, JSON.stringify(clean));
  return clean;
}

/** 슬롯을 비웁니다. */
function deleteOutfit(slot) {
  slot = Number(slot);
  if (!(slot >= 1 && slot <= SLOT_COUNT)) {
    throw new Error('저장 칸 번호가 올바르지 않아요.');
  }
  PropertiesService.getUserProperties().deleteProperty(PROP_PREFIX + slot);
  return true;
}

/** 알 수 없는 값이 저장되지 않도록 정리합니다. */
function sanitizeOutfit_(outfit) {
  if (!outfit || typeof outfit !== 'object') {
    throw new Error('저장할 옷차림이 없어요.');
  }
  var clean = {};
  OUTFIT_KEYS.forEach(function (key) {
    var value = outfit[key];
    if (value === undefined || value === null) return;
    value = String(value);
    if (/Color$|^skin$/.test(key)) {
      if (!/^#[0-9a-fA-F]{6}$/.test(value)) return;
    } else if (key === 'name') {
      value = value.slice(0, 12);
    } else if (!/^[a-z]{1,20}$/.test(value)) {
      return;
    }
    clean[key] = value;
  });
  return clean;
}
