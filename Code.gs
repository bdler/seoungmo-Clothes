/**
 * 👑 공주님 옷 입히기 (끌어다 놓는 옷 입히기 게임) - Google Apps Script 서버 코드
 *
 * 사용 방법
 *  1. script.google.com 에서 새 프로젝트를 만듭니다.
 *  2. 이 파일 내용을 Code.gs 에 붙여 넣습니다.
 *  3. [+] > HTML 로 "Index" 라는 파일을 만들고 Index.html 내용을 붙여 넣습니다.
 *  4. 배포 > 새 배포 > 유형: 웹 앱 으로 배포하면 게임 주소가 생깁니다.
 */

var SLOT_COUNT = 3;
var PROP_PREFIX = 'princess_dressup_';

// 공주님이 입을 수 있는 자리(부위) 목록
var WEAR_SLOTS = [
  'socks', 'shoes', 'bottom', 'top', 'dress', 'outer',
  'necklace', 'glasses', 'head', 'bag', 'hand'
];

/** 웹 앱 주소로 접속하면 게임 화면을 보여줍니다. */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('👑 공주님 옷 입히기')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 저장된 옷차림 목록(서랍 1~3)을 돌려줍니다.
 * 비어 있는 서랍은 null 입니다.
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
 * 옷차림을 서랍에 저장합니다.
 * @param {number} slot 1 ~ 3
 * @param {Object} outfit { art, princess, hair, hairColor, skin, worn: { top: 'top_heart', ... } }
 */
function saveOutfit(slot, outfit) {
  slot = checkSlot_(slot);
  var clean = sanitizeOutfit_(outfit);
  clean.savedAt = new Date().toISOString();
  PropertiesService.getUserProperties()
    .setProperty(PROP_PREFIX + slot, JSON.stringify(clean));
  return clean;
}

/** 서랍을 비웁니다. */
function deleteOutfit(slot) {
  slot = checkSlot_(slot);
  PropertiesService.getUserProperties().deleteProperty(PROP_PREFIX + slot);
  return true;
}

function checkSlot_(slot) {
  slot = Number(slot);
  if (!(slot >= 1 && slot <= SLOT_COUNT && Math.floor(slot) === slot)) {
    throw new Error('서랍 번호가 올바르지 않아요.');
  }
  return slot;
}

/** 알 수 없는 값이 저장되지 않도록 정리합니다. */
function sanitizeOutfit_(outfit) {
  if (!outfit || typeof outfit !== 'object') {
    throw new Error('저장할 옷차림이 없어요.');
  }
  var hex = /^#[0-9a-fA-F]{6}$/;
  var clean = { worn: {} };
  if (outfit.art === 'ai' || outfit.art === 'draw') clean.art = outfit.art;
  if (/^[a-z]{1,12}$/.test(String(outfit.princess || ''))) clean.princess = String(outfit.princess);
  if (/^[a-z]{1,20}$/.test(String(outfit.hair || ''))) clean.hair = String(outfit.hair);
  if (hex.test(String(outfit.hairColor || ''))) clean.hairColor = String(outfit.hairColor);
  if (hex.test(String(outfit.skin || ''))) clean.skin = String(outfit.skin);
  var worn = outfit.worn && typeof outfit.worn === 'object' ? outfit.worn : {};
  WEAR_SLOTS.forEach(function (slot) {
    var id = worn[slot];
    if (id && /^[a-z_]{1,30}$/.test(String(id))) clean.worn[slot] = String(id);
  });
  return clean;
}
