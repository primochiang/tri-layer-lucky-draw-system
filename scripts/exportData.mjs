import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

// === 參加者名單 ===
const ZONE_CLUBS = {
  '第一分區': ['南區', '逸仙', '逸天', '雲聯網', '逸澤', '黃埔', '逸新', '蘭亭鐵馬', '銀河'],
  '第四分區': ['南欣', '松山', '民生', '松青', '政愛', '添愛', '泰愛', '文化'],
  '第五分區': ['府門', '南陽', '明星', '風雲'],
};

const participants = [];
let idCounter = 1;
for (const [zone, clubs] of Object.entries(ZONE_CLUBS)) {
  for (const club of clubs) {
    for (let m = 1; m <= 20; m++) {
      participants.push({
        '編號': String(idCounter).padStart(3, '0'),
        '姓名': `社員 ${idCounter}`,
        '社團': club,
        '分區': zone,
        '職稱': m === 1 ? '社長' : '社員'
      });
      idCounter++;
    }
  }
}

const wb1 = XLSX.utils.book_new();
const ws1 = XLSX.utils.json_to_sheet(participants);
XLSX.utils.book_append_sheet(wb1, ws1, '參加者名單');
writeFileSync('參加者名單.xlsx', XLSX.write(wb1, { bookType: 'xlsx', type: 'buffer' }));
console.log(`參加者名單.xlsx - ${participants.length} 筆`);

// === 獎項清單 ===
const prizes = [];

// 第一階段 - 社長獎
const CLUB_PRIZES = [
  { zone: '第一分區', club: '南區', sponsor: 'Queenie', name: '社長獎', item: '紅包 $2,000', count: 3 },
  { zone: '第一分區', club: '逸仙', sponsor: 'Susan', name: '社長獎', item: '紅包 $1,000', count: 3 },
  { zone: '第一分區', club: '逸天', sponsor: 'Jim', name: '社長獎', item: '紅包 $1,000', count: 1 },
  { zone: '第一分區', club: '雲聯網', sponsor: 'Jennifer', name: '社長獎', item: '紅包 $1,000', count: 2 },
  { zone: '第一分區', club: '逸澤', sponsor: 'Andy', name: '社長獎', item: '紅包 $1,000', count: 2 },
  { zone: '第一分區', club: '黃埔', sponsor: 'Alex', name: '社長獎', item: '禮品一份', count: 1 },
  { zone: '第一分區', club: '逸新', sponsor: 'Sandy', name: '社長獎', item: '紅包 $1,000', count: 3 },
  { zone: '第一分區', club: '蘭亭鐵馬', sponsor: 'Wine', name: '社長獎', item: '酒 1 瓶', count: 1 },
  { zone: '第一分區', club: '銀河', sponsor: '', name: '社長獎', item: '待確認', count: 0 },
  { zone: '第四分區', club: '南欣', sponsor: 'William', name: '社長獎', item: 'Edenred即享卡 $1,000', count: 2 },
  { zone: '第四分區', club: '松山', sponsor: 'MB', name: '社長獎', item: '紅包 $1,000', count: 2 },
  { zone: '第四分區', club: '民生', sponsor: 'Dawson', name: '社長獎', item: '年節禮盒', count: 2 },
  { zone: '第四分區', club: '松青', sponsor: 'Tony', name: '社長獎', item: '紅包 $1,000', count: 2 },
  { zone: '第四分區', club: '政愛', sponsor: 'Alex', name: '社長獎', item: '連建興聯名款紅酒', count: 2 },
  { zone: '第四分區', club: '添愛', sponsor: 'Jerry', name: '社長獎', item: '威士忌酒', count: 2 },
  { zone: '第四分區', club: '泰愛', sponsor: 'Lian', name: '社長獎', item: '陶板屋套餐 (2張/份)', count: 2 },
  { zone: '第四分區', club: '文化', sponsor: 'Sky', name: '社長獎', item: '連建興聯名款紅酒', count: 2 },
  { zone: '第五分區', club: '府門', sponsor: 'Card', name: '社長獎', item: '紅包 $1,500', count: 3 },
  { zone: '第五分區', club: '南陽', sponsor: 'Michael', name: '社長獎', item: '紅包 $1,500', count: 3 },
  { zone: '第五分區', club: '明星', sponsor: 'Mandy', name: '社長獎', item: '紅包 $1,500', count: 3 },
  { zone: '第五分區', club: '風雲', sponsor: 'Reis', name: '社長獎', item: '紅包 $1,500', count: 3 },
];

