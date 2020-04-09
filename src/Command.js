class Command {
  constructor(
    command,
    args,
    checkArgs,
    description,
    serverNeeded,
    accessLevel
  ) {
    this.command = command;
    this.args = args;
    this.checkArgs = checkArgs;
    this.description = description;
    this.serverNeeded = serverNeeded;
    this.accessLevel = accessLevel;
  }
  checkCommand = (command) => {
    return this.command === command;
  };
  getCommand = () => {
    return this.command;
  };
  getServerNeeded = () => {
    return this.serverNeeded;
  };
  checkAccessLevel = (accessLevel) => {
    return this.accessLevel >= accessLevel;
  };
}

export default Command;
