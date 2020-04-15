const constants = {
  ADMIN_ACCESS_LEVEL: 0,
  GUEST_ACCESS_LEVEL: 1,
  GREETING: [
    "welcome",
    "username: guest",
    "password: guest",
    "once logged in:",
    "  'projects': list of projects",
    "  'help': list commands",
  ],
  PROMPTS: {
    BASE: "$",
    LOGGED_IN_BASE: (t) => `(${t}) $`,
    USERNAME: "username:",
    PASSWORD: "password:",
  },
  OUTPUTS: {
    LOGIN_MESSAGE: "successfully logged in",
    INVALID_LOGIN: "error: invalid username/password",
    COMMAND_NOT_FOUND: "command not found",
    INVALID_ACCESS_LEVEL: "invalid access level",
    LOGOUT_MESSAGE: "successfully logged out",
    INVALID_ARGS: "invalid arguments used",
    HELP_MESSAGE: (t) => `try 'help -${t}' for more information`,
  },
};

export default constants;
