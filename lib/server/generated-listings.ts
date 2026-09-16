import 'server-only'

import type { Listing } from '@/lib/data'

type MakerModels = { maker: string; models: string[] }

type Template = {
  prefix: string
  category: Listing['category']
  image: string
  /** Models belong to their maker so generated names stay plausible. */
  makers: MakerModels[]
  mileageKm: [number, number]
  salePrice: [number, number]
  leasePerMonth: [number, number]
  tags: string[]
  summaries: string[]
}

const templates: Template[] = [
  {
    prefix: 'kei',
    category: '軽自動車',
    image: '/vehicles/kei-car.png',
    makers: [
      { maker: 'スズキ', models: ['アルト L', 'ワゴンR FZ', 'ハスラー G'] },
      { maker: 'ダイハツ', models: ['ミラ イース X', 'タント X', 'ムーヴ L'] },
      { maker: 'ホンダ', models: ['N-BOX カスタム', 'N-ONE オリジナル'] },
      { maker: '日産', models: ['デイズ ハイウェイスター', 'ルークス X'] },
      { maker: '三菱', models: ['eKワゴン M', 'eKクロス G'] },
    ],
    mileageKm: [8_000, 98_000],
    salePrice: [480_000, 1_580_000],
    leasePerMonth: [16_000, 32_000],
    tags: [
      '低走行',
      '禁煙車',
      '車検2年付',
      '燃費良好',
      'ワンオーナー',
      '整備記録あり',
    ],
    summaries: [
      '通勤と買い物にちょうどいい一台。点検整備を済ませてお渡しします。',
      '乗り替えに伴い出品。まず月額リースで乗り、合えば残価で買い取れます。',
      '走行距離少なめの保管車。近隣なら陸送の手配もご相談ください。',
    ],
  },
  {
    prefix: 'car',
    category: '乗用車',
    image: '/vehicles/sedan.png',
    makers: [
      {
        maker: 'トヨタ',
        models: ['プリウス Z', 'カローラ ツーリング W×B', 'アクア G'],
      },
      { maker: 'ホンダ', models: ['フィット ホーム', 'シビック EX'] },
      {
        maker: '日産',
        models: ['ノート e-POWER X', 'セレナ ハイウェイスター'],
      },
      { maker: 'マツダ', models: ['マツダ3 ファストバック', 'マツダ2 15S'] },
      { maker: 'スバル', models: ['インプレッサ スポーツ', 'レヴォーグ GT'] },
    ],
    mileageKm: [12_000, 128_000],
    salePrice: [780_000, 3_480_000],
    leasePerMonth: [24_000, 58_000],
    tags: [
      'ハイブリッド',
      '禁煙車',
      '整備記録あり',
      '純正ナビ',
      '衝突軽減ブレーキ',
      'ワンオーナー',
    ],
    summaries: [
      'ワンオーナーの記録簿付き。通勤の足として長く使える一台です。',
      '試乗歓迎。リース満了時の残価をあらかじめ提示できます。',
      '車検を通してお渡しします。任意保険や名義変更の相談も可能です。',
    ],
  },
  {
    prefix: 'suv',
    category: 'SUV',
    image: '/vehicles/suv.png',
    makers: [
      {
        maker: 'トヨタ',
        models: [
          'ハリアー Z',
          'RAV4 アドベンチャー',
          'ランドクルーザー プラド TX',
        ],
      },
      { maker: 'マツダ', models: ['CX-5 XD Lパッケージ', 'CX-30 20S'] },
      { maker: 'スバル', models: ['フォレスター X-BREAK', 'XV アドバンス'] },
      { maker: '日産', models: ['エクストレイル G', 'キックス X'] },
      { maker: '三菱', models: ['アウトランダー PHEV G', 'デリカD:5 P'] },
    ],
    mileageKm: [18_000, 142_000],
    salePrice: [1_280_000, 4_980_000],
    leasePerMonth: [32_000, 78_000],
    tags: [
      '4WD',
      'ディーゼル',
      'スタッドレス付',
      '寒冷地仕様',
      '7人乗り',
      'ルーフレール付',
    ],
    summaries: [
      '雪道に強い4WD。冬用タイヤを含めてお渡しできます。',
      'アウトドア向けの装備付き。週末だけ使いたい方の短期リースにも対応します。',
      '定期点検をディーラーで実施。遠方の方は陸送手配もご相談ください。',
    ],
  },
  {
    prefix: 'trk',
    category: 'トラック',
    image: '/vehicles/truck.png',
    makers: [
      {
        maker: 'いすゞ',
        models: ['エルフ 2tロング 平ボディ', 'エルフ 3t ウイング'],
      },
      {
        maker: '日野',
        models: ['デュトロ 3t 冷蔵冷凍車', 'レンジャー 4t 平ボディ'],
      },
      {
        maker: '三菱ふそう',
        models: ['キャンター 2t ダンプ', 'キャンター 3t 平ボディ'],
      },
      {
        maker: 'トヨタ',
        models: ['ダイナ 1.5t 高床', 'トヨエース 2t 平ボディ'],
      },
    ],
    mileageKm: [45_000, 380_000],
    salePrice: [980_000, 6_800_000],
    leasePerMonth: [48_000, 128_000],
    tags: [
      '平ボディ',
      '冷凍機付',
      '事業者向け',
      '点検済み',
      'ETC付',
      'パワーゲート付',
    ],
    summaries: [
      '整備工場で点検済みの小型トラック。繁忙期だけの増車にも使えます。',
      '導入前に使い勝手を試したい事業者向けに、月額リース中心でお貸しします。',
      '車検残あり。積載や架装の詳細はメッセージでお問い合わせください。',
    ],
  },
  {
    prefix: 'van',
    category: 'バン',
    image: '/vehicles/van.png',
    makers: [
      {
        maker: 'トヨタ',
        models: ['ハイエース バン スーパーGL', 'プロボックス GL'],
      },
      { maker: 'ホンダ', models: ['N-VAN +STYLE FUN', 'N-VAN L'] },
      {
        maker: 'ダイハツ',
        models: ['ハイゼット カーゴ クルーズ', 'アトレー RS'],
      },
      { maker: '日産', models: ['NV200 バネット GX', 'キャラバン DX'] },
      { maker: 'スズキ', models: ['エブリイ ワゴン PZ', 'エブリイ バン JOIN'] },
    ],
    mileageKm: [15_000, 165_000],
    salePrice: [680_000, 3_280_000],
    leasePerMonth: [22_000, 62_000],
    tags: [
      '広い荷室',
      '軽バン',
      '自動ブレーキ',
      '棚付',
      '4ナンバー',
      '整備記録あり',
    ],
    summaries: [
      '荷室が広く、配送や車中泊にも使える一台。棚の取り外しも相談できます。',
      '開業直後の方向けに月額リースを用意。台数を増やす時期だけの利用も歓迎です。',
      '荷室の傷は写真のとおりです。気になる点はお問い合わせください。',
    ],
  },
]

