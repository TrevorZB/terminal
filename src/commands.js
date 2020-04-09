import Command from "./Command";
import constants from "./constants";

const emptyCheckArgs = (args) => {
  return args.length < 1;
};

const clearCheckArgs = (args) => {
  return args.length < 1;
};

const logoutCheckArgs = (args) => {
  return args.length < 1;
};

const helpCheckArgs = (args) => {
  if (args.length === 0) {
    return true;
  }
  if (args.length === 1) {
    if (args[0].slice(0, 1) === "-") {
      return true;
    }
  }
  return false;
};

const commands = [
  new Command("", [], emptyCheckArgs, "", false, constants.GUEST_ACCESS_LEVEL),
  new Command(
    "clear",
    [],
    clearCheckArgs,
    "",
    false,
    constants.GUEST_ACCESS_LEVEL
  ),
  new Command(
    "logout",
    [],
    logoutCheckArgs,
    "",
    false,
    constants.GUEST_ACCESS_LEVEL
  ),
  new Command(
    "help",
    [],
    helpCheckArgs,
    "",
    false,
    constants.GUEST_ACCESS_LEVEL
  ),
];

export default commands;
