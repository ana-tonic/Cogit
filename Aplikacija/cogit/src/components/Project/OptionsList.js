import Option from "./Option.js";

const OptionsList = ({ options }) => {
  //console.log(options);
  if (options) {
    const optionsList = options.map((option) => {
      return <Option option={option} key={option.value} />;
    });
    return optionsList;
  } else return <div></div>;
};

export default OptionsList;
