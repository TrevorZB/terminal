import React, { useEffect, useRef, useState } from "react";
import Output from "./Output";

const OutputContainer = (props) => {
  const [display, setDisplay] = useState([]);
  const outputsEndRef = useRef(null);
  const scrollToBottom = () => {
    outputsEndRef.current.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [display]);
  useEffect(() => {
    if (props.outputs.length === 0) {
      if (display.length > 0) {
        setTimeout(() => {
          let newDisplay = display.slice(0, display.length - 1);
          setDisplay(newDisplay);
        }, 40);
      }
    } else {
      let index = display.length;
      if (index < props.outputs.length) {
        setTimeout(() => {
          let newDisplay = [...display, props.outputs[index]];
          setDisplay(newDisplay);
        }, 40);
      }
    }
  }, [props.outputs, display]);
  const outputs = display.map((s) => {
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
