import { PrizeConfig } from './types';

// 第一階段 - 社長獎 (Layer C - 社團抽獎)
export interface ClubPrizeConfig {
  zone: string;
  club: string;
  sponsor: string;
  prizes: PrizeConfig[];
}

// 第一分區社長獎
export const ZONE1_CLUB_PRIZES: ClubPrizeConfig[] = [
  {
    zone: '第一分區',
    club: '南區',
    sponsor: 'Queenie',
    prizes: [
      { id: 'z1-nanqu-1', name: '社長獎', itemName: '紅包 $2,000', totalCount: 3, sponsor: 'Queenie' }
    ]
  },
  {
    zone: '第一分區',
    club: '逸仙',
    sponsor: 'Susan',
    prizes: [
      { id: 'z1-yixian-1', name: '社長獎', itemName: '紅包 $1,000', totalCount: 3, sponsor: 'Susan' }
    ]
  },
  {
    zone: '第一分區',
    club: '逸天',
    sponsor: 'Jim',
    prizes: [
      { id: 'z1-yitian-1', name: '社長獎', itemName: '紅包 $1,000', totalCount: 1, sponsor: 'Jim' }
    ]
  },
  {
    zone: '第一分區',
    club: '雲聯網',
    sponsor: 'Jennifer',
    prizes: [
      { id: 'z1-yunlian-1', name: '社長獎', itemName: '紅包 $1,000', totalCount: 2, sponsor: 'Jennifer' }
    ]
  },
  {
    zone: '第一分區',
    club: '逸澤',
    sponsor: 'Andy',
    prizes: [
      { id: 'z1-yize-1', name: '社長獎', itemName: '紅包 $1,000', totalCount: 2, sponsor: 'Andy' }
    ]
  },
  {
    zone: '第一分區',
    club: '黃埔',
    sponsor: 'Alex',
    prizes: [
      { id: 'z1-huangpu-1', name: '社長獎', itemName: '禮品一份', totalCount: 1, sponsor: 'Alex' }
    ]
  },
  {
    zone: '第一分區',
    club: '逸新',
    sponsor: 'Sandy',
    prizes: [
      { id: 'z1-yixin-1', name: '社長獎', itemName: '紅包 $1,000', totalCount: 3, sponsor: 'Sandy' }
    ]
  },
  {
    zone: '第一分區',
    club: '蘭亭鐵馬',
    sponsor: 'Wine',
    prizes: [
      { id: 'z1-lanting-1', name: '社長獎', itemName: '酒 1 瓶', totalCount: 1, sponsor: 'Wine' }
    ]
  },
  {
    zone: '第一分區',
    club: '銀河',
    sponsor: '',
    prizes: [
      { id: 'z1-yinhe-1', name: '社長獎', itemName: '待確認', totalCount: 0, sponsor: '' }
    ]
  }
];

// 第四分區社長獎
export const ZONE4_CLUB_PRIZES: ClubPrizeConfig[] = [
  {
    zone: '第四分區',
    club: '南欣',
    sponsor: 'William',
    prizes: [
      { id: 'z4-nanxin-1', name: '社長獎', itemName: 'Edenred即享卡 $1,000', totalCount: 2, sponsor: 'William' }
    ]
  },
  {
    zone: '第四分區',
    club: '松山',
    sponsor: 'MB',
    prizes: [
      { id: 'z4-songshan-1', name: '社長獎', itemName: '紅包 $1,000', totalCount: 2, sponsor: 'MB' }
    ]
  },
  {
    zone: '第四分區',
    club: '民生',
    sponsor: 'Dawson',
    prizes: [
      { id: 'z4-minsheng-1', name: '社長獎', itemName: '年節禮盒', totalCount: 2, sponsor: 'Dawson' }
    ]
  },
  {
    zone: '第四分區',
    club: '松青',
    sponsor: 'Tony',
    prizes: [
      { id: 'z4-songqing-1', name: '社長獎', itemName: '紅包 $1,000', totalCount: 2, sponsor: 'Tony' }
    ]
  },
  {
    zone: '第四分區',
    club: '政愛',
    sponsor: 'Alex',
    prizes: [
      { id: 'z4-zhengai-1', name: '社長獎', itemName: '連建興聯名款紅酒', totalCount: 2, sponsor: 'Alex' }
    ]
  },
  {
    zone: '第四分區',
    club: '添愛',
    sponsor: 'Jerry',
    prizes: [
      { id: 'z4-tianai-1', name: '社長獎', itemName: '威士忌酒', totalCount: 2, sponsor: 'Jerry' }
    ]
  },
  {
    zone: '第四分區',
    club: '泰愛',
    sponsor: 'Lian',
    prizes: [
      { id: 'z4-taiai-1', name: '社長獎', itemName: '陶板屋套餐 (2張/份)', totalCount: 2, sponsor: 'Lian' }
    ]
  },
  {
    zone: '第四分區',
    club: '文化',
    sponsor: 'Sky',
    prizes: [
      { id: 'z4-wenhua-1', name: '社長獎', itemName: '連建興聯名款紅酒', totalCount: 2, sponsor: 'Sky' }
    ]
  }
];

