# React Responsive System - Gatsby Example

## ScreenClassProvider

The trick with Gatsby is finding the right place to add the `ScreenClassProvider` component.

We'll make use of the [wrapRootElement API](https://www.gatsbyjs.org/docs/browser-apis/#wrapRootElement).

Check out `gatsby-browser.js` and `gatsby-config.js` in this repo.

The setup is basically identical to how you'd [set up Redux](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-redux)

## Usage

Once you've got the `ScreenClassProvider` in place, there's nothing special about usage with Gatsby. If you're curious, `responsive-system.js` and `src/pages/index.js` are the other 2 files of interest beyond the gatsby configs.