for (const p of CLUB_PRIZES) {
  prizes.push({
    '階段': '第一階段',
    '分區': p.zone,
    '社團/職稱': p.club,
    '贊助人': p.sponsor,
    '獎項名稱': p.name,
    '獎品內容': p.item,
    '數量': p.count
  });
}

// 第二階段 - 分區長官獎
const ZONE_PRIZES = [
  { zone: '第一分區', title: 'CGS', sponsor: 'Catherine', name: '分區長官獎', item: '日式健走杖 (價值$3,500)', count: 1 },
  { zone: '第一分區', title: 'DAG', sponsor: 'Edward', name: '分區長官獎', item: '醫療級靈芝多醣體面膜 (價值$900/盒)', count: 3 },
  { zone: '第一分區', title: 'AG', sponsor: 'Amrita', name: '分區長官獎', item: '紅蔘精華飲 (價值$3,210/盒)', count: 10 },
  { zone: '第一分區', title: 'AG', sponsor: 'Amrita', name: '分區長官獎', item: '紅包 $3,000', count: 2 },
  { zone: '第四分區', title: 'CGS', sponsor: 'Olin', name: '分區長官獎', item: '紅包 $1,000', count: 2 },
  { zone: '第四分區', title: 'DAG', sponsor: 'Daniel', name: '分區長官獎', item: '央行馬年紀念幣', count: 20 },
  { zone: '第四分區', title: 'AG', sponsor: 'Fruit', name: '分區長官獎', item: '紐西蘭空運櫻桃', count: 10 },
  { zone: '第五分區', title: 'CGS', sponsor: 'Michelle', name: '分區長官獎', item: '紅包 $2,000', count: 3 },
  { zone: '第五分區', title: 'DAG', sponsor: 'Archi', name: '分區長官獎', item: '紅包 $2,000', count: 3 },
  { zone: '第五分區', title: 'AG', sponsor: 'Peter', name: '分區長官獎', item: '茶葉禮盒', count: 20 },
  { zone: '第五分區', title: 'AG', sponsor: 'Peter', name: '分區長官獎', item: '紅包 $3,000', count: 1 },
  { zone: '第五分區', title: 'AG', sponsor: 'Peter', name: '分區長官獎', item: '紅包 $2,000', count: 1 },
];

for (const p of ZONE_PRIZES) {
  prizes.push({
    '階段': '第二階段',
    '分區': p.zone,
    '社團/職稱': p.title,
    '贊助人': p.sponsor,
    '獎項名稱': p.name,
    '獎品內容': p.item,
    '數量': p.count
  });
}

// 第三階段 - 特別獎
const DISTRICT_PRIZES = [
  { title: 'DG', sponsor: 'Jenny', name: '總監獎', item: '皇家禮炮威士忌酒 21年份', count: 1 },
  { title: 'DGE', sponsor: 'Jessy', name: '總監當選人獎', item: '曼谷來回機票', count: 1 },
  { title: 'DGN', sponsor: 'Joy', name: '總監提名人獎', item: '紅包 $3,000', count: 1 },
  { title: 'DGND', sponsor: 'Y.C', name: '指定總監提名人獎', item: '禮品 1 份', count: 1 },
  { title: 'DS', sponsor: 'Steven', name: '地區秘書長獎', item: '家樂福禮券 $5,000', count: 1 },
  { title: 'PDG', sponsor: 'Jack Chu', name: '前總監獎', item: '紅包 $3,000', count: 1 },
  { title: 'PDG', sponsor: 'Tiffany', name: '前總監獎', item: '絲巾一條', count: 1 },
];

for (const p of DISTRICT_PRIZES) {
  prizes.push({
    '階段': '第三階段',
    '分區': '地區',
    '社團/職稱': p.title,
    '贊助人': p.sponsor,
    '獎項名稱': p.name,
    '獎品內容': p.item,
    '數量': p.count
  });
}

const wb2 = XLSX.utils.book_new();
const ws2 = XLSX.utils.json_to_sheet(prizes);
XLSX.utils.book_append_sheet(wb2, ws2, '獎項清單');
writeFileSync('獎項清單.xlsx', XLSX.write(wb2, { bookType: 'xlsx', type: 'buffer' }));
console.log(`獎項清單.xlsx - ${prizes.length} 筆`);
