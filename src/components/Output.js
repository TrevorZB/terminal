import React from "react";

const Output = (props) => {
  const output = findUrls(props.value);
  //return <div id="output">{output}</div>;
  return <div id="output" dangerouslySetInnerHTML={{ __html: output }} />;
};

const findUrls = (value) => {
  let end;
  let newValue = "";
  let url = "";
  const index = value.indexOf("http");
  if (index === -1) {
    return value;
  }
  for (end = index; end < value.length; end++) {
    if (end === " ") {
      break;
    }
  }
  url = value.slice(index, end);
  newValue =
    value.slice(0, index) +
    "<a id='url' target='blank' href=" +
    url +
    ">" +
    value.slice(index, end) +
    "</a>" +
    value.slice(end);
  return newValue;
};

export default Output;
