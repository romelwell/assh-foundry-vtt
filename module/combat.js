export class AsshCombat {
  static rollInitiative(combat, data) {
    // Check groups
    data.combatants = [];
    let groups = {};
    combat.data.combatants.forEach((cbt) => {
      groups[cbt.flags.assh.group] = { present: true };
      data.combatants.push(cbt);
    });

    // Roll init
    Object.keys(groups).forEach((group) => {
      let roll = new Roll("1d6").roll();
      roll.toMessage({
        flavor: game.i18n.format('ASSH.roll.initiative', { group: CONFIG["ASSH"].colors[group] }),
      });
      groups[group].initiative = roll.total;
    });

    // Set init
    for (let i = 0; i < data.combatants.length; ++i) {
      if (!data.combatants[i].actor) {
        return;
      }
      if (data.combatants[i].actor.data.data.isSlow) {
        data.combatants[i].initiative = -789;
      } else {
        data.combatants[i].initiative =
          groups[data.combatants[i].flags.assh.group].initiative;
      }
    }
    combat.setupTurns();
  }

  static async resetInitiative(combat, data) {
    let reroll = game.settings.get("assh", "rerollInitiative");
    if (!["reset", "reroll"].includes(reroll)) {
      return;
    }
    combat.resetAll();
  }

  static async individualInitiative(combat, data) {
    let updates = [];
    let messages = [];
    combat.data.combatants.forEach((c, i) => {
      // This comes from foundry.js, had to remove the update turns thing
      // Roll initiative
      const cf = combat._getInitiativeFormula(c);
      const roll = combat._getInitiativeRoll(c, cf);
      let value = roll.total;
      if (combat.settings.skipDefeated && c.defeated) {
        value = -790;
      }
      updates.push({ _id: c._id, initiative: value });

      // Determine the roll mode
      let rollMode = game.settings.get("core", "rollMode");
      if ((c.token.hidden || c.hidden) && (rollMode === "roll")) rollMode = "gmroll";

      // Construct chat message data
      let messageData = mergeObject({
        speaker: {
          scene: canvas.scene._id,
          actor: c.actor ? c.actor._id : null,
          token: c.token._id,
          alias: c.token.name
        },
        flavor: game.i18n.format('ASSH.roll.individualInit', { name: c.token.name })
      }, {});
      const chatData = roll.toMessage(messageData, { rollMode, create: false });

      if (i > 0) chatData.sound = null;   // Only play 1 sound for the whole set
      messages.push(chatData);
    });
    await combat.updateEmbeddedEntity("Combatant", updates);
    await CONFIG.ChatMessage.entityClass.create(messages);
    data.turn = 0;
  }

  static format(object, html, user) {
    html.find(".initiative").each((_, span) => {
      span.innerHTML =
        span.innerHTML == "-789.00"
          ? '<i class="fas fa-weight-hanging"></i>'
          : span.innerHTML;
      span.innerHTML =
        span.innerHTML == "-790.00"
          ? '<i class="fas fa-dizzy"></i>'
          : span.innerHTML;
    });

    html.find(".combatant").each((_, ct) => {
      // Append spellcast and retreat
      const controls = $(ct).find(".combatant-controls .combatant-control");
      const cmbtant = object.combat.getCombatant(ct.dataset.combatantId);
      const moveActive = cmbtant.flags.assh && cmbtant.flags.assh.moveInCombat ? "active" : "";
      controls.eq(1).after(
        `<a class='combatant-control move-combat ${moveActive}'><i class='fas fa-walking'></i></a>`
      );
      const spellActive = cmbtant.flags.assh && cmbtant.flags.assh.prepareSpell ? "active" : "";
      controls.eq(1).after(
        `<a class='combatant-control prepare-spell ${spellActive}'><i class='fas fa-magic'></i></a>`
      );
    });
    AsshCombat.announceListener(html);

    let init = game.settings.get("assh", "initiative") === "group";
    if (!init) {
      return;
    }

    html.find('.combat-control[data-control="rollNPC"]').remove();
    html.find('.combat-control[data-control="rollAll"]').remove();
    let trash = html.find(
      '.encounters .combat-control[data-control="endCombat"]'
    );
    $(
      '<a class="combat-control" data-control="reroll"><i class="fas fa-dice"></i></a>'
    ).insertBefore(trash);

    html.find(".combatant").each((_, ct) => {
      // Can't roll individual inits
      $(ct).find(".roll").remove();

      // Get group color
      const cmbtant = object.combat.getCombatant(ct.dataset.combatantId);
      let color = cmbtant.flags.assh.group;

      // Append colored flag
      let controls = $(ct).find(".combatant-controls");
      controls.prepend(
        `<a class='combatant-control flag' style='color:${color}' title="${CONFIG.ASSH.colors[color]}"><i class='fas fa-flag'></i></a>`
      );
    });
    AsshCombat.addListeners(html);
  }

  static updateCombatant(combat, combatant, data) {
    let init = game.settings.get("assh", "initiative");
    // Why do you reroll ?
    if (combatant.actor.data.data.isSlow) {
      data.initiative = -789;
      return;
    }
    // if (data.initiative && init == "group") {
    //   let groupInit = data.initiative;
    //   // Check if there are any members of the group with init
    //   combat.combatants.forEach((ct) => {
    //     if (
    //       ct.initiative &&
    //       ct.initiative != "-789.00" &&
    //       ct._id != data._id &&
    //       ct.flags.assh.group == combatant.flags.assh.group
    //     ) {
    //       groupInit = ct.initiative;
    //       // Set init
    //       data.initiative = parseInt(groupInit);
    //     }
    //   });
    // }
  }

  static announceListener(html) {
    html.find(".combatant-control.prepare-spell").click((ev) => {
      ev.preventDefault();
      // Toggle spell announcement
      let id = $(ev.currentTarget).closest(".combatant")[0].dataset.combatantId;
      let isActive = ev.currentTarget.classList.contains('active');
      game.combat.updateCombatant({
        _id: id,
        flags: { assh: { prepareSpell: !isActive } },
      });
    });
    html.find(".combatant-control.move-combat").click((ev) => {
      ev.preventDefault();
      // Toggle spell announcement
      let id = $(ev.currentTarget).closest(".combatant")[0].dataset.combatantId;
      let isActive = ev.currentTarget.classList.contains('active');
      game.combat.updateCombatant({
        _id: id,
        flags: { assh: { moveInCombat: !isActive } },
      });
    })
  }

  static addListeners(html) {
    // Cycle through colors
    html.find(".combatant-control.flag").click((ev) => {
      if (!game.user.isGM) {
        return;
      }
      let currentColor = ev.currentTarget.style.color;
      let colors = Object.keys(CONFIG.ASSH.colors);
      let index = colors.indexOf(currentColor);
      if (index + 1 == colors.length) {
        index = 0;
      } else {
        index++;
      }
      let id = $(ev.currentTarget).closest(".combatant")[0].dataset.combatantId;
      game.combat.updateCombatant({
        _id: id,
        flags: { assh: { group: colors[index] } },
      });
    });

    html.find('.combat-control[data-control="reroll"]').click((ev) => {
      if (!game.combat) {
        return;
      }
      let data = {};
      AsshCombat.rollInitiative(game.combat, data);
      game.combat.update({ data: data }).then(() => {
        game.combat.setupTurns();
      });
    });
  }

  static addCombatant(combat, data, options, id) {
    let token = canvas.tokens.get(data.tokenId);
    let color = "black";
    switch (token.data.disposition) {
      case -1:
        color = "red";
        break;
      case 0:
        color = "yellow";
        break;
      case 1:
        color = "green";
        break;
    }
    data.flags = {
      assh: {
        group: color,
      },
    };
  }

  static activateCombatant(li) {
    const turn = game.combat.turns.findIndex(turn => turn._id === li.data('combatant-id'));
    game.combat.update({turn: turn})
  }

  static addContextEntry(html, options) {
    options.unshift({
      name: "Set Active",
      icon: '<i class="fas fa-star-of-life"></i>',
      callback: AsshCombat.activateCombatant
    });
  }

  static async preUpdateCombat(combat, data, diff, id) {
    let init = game.settings.get("assh", "initiative");
    let reroll = game.settings.get("assh", "rerollInitiative");
    if (!data.round) {
      return;
    }
    if (data.round !== 1) {
      if (reroll === "reset") {
        AsshCombat.resetInitiative(combat, data, diff, id);
        return;
      } else if (reroll === "keep") {
        return;
      }
    }
    if (init === "group") {
      AsshCombat.rollInitiative(combat, data, diff, id);
    } else if (init === "individual") {
      AsshCombat.individualInitiative(combat, data, diff, id);
    }
  }
}
