module.exports = {
  content: ["./**/*.html"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
      'brand-red': '#ff0057',
      'brand-blue': '#0b2245',
      'brand-yellow': '#ffce00',
      'brand-gray': '#cfcfd1',
      },
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
};
