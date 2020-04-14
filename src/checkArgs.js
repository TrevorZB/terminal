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
  if (args.length < 2) {
    return true;
  }
  return false;
};

const checkArgs = [
  {
    command: "",
    validator: emptyCheckArgs,
  },
  {
    command: "clear",
    validator: clearCheckArgs,
  },
  {
    command: "logout",
    validator: logoutCheckArgs,
  },
  {
    command: "help",
    validator: helpCheckArgs,
  },
];

export default checkArgs;
