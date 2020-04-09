import React from "react";
import constants from "../constants";

const InputContainer = (props) => {
  return (
    <form id="input-container" onSubmit={props.handleSubmit}>
      <input
        id="input"
        type={
          props.prompt ===
          constants.PROMPTS.BASE.concat(" ", constants.PROMPTS.PASSWORD)
            ? "password"
            : "text"
        }
        value={props.value}
        onChange={props.handleChange}
        autoFocus
      ></input>
    </form>
  );
};

export default InputContainer;