const locations: [string, string][] = [
  ['北海道', '札幌市'],
  ['北海道', '帯広市'],
  ['青森県', '弘前市'],
  ['岩手県', '花巻市'],
  ['宮城県', '仙台市'],
  ['秋田県', '横手市'],
  ['山形県', '鶴岡市'],
  ['福島県', '郡山市'],
  ['茨城県', 'つくば市'],
  ['栃木県', '宇都宮市'],
  ['埼玉県', '川口市'],
  ['千葉県', '船橋市'],
  ['東京都', '足立区'],
  ['神奈川県', '横浜市'],
  ['新潟県', '長岡市'],
  ['富山県', '砺波市'],
  ['石川県', '金沢市'],
  ['長野県', '松本市'],
  ['静岡県', '浜松市'],
  ['愛知県', '豊橋市'],
  ['滋賀県', '長浜市'],
  ['京都府', '京都市'],
  ['大阪府', '堺市'],
  ['兵庫県', '姫路市'],
  ['岡山県', '倉敷市'],
  ['広島県', '東広島市'],
  ['香川県', '高松市'],
  ['愛媛県', '西条市'],
  ['福岡県', '久留米市'],
  ['熊本県', '熊本市'],
]

type SeededSeller = { seller: Listing['seller']; ownerUserId: string }

