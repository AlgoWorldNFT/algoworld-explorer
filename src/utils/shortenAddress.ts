const shortenAddress = (address = ``, width = 3): string => {
  return `${address.slice(0, width)}...${address.slice(-width)}`;
};

export default shortenAddress;
