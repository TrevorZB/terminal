import React, { useEffect, useRef } from "react";
import Output from "./Output";

const OutputContainer = props => {
  const outputsEndRef = useRef(null);
  const scrollToBottom = () => {
    outputsEndRef.current.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [props.outputs]);
  const outputs = props.outputs.map(s => {
    return <Output value={s} />;
  });
  return (
    <div id="output-container">
      {outputs}
      <div ref={outputsEndRef} />
    </div>
  );
};

export default OutputContainer;