const sellers: SeededSeller[] = [
  ['nakamura-motors', '中村モータース', '中古車販売店', 4.8, 34],
  ['sato-auto', '佐藤オート', 'ディーラー', 4.6, 58],
  ['tamura', '田村さん', '個人', 4.9, 21],
  ['kobayashi-trading', '小林商会', '法人', 4.7, 12],
  ['sky-lease', 'スカイリース', '法人', 4.5, 27],
  ['tokachi-auto', '十勝オート', 'ディーラー', 4.4, 41],
  ['takahashi', '高橋さん', '個人', 4.3, 9],
  ['yamada-cars', '山田カーズ', '中古車販売店', 4.7, 63],
  ['midori-motors', 'みどり自動車', 'ディーラー', 4.5, 88],
  ['watanabe', '渡辺さん', '個人', 5.0, 4],
].map(([ownerUserId, name, kind, rating, reviews]) => ({
  ownerUserId: ownerUserId as string,
  seller: {
    name: name as string,
    kind: kind as Listing['seller']['kind'],
    rating: rating as number,
    reviews: reviews as number,
  },
}))

const conditions: Listing['condition'][] = [
  '未使用に近い',
  '目立った傷なし',
  '使用感あり',
  '要整備',
]

/** Deterministic pseudo-random sequence so the sample data is stable. */
function createSequence(seed: number) {
  let state = seed
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648
    return state / 2_147_483_648
  }
}

function roundTo(value: number, unit: number): number {
  return Math.round(value / unit) * unit
}

/** Generated residual-lease listings credit 40% of the lease, capped at 25% of the price. */
function residualLeaseTerms(
  residualLease: boolean,
  salePrice: number | undefined,
): Pick<
  Listing,
  'residualLease' | 'residualLeaseCreditRate' | 'residualLeaseCreditCap'
> {
  if (!residualLease || salePrice === undefined) return { residualLease }
  return {
    residualLease,
    residualLeaseCreditRate: 40,
    residualLeaseCreditCap: roundTo(salePrice * 0.25, 10_000),
  }
}

const inspectionBaseMonth = 2026 * 12 + 9

/** Last day of a month between 1 and 24 months out, or none for an expired inspection. */
function inspectionExpiry(roll: number, offset: number): string | undefined {
  if (roll < 0.1) return undefined
  const month = inspectionBaseMonth + 1 + offset
  const end = new Date(Date.UTC(Math.floor(month / 12), month % 12, 0))
  return end.toISOString().slice(0, 10)
}

export function generateListings(count: number, startId: number): Listing[] {
  const next = createSequence(20_260_913)
  const pick = <T>(values: T[]): T => values[Math.floor(next() * values.length)]
  const between = (range: [number, number]) =>
    range[0] + next() * (range[1] - range[0])

  return Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length]
    const number = startId + index
    const { maker, models } = pick(template.makers)
    const model = pick(models)
    const deals: Listing['deals'] =
      next() < 0.15 ? ['sale'] : next() < 0.2 ? ['lease'] : ['sale', 'lease']
    const leasePerMonth = deals.includes('lease')
      ? roundTo(between(template.leasePerMonth), 1_000)
      : undefined
    const salePrice = deals.includes('sale')
      ? roundTo(between(template.salePrice), 10_000)
      : undefined
    const [prefecture, city] = pick(locations)
    const tags = [...new Set([pick(template.tags), pick(template.tags)])]
    const year = 2014 + Math.floor(next() * 12)
    const inspectionExpiresOn = inspectionExpiry(
      next(),
      Math.floor(next() * 24),
    )

    return {
      id: `${template.prefix}-${String(number).padStart(3, '0')}`,
      name: `${maker} ${model} ${year}年式`,
      category: template.category,
      maker,
      model,
      year,
      mileageKm: roundTo(between(template.mileageKm), 100),
      ...(inspectionExpiresOn === undefined ? {} : { inspectionExpiresOn }),
      condition: pick(conditions),
      prefecture,
      city,
      image: template.image,
      summary: pick(template.summaries),
      deals,
      salePrice,
      leasePerMonth,
      ...residualLeaseTerms(deals.length === 2 && next() < 0.6, salePrice),
      ...pick(sellers),
      tags,
    }
  })
}
