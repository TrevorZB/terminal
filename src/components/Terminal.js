import React, { Component } from "react";
import "../terminal.css";
import InputContainer from "./InputContainer";
import OutputContainer from "./OutputContainer";
import PromptContainer from "./PromptContainer";
import axios from "axios";
import constants from "../constants";

class Terminal extends Component {
  state = {
    input: "",
    outputs: [],
    commands: [],
    credentials: {
      username: "",
      password: "",
      loggedIn: true, // false when want to login
      accessLevel: 0, // 100 when want to login
    },
  };
  componentDidMount = async () => {
    const outputs = constants.GREETING;
    const resp = await axios.get("http://127.0.0.1:5000/api/commands");
    const commands = resp.data;
    this.setState({ commands, outputs });
  };
  render() {
    return (
      <div id="terminal">
        <OutputContainer outputs={this.state.outputs} />
        <div id="input-bar">
          <PromptContainer prompt={this.createPrompt()} />
          <InputContainer
            value={this.state.input}
            prompt={this.createPrompt()}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
          />
        </div>
      </div>
    );
  }
  createPrompt = () => {
    const credentials = this.state.credentials;
    const prompts = constants.PROMPTS;
    if (credentials.loggedIn) {
      return prompts.LOGGED_IN_BASE(credentials.username);
    } else if (!credentials.username) {
      return prompts.BASE.concat(" ", prompts.USERNAME);
    } else {
      return prompts.BASE.concat(" ", prompts.PASSWORD);
    }
  };
  handleChange = (event) => {
    const input = event.target.value;
    this.setState({ input });
  };
  handleSubmit = (event) => {
    event.preventDefault();
    const credentials = this.state.credentials;
    if (credentials.loggedIn) {
      this.commandSubmit();
    } else if (!credentials.username) {
      this.userNameSubmit();
    } else {
      this.passwordSubmit();
    }
  };
  commandSubmit = () => {
    const input = this.state.input.trim();
    const splitInput = input.split(" ");
    const commandText = splitInput[0];
    let args;
    if (splitInput.length > 1) {
      args = splitInput.slice(1);
    } else {
      args = [];
    }
    const command = this.state.commands.find((c) => c.name === commandText);
    if (!command) {
      const outputs = [
        ...this.state.outputs,
        commandText.concat(": ", constants.OUTPUTS.COMMAND_NOT_FOUND),
      ];
      const input = "";
      this.setState({ outputs, input });
      return;
    }
    switch (command.name) {
      case "":
        this.handleEmptyCommand(command, args);
        return;
      case "clear":
        this.handleClearCommand(command, args);
        return;
      case "logout":
        this.handleLogoutCommand(command, args);
        return;
      case "help":
        this.handleHelpCommand(command, args);
        return;
      case "projects":
        this.handleProjectsCommand(command, args);
        return;
      default:
        return;
    }
  };
  userNameSubmit = () => {
    const username = this.state.input;
    const outputs = [
      ...this.state.outputs,
      constants.PROMPTS.USERNAME.concat(" ", username),
    ];
    const input = "";
    this.setState({
      credentials: { ...this.state.credentials, username },
      outputs,
      input,
    });
  };
  passwordSubmit = async () => {
    const password = this.state.input;
    let outputs = [
      ...this.state.outputs,
      constants.PROMPTS.PASSWORD.concat(
        " ",
        this.generateStars(this.state.input.length)
      ),
    ];
    let credentials = { ...this.state.credentials, password };
    const resp = await axios.post(
      "http://127.0.0.1:5000/api/users",
      credentials
    );
    credentials = resp.data;
    outputs.push(
      credentials.loggedIn
        ? credentials.username.concat(": ", constants.OUTPUTS.LOGIN_MESSAGE)
        : constants.OUTPUTS.INVALID_LOGIN
    );
    const input = "";
    this.setState({ outputs, credentials, input });
  };
  generateStars = (length) => {
    let stars = "";
    for (let i = 0; i < length; i++) {
      stars += "*";
    }
    return stars;
  };
  handleEmptyCommand = (command, args) => {
    let outputs;
    const input = "";
    if (!this.checkAccess(command.access)) {
      outputs = this.invalidAccessOutput(command.name);
    } else if (!this.emptyCheckArgs(args)) {
      outputs = this.invalidArgOutput(command.name);
    } else {
      outputs = [
        ...this.state.outputs,
        constants.PROMPTS.LOGGED_IN_BASE(this.state.credentials.username),
      ];
    }
    this.setState({ outputs, input });
  };
  emptyCheckArgs = (args) => {
    return args.length < 1;
  };
  handleClearCommand = (command, args) => {
    let outputs;
    const input = "";
    if (!this.checkAccess(command.access)) {
      outputs = this.invalidAccessOutput(command.name);
    } else if (!this.clearCheckArgs(args)) {
      outputs = this.invalidArgOutput(command.name);
    } else {
      outputs = [];
    }
    this.setState({ outputs, input });
  };
  clearCheckArgs = (args) => {
    return args.length < 1;
  };
  handleLogoutCommand = (command, args) => {
    let outputs;
    const input = "";
    let credentials;
    if (!this.checkAccess(command.access)) {
      outputs = this.invalidAccessOutput(command.name);
    } else if (!this.logoutCheckArgs(args)) {
      outputs = this.invalidArgOutput(command.name);
    } else {
      outputs = [
        ...this.state.outputs,
        this.state.credentials.username.concat(
          ": ",
          constants.OUTPUTS.LOGOUT_MESSAGE
        ),
      ];
      credentials = {
        ...this.state.credentials,
        username: "",
        password: "",
        loggedIn: false,
        accessLevel: 100,
      };
    }
    this.setState({ outputs, input, credentials });
  };
  logoutCheckArgs = (args) => {
    return args.length < 1;
  };
  handleHelpCommand = (command, args) => {
    let c;
    let outputs;
    let input = "";
    if (!this.checkAccess(command.access)) {
      outputs = this.invalidAccessOutput(command.name);
    } else if (!(c = this.helpCheckArgs(command, args))) {
      outputs = this.invalidArgOutput(command.name);
    } else {
      outputs = [...this.state.outputs, ...c.description];
    }
    this.setState({ outputs, input });
  };
  helpCheckArgs = (command, args) => {
    if (!args.length) {
      return command;
    }
    if (args.length === 1) {
      command = this.state.commands.find((c) => c.name === args[0]);
      return command;
    }
    return false;
  };
  handleProjectsCommand = async (command, args) => {
    const input = "";
    const credentials = this.state.credentials;
    const resp = await axios.post("http://127.0.0.1:5000/api/projects", {
      args,
      credentials,
    });
    console.log(resp.data);
    this.setState({ input });
  };
  checkAccess = (access) => {
    return this.state.credentials.accessLevel <= access;
  };
  invalidAccessOutput = (commandText) => {
    return [
      ...this.state.outputs,
      commandText.concat(": ", constants.OUTPUTS.INVALID_ACCESS_LEVEL),
    ];
  };
  invalidArgOutput(commandText) {
    return [
      ...this.state.outputs,
      commandText.concat(": ", constants.OUTPUTS.INVALID_ARGS),
      constants.OUTPUTS.HELP_MESSAGE(commandText),
    ];
  }
}

export default Terminal;
