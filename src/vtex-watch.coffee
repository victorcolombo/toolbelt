Q = require 'q'
program = require 'commander'
pkg = require '../package.json'
auth = require './lib/auth'
Watcher = require './lib/watch'
metadata = require './lib/meta'
chalk = require 'chalk'

program.version(pkg.version).parse process.argv

unless program.args.length
  throw Error "Sandbox name is required. Use vtex watch <sandbox>".red

unless program.args[0].match(/^[\w_-]+$/)
  throw Error 'Sandbox may contain only letters, numbers, underscores and hyphens'.red

Q.all([
  auth.getValidCredentials()
  metadata.getAppMetadata()
]).spread((credentials, meta) ->
  name = meta.name
  owner = meta.owner

  watcher = new Watcher(name, owner, program.args[0], credentials)
  watcher.watch()
).then((app) ->
  console.log chalk.green("\nWatching "+chalk.italic(app.app))
).catch((error) ->
  console.error "\nFailed to start watch".red
  console.error error
)