// 第五分區社長獎
export const ZONE5_CLUB_PRIZES: ClubPrizeConfig[] = [
  {
    zone: '第五分區',
    club: '府門',
    sponsor: 'Card',
    prizes: [
      { id: 'z5-fumen-1', name: '社長獎', itemName: '紅包 $1,500', totalCount: 3, sponsor: 'Card' }
    ]
  },
  {
    zone: '第五分區',
    club: '南陽',
    sponsor: 'Michael',
    prizes: [
      { id: 'z5-nanyang-1', name: '社長獎', itemName: '紅包 $1,500', totalCount: 3, sponsor: 'Michael' }
    ]
  },
  {
    zone: '第五分區',
    club: '明星',
    sponsor: 'Mandy',
    prizes: [
      { id: 'z5-mingxing-1', name: '社長獎', itemName: '紅包 $1,500', totalCount: 3, sponsor: 'Mandy' }
    ]
  },
  {
    zone: '第五分區',
    club: '風雲',
    sponsor: 'Reis',
    prizes: [
      { id: 'z5-fengyun-1', name: '社長獎', itemName: '紅包 $1,500', totalCount: 3, sponsor: 'Reis' }
    ]
  }
];

// 所有社長獎 (第一階段)
export const ALL_CLUB_PRIZES: ClubPrizeConfig[] = [
  ...ZONE1_CLUB_PRIZES,
  ...ZONE4_CLUB_PRIZES,
  ...ZONE5_CLUB_PRIZES
];

// 第二階段 - 分區長官獎 (Layer B - 分區抽獎)
export interface ZonePrizeConfig {
  zone: string;
  title: string;
  sponsor: string;
  prizes: PrizeConfig[];
}

export const ZONE1_OFFICER_PRIZES: ZonePrizeConfig[] = [
  {
    zone: '第一分區',
    title: 'CGS',
    sponsor: 'Catherine',
    prizes: [
      { id: 'z1-cgs-1', name: '分區長官獎', itemName: '日式健走杖 (價值$3,500)', totalCount: 1, sponsor: 'Catherine' }
    ]
  },
  {
    zone: '第一分區',
    title: 'DAG',
    sponsor: 'Edward',
    prizes: [
      { id: 'z1-dag-1', name: '分區長官獎', itemName: '醫療級靈芝多醣體面膜 (價值$900/盒)', totalCount: 3, sponsor: 'Edward' }
    ]
  },
  {
    zone: '第一分區',
    title: 'AG',
    sponsor: 'Amrita',
    prizes: [
      { id: 'z1-ag-1', name: '分區長官獎', itemName: '紅蔘精華飲 (價值$3,210/盒)', totalCount: 10, sponsor: 'Amrita' },
      { id: 'z1-ag-2', name: '分區長官獎', itemName: '紅包 $3,000', totalCount: 2, sponsor: 'Amrita' }
    ]
  }
];

export const ZONE4_OFFICER_PRIZES: ZonePrizeConfig[] = [
  {
    zone: '第四分區',
    title: 'CGS',
    sponsor: 'Olin',
    prizes: [
      { id: 'z4-cgs-1', name: '分區長官獎', itemName: '紅包 $1,000', totalCount: 2, sponsor: 'Olin' }
    ]
  },
  {
    zone: '第四分區',
    title: 'DAG',
    sponsor: 'Daniel',
    prizes: [
      { id: 'z4-dag-1', name: '分區長官獎', itemName: '央行馬年紀念幣', totalCount: 20, sponsor: 'Daniel' }
    ]
  },
  {
    zone: '第四分區',
    title: 'AG',
    sponsor: 'Fruit',
    prizes: [
      { id: 'z4-ag-1', name: '分區長官獎', itemName: '紐西蘭空運櫻桃', totalCount: 10, sponsor: 'Fruit' }
    ]
  }
];

export const ZONE5_OFFICER_PRIZES: ZonePrizeConfig[] = [
  {
    zone: '第五分區',
    title: 'CGS',
    sponsor: 'Michelle',
    prizes: [
      { id: 'z5-cgs-1', name: '分區長官獎', itemName: '紅包 $2,000', totalCount: 3, sponsor: 'Michelle' }
    ]
  },
  {
    zone: '第五分區',
    title: 'DAG',
    sponsor: 'Archi',
    prizes: [
      { id: 'z5-dag-1', name: '分區長官獎', itemName: '紅包 $2,000', totalCount: 3, sponsor: 'Archi' }
    ]
  },
  {
    zone: '第五分區',
    title: 'AG',
    sponsor: 'Peter',
    prizes: [
      { id: 'z5-ag-1', name: '分區長官獎', itemName: '茶葉禮盒', totalCount: 20, sponsor: 'Peter' },
      { id: 'z5-ag-2', name: '分區長官獎', itemName: '紅包 $3,000', totalCount: 1, sponsor: 'Peter' },
      { id: 'z5-ag-3', name: '分區長官獎', itemName: '紅包 $2,000', totalCount: 1, sponsor: 'Peter' }
    ]
  }
];

