### v0.9.2 (2015-09-28)

Hello again, fellas.

Today we have a round of the good ol' fixes.

Users of the `npm@3` version will be glad to know that the dependencies issues were handled. `tiny-lr` got updated and everything is now beautifully working. Also, removed `grunt-coffeelint` for having peer dependencies issues too.

I hope that people get a little less confused when running the toolbelt when he doesn't need to send anything to the sandbox servers. Why? Well, we got a new message just for that case :)

And, for the finale, the toolbelt will warn you properly when the port of the server is occupied. I think that shows good manners, exploding the way it used before doesn't show you have good loving parents!

- [`#43`](https://github.com/vtex/toolbelt/issues/43)
- [`#49`](https://github.com/vtex/toolbelt/issues/49)
- [`#51`](https://github.com/vtex/toolbelt/issues/51)
- [`#53`](https://github.com/vtex/toolbelt/issues/53)

---

### v0.9.1 (2015-09-26)

Nothing big here, just fixes some issue with the `watch` command when running with no flags.

It was supposed to not require the `webpack.config.js` file, but the `webpack` class was returning an instantiated class, so the constructor would run requiring the file before checking if any of the flags were true.

- [`#50`](https://github.com/vtex/toolbelt/issues/50)

---

### v0.9.0 (2015-09-24)

Let's kick the dust off and start with the good stuff!

The file `vtex-webpack` is now **gone** (we won't miss you, so k bye). Now we have a new one, shiny and pretty called `webpack` (yep), it lives on the `lib` folder.

The logic behind the `-w` and `-s` options is now there, and the entrypoint for them is now on `vtex-watch`, which makes much more sense since they are options of **watch**.

Last but not least, the VTEX Toolbelt server now uses the new [react-transform](https://github.com/gaearon/react-transform)!

Instead of using `webpack-dev-server	`, we're using an `express` server with `webpack-hot-middleware` and `webpack-dev-middleware`. Note that `webpack-dev-middleware` doesn't write anything on disk and handles everything in memory, so don't freak out if you see your `assets` folder sitting there all alone.

This assumes some pre-configuration on the project to work properly (see [Hot Module Replacement](https://github.com/vtex/toolbelt#hot-module-replacement) section on README). Besides, it's a world of new possibilities and probably makes it easier to make the dreamy multiple app hot reload that we all want!

On this release two main issues are fulfilled (actually, one is partially done):

- [`#44`](https://github.com/vtex/toolbelt/issues/44) (this is the partially one)
- [`#35`](https://github.com/vtex/toolbelt/issues/35)