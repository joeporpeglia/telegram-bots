module.exports = {
  async redirects() {
    return [
      { source: "/", destination: "https://t.me/pointz_bot", permanent: true },
    ];
  },
};
