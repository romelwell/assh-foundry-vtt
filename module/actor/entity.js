import { AsshDice } from "../dice.js";

export class AsshActor extends Actor {
  /**
   * Extends data from base Actor class
   */

  prepareData() {
    super.prepareData();
    const data = this.data.data;

    // Compute modifiers from actor scores
    this.computeModifiers();
    this.computeSaves();
    this._isSlow();
    this.computeAC();
    this.computeEncumbrance();
    this.computeTreasure();

  }
  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
    /* -------------------------------------------- */
  getExperience(value, options = {}) {
    if (this.data.type != "character") {
      return;
    }
    let modified = Math.floor(
      value + (this.data.data.details.xp.bonus * value) / 100
    );
    return this.update({
      "data.details.xp.value": modified + this.data.data.details.xp.value,
    }).then(() => {
      const speaker = ChatMessage.getSpeaker({ actor: this });
      ChatMessage.create({
        content: game.i18n.format("ASSH.messages.GetExperience", {
          name: this.name,
          value: modified,
        }),
        speaker,
      });
    });
  }

  isNew() {
    const data = this.data.data;
    if (this.data.type == "character") {
      let ct = 0;
      Object.values(data.scores).forEach((el) => {
        ct += el.value;
      });
      return ct == 0 ? true : false;
    } else if (this.data.type == "monster") {
      let ct = 0;
      Object.values(data.saves).forEach((el) => {
        ct += el.value;
      });
      return ct == 0 ? true : false;
    }
  }

  generateSave(hd) {
    let saves = {};
    for (let i = 0; i <= hd; i++) {
      let tmp = CONFIG.ASSH.monster_saves[i];
      if (tmp) {
        saves = tmp;
      }
    }
    this.update({
      "data.saves": {
        savingthrow: {
          value: saves.st,
        },
        death: {
          value: saves.d,
        },
        device: {
          value: saves.w,
        },
        transformation: {
          value: saves.t,
        },
        avoidance: {
          value: saves.a,
        },
        sorcery: {
          value: saves.s,
        },
      },
    });
  }

  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */

  rollHP(options = {}) {
    let roll = new Roll(this.data.data.hp.hd).roll();
    return this.update({
      data: {
        hp: {
          max: roll.total,
          value: roll.total,
        },
      },
    });
  }

  rollSave(save, options = {}) {
    const label = game.i18n.localize(`ASSH.saves.${save}.long`);
    const rollParts = ["1d20", this.data.data.saves[save].mod];

    console.log(save)
    console.log(this.data.data.saves.savingthrow.base)
    console.log(this.data.data.saves[save].mod)
    const data = {
      actor: this.data,
      roll: {
        type: "above",
        target: this.data.data.saves.savingthrow.base ,
      },
      details: game.i18n.format("ASSH.roll.details.save", { save: label }),
    };

    let skip = options.event && options.event.ctrlKey;

    const rollMethod = this.data.type == "character" ? AsshDice.RollSave : AsshDice.Roll;

    // Roll and return
    return rollMethod({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("ASSH.roll.save", { save: label }),
      title: game.i18n.format("ASSH.roll.save", { save: label }),
    });
  }

