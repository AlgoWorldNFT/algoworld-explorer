const shortenAddress = (address = ``, width = 6): string => {
  return `${address.slice(0, width)}...${address.slice(-width)}`;
};

export default shortenAddress;
