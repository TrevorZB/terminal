import React, { Component } from "react";
import "../terminal.css";
import InputContainer from "./InputContainer";
import OutputContainer from "./OutputContainer";
import PromptContainer from "./PromptContainer";
import axios from "axios";
import commands from "../commands";
import constants from "../constants";

class Terminal extends Component {
  state = {
    input: "",
    outputs: constants.GREETING,
    commands: commands,
    credentials: {
      username: "",
      password: "",
      loggedIn: false, // false when want to login
      accessLevel: 100, // 100 when want to login
    },
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
    const command = this.state.commands.find((c) =>
      c.checkCommand(commandText)
    );
    if (!command) {
      const outputs = [
        ...this.state.outputs,
        commandText.concat(": ", constants.OUTPUTS.COMMAND_NOT_FOUND),
      ];
      const input = "";
      this.setState({ outputs, input });
      return;
    }
    if (!command.checkArgs(args)) {
      const outputs = [
        ...this.state.outputs,
        commandText.concat(": ", constants.OUTPUTS.INVALID_ARGS),
        constants.OUTPUTS.HELP_MESSAGE(commandText),
      ];
      const input = "";
      this.setState({ outputs, input });
      return;
    }
    if (!command.checkAccessLevel(this.state.credentials.accessLevel)) {
      const outputs = [
        ...this.state.outputs,
        commandText.concat(": ", constants.OUTPUTS.INVALID_ACCESS_LEVEL),
      ];
      const input = "";
      this.setState({ outputs, input });
      return;
    }
    if (command.getServerNeeded()) {
      // send command to server
      return;
    } else {
      switch (command.getCommand()) {
        case "":
          this.handleEmptyCommand();
          return;
        case "clear":
          this.handleClearCommand();
          return;
        case "logout":
          this.handleLogoutCommand();
          return;
        case "help":
          this.handleHelpCommand();
          return;
        default:
          return;
      }
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
  handleEmptyCommand = () => {
    const outputs = [
      ...this.state.outputs,
      constants.PROMPTS.LOGGED_IN_BASE(this.state.credentials.username),
    ];
    const input = "";
    this.setState({ outputs, input });
  };
  handleClearCommand = () => {
    const outputs = [];
    const input = "";
    this.setState({ outputs, input });
  };
  handleLogoutCommand = () => {
    const outputs = [
      ...this.state.outputs,
      this.state.credentials.username.concat(
        ": ",
        constants.OUTPUTS.LOGOUT_MESSAGE
      ),
    ];
    const input = "";
    const credentials = {
      ...this.state.credentials,
      username: "",
      password: "",
      loggedIn: false,
      accessLevel: 100,
    };
    this.setState({ outputs, input, credentials });
  };
  handleHelpCommand = () => {};
}

export default Terminal;