// 所有分區長官獎 (第二階段)
export const ALL_ZONE_OFFICER_PRIZES: ZonePrizeConfig[] = [
  ...ZONE1_OFFICER_PRIZES,
  ...ZONE4_OFFICER_PRIZES,
  ...ZONE5_OFFICER_PRIZES
];

// 第三階段 - 特別獎 (Layer A - 全體抽獎)
export interface DistrictPrizeConfig {
  title: string;
  sponsor: string;
  prizes: PrizeConfig[];
}

export const DISTRICT_PRIZES: DistrictPrizeConfig[] = [
  {
    title: 'DG',
    sponsor: 'Jenny',
    prizes: [
      { id: 'dist-dg-1', name: '總監獎', itemName: '皇家禮炮威士忌酒 21年份', totalCount: 1, sponsor: 'Jenny' }
    ]
  },
  {
    title: 'DGE',
    sponsor: 'Jessy',
    prizes: [
      { id: 'dist-dge-1', name: '總監當選人獎', itemName: '曼谷來回機票', totalCount: 1, sponsor: 'Jessy' }
    ]
  },
  {
    title: 'DGN',
    sponsor: 'Joy',
    prizes: [
      { id: 'dist-dgn-1', name: '總監提名人獎', itemName: '紅包 $3,000', totalCount: 1, sponsor: 'Joy' }
    ]
  },
  {
    title: 'DGND',
    sponsor: 'Y.C',
    prizes: [
      { id: 'dist-dgnd-1', name: '指定總監提名人獎', itemName: '禮品 1 份', totalCount: 1, sponsor: 'Y.C' }
    ]
  },
  {
    title: 'DS',
    sponsor: 'Steven',
    prizes: [
      { id: 'dist-ds-1', name: '地區秘書長獎', itemName: '家樂福禮券 $5,000', totalCount: 1, sponsor: 'Steven' }
    ]
  },
  {
    title: 'PDG',
    sponsor: 'Jack Chu',
    prizes: [
      { id: 'dist-pdg-1', name: '前總監獎', itemName: '紅包 $3,000', totalCount: 1, sponsor: 'Jack Chu' }
    ]
  },
  {
    title: 'PDG',
    sponsor: 'Tiffany',
    prizes: [
      { id: 'dist-pdg-2', name: '前總監獎', itemName: '絲巾一條', totalCount: 1, sponsor: 'Tiffany' }
    ]
  }
];

// Helper function to get club prizes by zone
export const getClubPrizesByZone = (zone: string): ClubPrizeConfig[] => {
  return ALL_CLUB_PRIZES.filter(p => p.zone === zone);
};

// Helper function to get club prizes by club name
export const getClubPrizesByClub = (club: string): ClubPrizeConfig | undefined => {
  return ALL_CLUB_PRIZES.find(p => p.club === club);
};

// Helper function to get zone officer prizes by zone
export const getZoneOfficerPrizesByZone = (zone: string): ZonePrizeConfig[] => {
  return ALL_ZONE_OFFICER_PRIZES.filter(p => p.zone === zone);
};

// Get all prizes as flat PrizeConfig array for a specific club
export const getFlatClubPrizes = (club: string): PrizeConfig[] => {
  const clubConfig = getClubPrizesByClub(club);
  return clubConfig ? clubConfig.prizes : [];
};

// Get all prizes as flat PrizeConfig array for a specific zone (officer prizes)
export const getFlatZonePrizes = (zone: string): PrizeConfig[] => {
  const zoneConfigs = getZoneOfficerPrizesByZone(zone);
  return zoneConfigs.flatMap(c => c.prizes);
};

// Get all district prizes as flat PrizeConfig array
export const getFlatDistrictPrizes = (): PrizeConfig[] => {
  return DISTRICT_PRIZES.flatMap(d => d.prizes);
};

// Summary statistics
export const getPrizeSummary = () => {
  const clubPrizeCount = ALL_CLUB_PRIZES.reduce(
    (sum, c) => sum + c.prizes.reduce((s, p) => s + p.totalCount, 0),
    0
  );
  const zonePrizeCount = ALL_ZONE_OFFICER_PRIZES.reduce(
    (sum, z) => sum + z.prizes.reduce((s, p) => s + p.totalCount, 0),
    0
  );
  const districtPrizeCount = DISTRICT_PRIZES.reduce(
    (sum, d) => sum + d.prizes.reduce((s, p) => s + p.totalCount, 0),
    0
  );

  return {
    stage1: { name: '第一階段-社長獎', count: clubPrizeCount },
    stage2: { name: '第二階段-分區長官獎', count: zonePrizeCount },
    stage3: { name: '第三階段-特別獎', count: districtPrizeCount },
    total: clubPrizeCount + zonePrizeCount + districtPrizeCount
  };
};
