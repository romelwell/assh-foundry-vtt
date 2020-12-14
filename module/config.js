export const ASSH = {
  scores: {
    str: "ASSH.scores.str.long",
    int: "ASSH.scores.int.long",
    dex: "ASSH.scores.dex.long",
    wis: "ASSH.scores.wis.long",
    con: "ASSH.scores.con.long",
    cha: "ASSH.scores.cha.long",
  },
  roll_type: {
    result: "=",
    above: "≥",
    below: "≤"
  },
  saves_short: {
    savingThrow: "ASSH.saves.savingThrow.short",
    death: "ASSH.saves.death.short",
    transformation: "ASSH.saves.transformation.short",
    device: "ASSH.saves.device.short",
    avoidance: "ASSH.saves.avoidance.short",
    sorcery: "ASSH.saves.sorcery.short",
    magic: "ASSH.saves.magic.short"
  },
  saves_long: {
    savingThrow: "ASSH.saves.savingThrow.long",
    death: "ASSH.saves.death.long",
    transformation: "ASSH.saves.transformation.long",
    device: "ASSH.saves.device.long",
    avoidance: "ASSH.saves.avoidance.long",
    sorcery: "ASSH.saves.sorcery.long",
    magic: "ASSH.saves.magic.long"
  },
  armor : {
    unarmored: "ASSH.armor.unarmored",
    light: "ASSH.armor.light",
    medium: "ASSH.armor.medium",
    heavy: "ASSH.armor.heavy",
    shield: "ASSH.armor.shield",
  },
  colors: {
    green: "ASSH.colors.green",
    red: "ASSH.colors.red",
    yellow: "ASSH.colors.yellow",
    purple: "ASSH.colors.purple",
    blue: "ASSH.colors.blue",
    orange: "ASSH.colors.orange",
    white: "ASSH.colors.white"
  },
  languages: [
    "Common",
    "Esquimaux (Coastal dialect",
    "Esquimaux (Tundra dialect)",
    "Hellenic (Amazon dialect)",
    "Hellenic (Atlantean dialect)",
    "Hellenic (Hyperborean dialect)",
    "Hellenic (Kimmerian dialect)",
    "Keltic (Goidelic dialect)",
    "Keltic (Pictish dialect)",
    "Old Norse",
    "Thracian (Ixian dialect)",
    "Thracian (Kimmerian dialect)"
  ],
  tags: {
    melee: "ASSH.items.Melee",
    missile: "ASSH.items.Missile",
    slow: "ASSH.items.Slow",
    twohanded: "ASSH.items.TwoHanded",
    blunt: "ASSH.items.Blunt",
    brace: "ASSH.items.Brace",
    splash: "ASSH.items.Splash",
    reload: "ASSH.items.Reload",
    charge: "ASSH.items.Charge",
  },
  tag_images: {
    melee: "/systems/assh/assets/melee.png",
    missile: "/systems/assh/assets/missile.png",
    slow: "/systems/assh/assets/slow.png",
    twohanded: "/systems/assh/assets/twohanded.png",
    blunt: "/systems/assh/assets/blunt.png",
    brace: "/systems/assh/assets/brace.png",
    splash: "/systems/assh/assets/splash.png",
    reload: "/systems/assh/assets/reload.png",
    charge: "/systems/assh/assets/charge.png",
  },
  monster_saves: {
    0: {
      label: "Normal Human",
      d: 14,
      w: 15,
      t: 16,
      a: 17,
      s: 18
    },
    1: {
      label: "1-3",
      d: 12,
      w: 13,
      t: 14,
      a: 15,
      s: 16
    },
    4: {
      label: "4-6",
      d: 10,
      w: 11,
      t: 12,
      a: 13,
      s: 14
    },
    7: {
      label: "7-9",
      d: 8,
      w: 9,
      t: 10,
      a: 10,
      s: 12
    },
    10: {
      label: "10-12",
      d: 6,
      w: 7,
      t: 8,
      a: 8,
      s: 10
    },
    13: {
      label: "13-15",
      d: 4,
      w: 5,
      t: 6,
      a: 5,
      s: 8
    },
    16: {
      label: "16-18",
      d: 2,
      w: 3,
      t: 4,
      a: 3,
      s: 6
    },
    19: {
      label: "19-21",
      d: 2,
      w: 2,
      t: 2,
      a: 2,
      s: 4
    },
    22: {
      label: "22+",
      d: 2,
      w: 2,
      t: 2,
      a: 2,
      s: 2
    },
  }
};