  rollMorale(options = {}) {
    const rollParts = ["2d6"];

    const data = {
      actor: this.data,
      roll: {
        type: "below",
        target: this.data.data.details.morale,
      },
    };

    // Roll and return
    return AsshDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.localize("ASSH.roll.morale"),
      title: game.i18n.localize("ASSH.roll.morale"),
    });
  }

  rollLoyalty(options = {}) {
    const label = game.i18n.localize(`ASSH.roll.loyalty`);
    const rollParts = ["2d6"];

    const data = {
      actor: this.data,
      roll: {
        type: "below",
        target: this.data.data.retainer.loyalty,
      },
    };

    // Roll and return
    return AsshDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: label,
      title: label,
    });
  }

  rollReaction(options = {}) {
    const rollParts = ["2d6"];

    const data = {
      actor: this.data,
      roll: {
        type: "table",
        table: {
          2: game.i18n.format("ASSH.reaction.Hostile", {
            name: this.data.name,
          }),
          3: game.i18n.format("ASSH.reaction.Unfriendly", {
            name: this.data.name,
          }),
          6: game.i18n.format("ASSH.reaction.Neutral", {
            name: this.data.name,
          }),
          9: game.i18n.format("ASSH.reaction.Indifferent", {
            name: this.data.name,
          }),
          12: game.i18n.format("ASSH.reaction.Friendly", {
            name: this.data.name,
          }),
        },
      },
    };

    let skip = options.event && options.event.ctrlKey;

    // Roll and return
    return AsshDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.localize("ASSH.reaction.check"),
      title: game.i18n.localize("ASSH.reaction.check"),
    });
  }

  rollCheck(score, options = {}) {
    const label = game.i18n.localize(`ASSH.scores.${score}.long`);
    const rollParts = ["1d20"];

    const data = {
      actor: this.data,
      roll: {
        type: "check",
        target: this.data.data.scores[score].value,
      },

      details: game.i18n.format("ASSH.roll.details.attribute", {
        score: label,
      }),
    };

    let skip = options.event && options.event.ctrlKey;

    // Roll and return
    return AsshDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("ASSH.roll.attribute", { attribute: label }),
      title: game.i18n.format("ASSH.roll.attribute", { attribute: label }),
    });
  }

  rollHitDice(options = {}) {
    const label = game.i18n.localize(`ASSH.roll.hd`);
    const rollParts = [this.data.data.hp.hd];
    if (this.data.type == "character") {
      rollParts.push(this.data.data.scores.con.mod);
    }

    const data = {
      actor: this.data,
      roll: {
        type: "hitdice",
      },
    };

    // Roll and return
    return AsshDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: label,
      title: label,
    });
  }

  rollAppearing(options = {}) {
    const rollParts = [];
    let label = "";
    if (options.check == "wilderness") {
      rollParts.push(this.data.data.details.appearing.w);
      label = "(2)";
    } else {
      rollParts.push(this.data.data.details.appearing.d);
      label = "(1)";
    }
    const data = {
      actor: this.data,
      roll: {
        type: {
          type: "appearing",
        },
      },
    };

    // Roll and return
    return AsshDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("ASSH.roll.appearing", { type: label }),
      title: game.i18n.format("ASSH.roll.appearing", { type: label }),
    });
  }

  rollExploration(expl, options = {}) {
    const label = game.i18n.localize(`ASSH.exploration.${expl}.long`);
    const rollParts = ["1d6"];

    const data = {
      actor: this.data,
      roll: {
        type: "below",
        target: this.data.data.exploration[expl],
      },
      details: game.i18n.format("ASSH.roll.details.exploration", {
        expl: label,
      }),
    };

    let skip = options.event && options.event.ctrlKey;

    // Roll and return
    return AsshDice.Roll({
      event: options.event,
      parts: rollParts,
      data: data,
      skipDialog: skip,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("ASSH.roll.exploration", { exploration: label }),
      title: game.i18n.format("ASSH.roll.exploration", { exploration: label }),
    });
  }

  rollDamage(attData, options = {}) {
    const data = this.data.data;

    const rollData = {
      actor: this.data,
      item: attData.item,
      roll: {
        type: "damage",
      },
    };

    let dmgParts = [];
    if (!attData.roll.dmg) {
      dmgParts.push("1d6");
    } else {
      dmgParts.push(attData.roll.dmg);
    }

    // Add Str to damage
    if (attData.roll.type == "melee") {
      dmgParts.push(data.scores.str.mod);
    }

    // Damage roll
    AsshDice.Roll({
      event: options.event,
      parts: dmgParts,
      data: rollData,
      skipDialog: true,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${attData.label} - ${game.i18n.localize("ASSH.Damage")}`,
      title: `${attData.label} - ${game.i18n.localize("ASSH.Damage")}`,
    });
  }

  async targetAttack(data, type, options) {
    if (game.user.targets.size > 0) {
      for (let t of game.user.targets.values()) {
        data.roll.target = t;
        await this.rollAttack(data, {
          type: type,
          skipDialog: options.skipDialog,
        });
      }
    } else {
      this.rollAttack(data, { type: type, skipDialog: options.skipDialog });
    }
  }

  rollAttack(attData, options = {}) {
    const data = this.data.data;
    const rollParts = ["1d20"];
    const dmgParts = [];
    let label = game.i18n.format("ASSH.roll.attacks", {
      name: this.data.name,
    });
    if (!attData.item) {
      dmgParts.push("1d6");
    } else {
      label = game.i18n.format("ASSH.roll.attacksWith", {
        name: attData.item.name,
      });
      dmgParts.push(attData.item.data.damage);
    }

    if (options.type == "missile") {
      rollParts.push(
        (isNaN(parseInt(data.scores.dex.atkmod,10)) ? 0 : parseInt(data.scores.dex.atkmod,10)).toString()
      );
    } else if (options.type == "melee") {
      rollParts.push(
        (isNaN(parseInt(data.scores.str.atkmod,10)) ? 0 : parseInt(data.scores.str.atkmod,10)).toString()
      );
    }
    if (attData.item && attData.item.data.bonus) {
      rollParts.push(attData.item.data.bonus);
    }
    let thac0 = 20 - data.fa.value;
    if (options.type == "melee") {
      dmgParts.push(
        (isNaN(parseInt(data.scores.str.dmgmod,10)) ? 0 : parseInt(data.scores.str.dmgmod,10)));
    }
    const rollData = {
      actor: this.data,
      item: attData.item,
      roll: {
        type: options.type,
        thac0: thac0,
        dmg: dmgParts,
        save: attData.roll.save,
        target: attData.roll.target,
      },
    };

    // Roll and return
    return AsshDice.Roll({
      event: options.event,
      parts: rollParts,
      data: rollData,
      skipDialog: options.skipDialog,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: label,
      title: label,
    });
  }

  async applyDamage(amount = 0, multiplier = 1) {
    amount = Math.floor(parseInt(amount) * multiplier);
    const hp = this.data.data.hp;

    // Remaining goes to health
    const dh = Math.clamped(hp.value - amount, 0, hp.max);

    // Update the Actor
    return this.update({
      "data.hp.value": dh,
    });
  }

  static _valueFromTable(table, val) {
    let output;
    for (let i = 0; i <= val; i++) {
      if (table[i] != undefined) {
        output = table[i];
      }
    }
    return output;
  }

  _isSlow() {
    this.data.data.isSlow = false;
    if (this.data.type != "character") {
      return;
    }
    this.data.items.forEach((item) => {
      if (item.type == "weapon" && item.data.slow && item.data.equipped) {
        this.data.data.isSlow = true;
        return;
      }
    });
  }

  computeEncumbrance() {
    if (this.data.type != "character") {
      return;
    }
    const data = this.data.data;
    let option = game.settings.get("assh", "encumbranceOption");

    // Compute encumbrance
    let totalWeight = 0;
    let hasItems = false;
    Object.values(this.data.items).forEach((item) => {
      if (item.type == "item" && !item.data.treasure) {
        hasItems = true;
      }
      if (
        item.type == "item" &&
        (["complete", "disabled"].includes(option) || item.data.treasure)
      ) {
        totalWeight += item.data.quantity.value * item.data.weight;
      } else if (option != "basic" && ["weapon", "armor"].includes(item.type)) {
        totalWeight += item.data.weight;
      }
    });

    data.encumbrance = {
      pct: Math.clamped(
        (100 * parseFloat(totalWeight)) / data.encumbrance.max,
        0,
        100
      ),
      max: data.encumbrance.max,
      encumbered: totalWeight > data.encumbrance.max,
      value: totalWeight,
    };

    if (data.config.movementAuto && option != "disabled") {
      this._calculateMovement();
    }
  }

  _calculateMovement() {
    const data = this.data.data;

    const armors = this.data.items.filter((i) => i.type == "armor");
    let heaviest = 40; // MV rates so higher is lighter
    armors.forEach((a) => {
      if (a.data.equipped) {
        switch (a.data.type) {
        case 'light':
          break;
        case 'medium':
          if (heaviest > 30){
            heaviest = 30;
          }
          break;
        case 'heavy':
          if (heaviest > 20){
            heaviest = 20;
          }
        }
      }
    });
    data.mv.value = heaviest;
  }


  computeTreasure() {
    if (this.data.type != "character") {
      return;
    }
    const data = this.data.data;
    // Compute treasure
    let total = 0;
    let treasure = this.data.items.filter(
      (i) => i.type == "item" && i.data.treasure
    );
    treasure.forEach((item) => {
      total += item.data.quantity.value * item.data.cost;
    });
    data.treasure = total;
  }

  computeAC() {
    if (this.data.type != "character") {
      return;
    }
    // Compute AC
    let baseAc = 9;
    let AcShield = 0;

    const data = this.data.data;
    this.computeModifiers();

    data.ac.naked = baseAc - (isNaN(parseInt(data.scores.dex.defmod,10)) ? 0 : parseInt(data.scores.dex.defmod,10));
    if (data.ac.naked > 9) {
      // dex penalty can't take us over 9 AC
      data.ac.naked = 9;
    }

    const armors = this.data.items.filter((i) => i.type == "armor");
    armors.forEach((a) => {
      if (a.data.equipped && a.data.type != "shield") {
        baseAc = a.data.ac.value;
      } else if (a.data.equipped && a.data.type == "shield") {
        AcShield = a.data.ac.value;
      }

      // Sanity check
      if (!baseAc) { 
        baseAc = 9; 
        data.ac.value = baseAc;
      }
      if (!data.ac.naked) { data.ac.naked = 9; }

    });

    data.ac.value = baseAc - (isNaN(parseInt(data.scores.dex.defmod,10)) ? 0 : parseInt(data.scores.dex.defmod,10)) - AcShield - data.ac.mod;
    if (data.ac.value > 9) { data.ac.value = 9; }
    data.ac.shield = AcShield;
  }

  computeSaves() {
    const data = this.data.data;

    const lvlSave = {
      0: 17,
      1: 16,
      3: 15,
      5: 14,
      7: 13,
      9: 12,
      11: 11,
      13: 10,
      15: 9,
      17: 8,
    };

    data.saves.savingthrow.base = AsshActor._valueFromTable(
      lvlSave,
      data.details.level
    )
  }

  computeModifiers() {
    if (this.data.type != "character") {
      return;
    }
    const data = this.data.data;

    const stratk = {
      0: '-2',
      4: '-1',
      7: unescape('%B1') + 0,
      15: '+1',
      18: '+2',
    };

    const strdmg = {
      0: '-2',
      4: '-1',
      9: unescape('%B1') + 0,
      13: '+1',
      17: '+2',
      18: '+3',
    };

    const tests = {
      0: '1:6',
      7: '2:6',
      13: '3:6',
      17: '4:6',
      18: '5:6',
    }

    const feats = {
      0: '0%',
      4: '1%',
      7: '2%',
      9: '4%',
      13: '8%',
      15: '16%',
      17: '24%',
      18: '32%',
    }

    data.scores.str.atkmod = AsshActor._valueFromTable(
      stratk,
      data.scores.str.value
    );

    data.scores.str.dmgmod = AsshActor._valueFromTable(
      strdmg,
      data.scores.str.value
    );

    data.scores.str.test = AsshActor._valueFromTable(
      tests,
      data.scores.str.value
    );

    data.scores.str.feat = AsshActor._valueFromTable(
      feats,
      data.scores.str.value
    );

    const dexatk = {
      0: '-2',
      4: '-1',
      9: unescape('%B1') + 0,
      13: '+1',
      17: '+2',
      18: '+3',
    }

    const dexdef = {
      0: '-2',
      4: '-1',
      7: unescape('%B1') + 0,
      15: '+1',
      18: '+2',
    }

    data.scores.dex.atkmod = AsshActor._valueFromTable(
      dexatk,
      data.scores.dex.value
    );

    data.scores.dex.defmod = AsshActor._valueFromTable(
      dexdef,
      data.scores.dex.value
    );

    data.scores.dex.test = AsshActor._valueFromTable(
      tests,
      data.scores.dex.value
    );

    data.scores.dex.feat = AsshActor._valueFromTable(
      feats,
      data.scores.dex.value
    );

    const conhp = {
      0: '-1',
      7: unescape('%B1') + 0,
      13: '+1',
      17: '+2',
      18: '+3',
    }

    const conpoison = {
      0: '-2',
      4: '-1',
      7: unescape('%B1') + 0,
      15: '+1',
      18: '+2',
    }

    const contrauma = {
      0: '45%',
      4: '55%',
      7: '65%',
      9: '75%',
      13: '80%',
      15: '85%',
      17: '90%',
      18: '95%',
    }

    data.scores.con.hpmod = AsshActor._valueFromTable(
      conhp,
      data.scores.con.value
    );

    data.scores.con.poison =  AsshActor._valueFromTable(
      conpoison,
      data.scores.con.value
    );

    data.scores.con.trauma = AsshActor._valueFromTable(
      contrauma,
      data.scores.con.value
    );

    data.scores.con.test = AsshActor._valueFromTable(
      tests,
      data.scores.con.value
    );

    data.scores.con.feat = AsshActor._valueFromTable(
      feats,
      data.scores.con.value
    );


    const languages = {
      3: "ASSH.Illiterate",
      7: unescape('%B1') + 0,
      13: '+1',
      17: '+2',
      18: '+3',
    };

    const bonusSpells = {
      3: 'N/A',
      9: '-',
      13: 'One level 1',
      15: 'One level 2',
      17: 'One level 3',
      18: 'One level 4',
    };

    const learnSpells = {
      3: 'N/A',
      9: '50%',
      13: '65%',
      15: '75%',
      17: '85%',
      18: '95%',
    };

    const literacy = {
      0: "",
      3: "ASSH.Illiterate",
      6: "ASSH.LiteracyBasic",
      9: "ASSH.Literate",
    };

    const spoken = {
      0: "ASSH.NativeBroken",
      3: "ASSH.Native",
      13: "ASSH.NativePlus1",
      16: "ASSH.NativePlus2",
      18: "ASSH.NativePlus3",
    };

    data.scores.int.languages = AsshActor._valueFromTable(
      languages,
      data.scores.int.value
    );

    data.languages.literacy = AsshActor._valueFromTable(
      literacy,
      data.scores.int.value
    );

    data.languages.spoken = AsshActor._valueFromTable(
      spoken,
      data.scores.int.value
    );

    data.scores.int.bonusSpells = AsshActor._valueFromTable(
      bonusSpells,
      data.scores.int.value
    );

    data.scores.int.learnSpells = AsshActor._valueFromTable(
      learnSpells,
      data.scores.int.value
    );

    const wisadj = {
      0: '-2',
      4: '-1',
      7: unescape('%B1') + 0,
      15: '+1',
      18: '+2',
    };

    data.scores.wis.willadj = AsshActor._valueFromTable(
      wisadj,
      data.scores.wis.value
    );

    data.scores.wis.bonusSpells = AsshActor._valueFromTable(
      bonusSpells,
      data.scores.wis.value
    );

    data.scores.wis.learnSpells = AsshActor._valueFromTable(
      learnSpells,
      data.scores.wis.value
    );

    const chaloyalty = {
      3: '-3',
      4: '-2',
      7: '-1',
      9: unescape('%B1') + 0,
      13: '+1',
      17: '+2',
      18: '+3',
    };

    const chahenchmen = {
      3: 1,
      4: 2,
      7: 3,
      9: 4,
      13: 6,
      15: 8,
      17: 10,
      18: 12,
    };

    const chaturn = {
      3: '-1',
      7: unescape('%B1') + 0,
      15: '+1',
    };

    data.scores.cha.loyalty = AsshActor._valueFromTable(
      chaloyalty,
      data.scores.cha.value
    );

    data.scores.cha.henchmen = AsshActor._valueFromTable(
      chahenchmen,
      data.scores.cha.value
    );

    data.scores.cha.turn = AsshActor._valueFromTable(
      chaturn,
      data.scores.cha.value
    );
  }
}
