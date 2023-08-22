const yaml = require("js-yaml");
const { DateTime } = require("luxon");
const htmlmin = require("html-minifier");
const MarkdownIt = require("markdown-it");
const Image = require("@11ty/eleventy-img");

const md = new MarkdownIt({
  html: true,
  linkify: true,
});

module.exports = function(eleventyConfig) {
  // Disable automatic use of your .gitignore
  eleventyConfig.setUseGitIgnore(false);

  // Merge data instead of overriding
  eleventyConfig.setDataDeepMerge(true);

  // human readable date
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "LLL dd, yyyy"
    );
  });

  eleventyConfig.addFilter("friendlyTime", (time) => {
    let [hours, minutes] = time.toString().split(':').map(x => parseInt(x, 10))
    let d = new Date()
    d.setHours(hours)
    d.setMinutes(minutes)
    return DateTime.fromJSDate(d, { zone: "utc" }).toFormat(
      "h:mm a"
    );
  });

  eleventyConfig.addShortcode("image", async function(src, alt, sizes, classes = "") {
    if (src.startsWith('/static')) {
      src = `./src/${src}`
    }
    let metadata = await Image(src, {
      widths: [300, 600],
      formats: ["webp", "jpeg"],
      outputDir: "./_site/img/"
    })
    let imageAttributes = {
      alt,
      sizes,
      class: classes,
      loading: "lazy",
      decoding: "async",
    }
    // You bet we throw an error on a missing alt (alt="" works okay)
    return Image.generateHTML(metadata, imageAttributes)
  });

  // parse content as markdown
  // for some reason multiline content isn't handled well by this parser,
  // so the easiest thing to do is split the content by newline and render
  // each line as a paragraph, then wrap it all in another md.render()
  eleventyConfig.addFilter('markdown', content => {
    return md.render(content.split('\n').map(p => md.render(p)).join(''))
  });

  // To Support .yaml Extension in _data
  // You may remove this if you can use JSON
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  // Copy Static Files to /_Site
  eleventyConfig.addPassthroughCopy({
    "./src/admin/config.yml": "./admin/config.yml",
    "./node_modules/alpinejs/dist/cdn.min.js": "./static/js/alpine.js",
  });

  // Copy Image Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/static/img");

  // Copy favicon to route of /_site
  eleventyConfig.addPassthroughCopy("./src/favicon.svg");

  // Minify HTML
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });

  // Let Eleventy transform HTML files as nunjucks
  // So that we can use .html instead of .njk
  return {
    dir: {
      input: "src",
    },
    htmlTemplateEngine: "njk",
  };
};
