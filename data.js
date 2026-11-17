// 感覚器官あての問題を作る（ブラウザと node の両方で使う）。
// 中身は、千葉県教育委員会の中学2年理科問題・枚方市立中宮中学校の学習指導案（大阪府教育センター掲載）・群馬県教育委員会の学習指導案・札幌市教育委員会の学習課題（下の SRC。2026-11-17 に読んだ）で確かめたことだけ。
// 1問は、説明を読んで、感覚器官（目・耳・鼻・舌・皮膚）を選ぶ。正解したら2段目「何を感じる？」を選ぶ。
// 臓器全体は「人体のしくみ」で扱う。
// 選び肢は、ほかの4つから選ぶ（やさしいは2つ、ふつう・むずかしいは3つ）。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    chiba: ["千葉県教育委員会 中学2年理科「生物の体のつくりと働き（刺激と反応）」", "https://www.pref.chiba.lg.jp/kyouiku/shidou/gakuryoku/yaruki/rika/documents/18r02.pdf"],
    oskc: ["枚方市立中宮中学校 学習指導案「感覚と運動のしくみ」（大阪府教育センター）", "https://www.osaka-c.ed.jp/kate/rika1/kenkyuu-kyouzai/yuugou-digital/H20sidouan/H2013.pdf"],
    gunma: ["群馬県教育委員会 理科学習指導案「行動のしくみ」", "https://gunma-boe.gsn.ed.jp/wysiwyg/file/download/506/1541"],
    sap: ["札幌市教育委員会 中学2年理科 学習課題「刺激と反応」", "https://www.city.sapporo.jp/kyoiku/shido/documents/2_2_4_17.pdf"],
  };

  // 答えになる5つ
  const CLASSES = ["目", "耳", "鼻", "舌", "皮膚"];

  // 2段目「何を感じる？」の3つ（枚方市立中宮中学校の学習指導案の言い方）
  const GROUPS = {
    miru: { name: "見る・聞く", sub: "光や音を受け取る" },
    kagu: { name: "嗅ぐ・味わう", sub: "においや味を受け取る" },
    itami: { name: "痛みや熱さを感じる", sub: "危険を知る" },
  };
  // 受け取る刺激（「なぜ」に出す。千葉県の問題）
  const CATS = { hikari: "光", oto: "音", nioi: "におい", aji: "味", ondo: "温度・痛み" };
  // 答えごとの決まり。2段目・刺激・決め手はこの表で決まる（qa/run.mjs が別に持った表でも確かめる）
  const RULE = {
    "目": { grp: "miru", cat: "hikari", key: "目は、光を刺激として受け取る感覚器官です。網膜で光を受け取ります。" },
    "耳": { grp: "miru", cat: "oto", key: "耳は、音を刺激として受け取る感覚器官です。" },
    "鼻": { grp: "kagu", cat: "nioi", key: "鼻は、においを刺激として受け取る感覚器官です。" },
    "舌": { grp: "kagu", cat: "aji", key: "舌は、味を刺激として受け取る感覚器官です。" },
    "皮膚": { grp: "itami", cat: "ondo", key: "皮膚は、温度や痛みなどを刺激として受け取る感覚器官です。" },
  };

  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  const MEDIA = ["理科室で", "理科の授業で", "実験ノートで", "家で", "テスト勉強で"];
  // 問いの前につく言い方（どれでも答えは同じ）
  const PRE = ["理科の授業で。", "プリントの問題。", "教科書のまとめ。", "テスト勉強で。", "ノートより。"];

  // どれかを当てる問題。ans：答え、sit：言い方。選び肢は、ほかの4つから（やさしいは2つ、ふつう・むずかしいは3つ）
  function which(ans, sit) {
    const near = CLASSES.filter((c) => c !== ans);
    return (R, lv) => {
      const si = ri(R, 0, sit.length - 1), mi = ri(R, 0, MEDIA.length - 1);
      const n = lv === 0 ? 2 : 3, ds = pickN(R, near, n);
      const q = sit[si] + "　どの感覚器官？";
      return { type: "act", media: MEDIA[mi], q, opts: shuffle(R, [ans, ...ds]), ans, rev: false, v: `${si}:${mi}` };
    };
  }
  // 1つの種類を作る。grp・cat・key は答えの決まり RULE から。clue は手がかりの文（PRE と組む）
  function K(id, lv, ans, name, src, look, why, clue) {
    const r = RULE[ans];
    return { id, lv, grp: r.grp, cat: r.cat, ans, name, src, look, key: r.key, why, make: which(ans, clue.flatMap((c) => PRE.map((p) => p + c))) };
  }

  const KINDS = [
    // ---- やさしい ----
    K("m_hikari", 0, "目", "光を受け取る", ["chiba"], "見るための器官です。",
      "千葉県の問題では、目が受け取る刺激は光です。光を刺激として受け取るのは網膜です。",
      ["光を刺激として受け取る感覚器官。"]),
    K("k_oto", 0, "耳", "音を受け取る", ["chiba"], "聞くための器官です。",
      "千葉県の問題では、耳が受け取る刺激は音です。",
      ["音を刺激として受け取る感覚器官。"]),
    K("h_nioi", 0, "鼻", "においを受け取る", ["chiba"], "嗅ぐための器官です。",
      "千葉県の問題では、鼻が受け取る刺激はにおいです。",
      ["においを刺激として受け取る感覚器官。"]),
    K("s_aji", 0, "舌", "味を受け取る", ["chiba"], "味わうための器官です。",
      "千葉県の問題では、舌が受け取る刺激は味です。",
      ["味を刺激として受け取る感覚器官。"]),
    K("f_itami", 0, "皮膚", "痛みや熱さ", ["oskc"], "体の表面をおおっています。",
      "痛みや熱さなどを感じる部分は、危険を知るためにあります（枚方市立中宮中学校の学習指導案）。",
      ["痛みや熱さなどを感じて、危険を知るための感覚器官。"]),
    // ---- ふつう ----
    K("m_kousai", 1, "目", "虹彩と網膜", ["chiba"], "光の量を調節するつくりがあります。",
      "目には虹彩・角膜・水晶体・網膜があり、虹彩が入る光の量を調節し、網膜が光を刺激として受け取ります（千葉県の問題）。",
      ["虹彩で入る光の量を調節し、網膜で光を受け取る感覚器官。"]),
    K("k_start", 1, "耳", "スタートの合図", ["gunma"], "合図は音です。",
      "100mのスタートのとき、走者は耳で音を聞いて反応します（群馬県の学習指導案）。",
      ["100mのスタートで、走者が合図の音を聞いて反応するときに使う感覚器官。"]),
    K("h_kagu", 1, "鼻", "嗅ぐ", ["oskc"], "においにかかわる器官です。",
      "枚方市立中宮中学校の学習指導案では、鼻のはたらきを「嗅ぐ（におい）」とまとめています。",
      ["まわりのにおいを嗅いで、情報を得る感覚器官。"]),
    K("s_anzen", 1, "舌", "安全な食べ物か", ["oskc"], "味で判断します。",
      "舌は、味によって安全な食べ物かどうかを判断するための情報を得る器官です（枚方市立中宮中学校の学習指導案）。",
      ["味によって、安全な食べ物かどうかを判断するための情報を得る感覚器官。"]),
    K("f_ondo", 1, "皮膚", "温度を受け取る", ["chiba"], "ふれた所で感じます。",
      "千葉県の問題では、温度という刺激を皮膚（皮ふ）という感覚器官でとらえます。",
      ["温度という刺激を受け取る感覚器官。"]),
    // ---- むずかしい ----
    K("m_monosashi", 2, "目", "ものさしをつかむ実験", ["gunma"], "落ちるのを見て反応します。",
      "ものさしが落ちるという刺激を目で受け取り、感覚神経→脳→せきずい→運動神経と伝わって、手がものさしをつかみます（群馬県の学習指導案）。",
      ["落ちるものさしをつかむ実験で、ものさしが落ちるのを受け取る感覚器官。"]),
    K("k_flying", 2, "耳", "フライングの判定", ["sap"], "合図は鳴るものです。",
      "陸上競技のフライング判定は、合図が鳴ってから0.100秒未満でスタートした場合と定められています（札幌市の学習課題）。",
      ["合図が鳴ってから0.100秒未満のスタートはフライング。この合図を受け取る感覚器官。"]),
    K("h_hebi", 2, "鼻", "ヘビとくらべる", ["oskc"], "ヒトではにおいを感じる器官です。",
      "ヘビでは、顔についている鼻は呼吸のために使われ、においは別の部分で感じます（枚方市立中宮中学校の学習指導案）。ヒトでは鼻がにおいを受け取ります。",
      ["ヘビでは呼吸のために使われ、においは別の部分で感じるが、ヒトではにおいを受け取る感覚器官。"]),
    K("s_bunpu", 2, "舌", "味の細胞の分布", ["oskc"], "味を感じる細胞があります。",
      "枚方市立中宮中学校の学習指導案では、砂糖・塩・酢・センブリを使って、味覚細胞の分布を調べます。",
      ["砂糖・塩・酢・センブリを使って、味を感じる細胞の分布を調べる感覚器官。"]),
    K("f_hansha", 2, "皮膚", "反射のはじまり", ["chiba"], "温度をとらえます。",
      "千葉県の問題では、温度という刺激を皮ふでとらえ、感覚神経からせきずいを通って反応が起こる反射を考えます。",
      ["温度という刺激をとらえ、信号が感覚神経からせきずいに伝わる反射のはじまりになる感覚器官。"]),
  ];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // 1問を作る。tag は「種類|種」（例 "m_hikari|2026-11-18:d0"）。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = Object.prototype.hasOwnProperty.call(BY, kind) ? BY[kind] : null; // 継承した constructor などは知らない種類として扱う（CodeRabbit 2026-11-17）
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, why: k.why, grp: k.grp, cat: k.cat, src: k.src.map((s) => SRC[s]), ...p };
  }
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const KKA = { KINDS, BY, GROUPS, CATS, RULE, LV, SRC, CLASSES, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = KKA; else root.KKA = KKA;
})(typeof self !== "undefined" ? self : this);
