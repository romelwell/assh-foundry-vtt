export const registerSettings = function () {

  game.settings.register("assh", "initiative", {
    name: game.i18n.localize("ASSH.Setting.Initiative"),
    hint: game.i18n.localize("ASSH.Setting.InitiativeHint"),
    default: "group",
    scope: "world",
    type: String,
    config: true,
    choices: {
      individual: "ASSH.Setting.InitiativeIndividual",
      group: "ASSH.Setting.InitiativeGroup",
    },
    onChange: _ => window.location.reload()
  });

  game.settings.register("assh", "rerollInitiative", {
    name: game.i18n.localize("ASSH.Setting.RerollInitiative"),
    hint: game.i18n.localize("ASSH.Setting.RerollInitiativeHint"),
    default: "reset",
    scope: "world",
    type: String,
    config: true,
    choices: {
      keep: "ASSH.Setting.InitiativeKeep",
      reset: "ASSH.Setting.InitiativeReset",
      reroll: "ASSH.Setting.InitiativeReroll",
    }
  });

  game.settings.register("assh", "morale", {
    name: game.i18n.localize("ASSH.Setting.Morale"),
    hint: game.i18n.localize("ASSH.Setting.MoraleHint"),
    default: false,
    scope: "world",
    type: Boolean,
    config: true,
  });

  game.settings.register("assh", "encumbranceOption", {
    name: game.i18n.localize("ASSH.Setting.Encumbrance"),
    hint: game.i18n.localize("ASSH.Setting.EncumbranceHint"),
    default: "detailed",
    scope: "world",
    type: String,
    config: true,
    choices: {
      disabled: "ASSH.Setting.EncumbranceDisabled",
      basic: "ASSH.Setting.EncumbranceBasic",
      detailed: "ASSH.Setting.EncumbranceDetailed",
      complete: "ASSH.Setting.EncumbranceComplete",
    },
    onChange: _ => window.location.reload()
  });

  game.settings.register("assh", "significantTreasure", {
    name: game.i18n.localize("ASSH.Setting.SignificantTreasure"),
    hint: game.i18n.localize("ASSH.Setting.SignificantTreasureHint"),
    default: 800,
    scope: "world",
    type: Number,
    config: true,
    onChange: _ => window.location.reload()
  });
};
