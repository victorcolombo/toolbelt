<<<<<<< Updated upstream
import {Builder, Change} from '@vtex/api'
import * as chokidar from 'chokidar'
=======
import * as moment from 'moment'
import {uniqBy, prop, forEach, endsWith} from 'ramda'
>>>>>>> Stashed changes
import * as debounce from 'debounce'
import {readFileSync} from 'fs'
import * as moment from 'moment'
import {resolve, sep} from 'path'
import {map} from 'ramda'

import {createInterface} from 'readline'
import log from '../../logger'
import {currentContext} from '../../conf'
import {createClients} from '../../clients'
import {logAll} from '../../sse'
import {getManifest} from '../../manifest'
import {toAppLocator} from '../../locator'
import {pathToFileObject, validateAppAction} from './utils'
import startDebuggerTunnel from './debugger'
import * as chalk from 'chalk'
import {listLocalFiles, getIgnoredPaths} from './file'
import {getAccount, getWorkspace} from '../../conf'
import {formatNano} from '../utils'
import legacyLink from './legacyLink'

const root = process.cwd()
<<<<<<< Updated upstream
const DELETE_SIGN = chalk.red('D')
const UPDATE_SIGN = chalk.blue('U')

const pathToChange = (path: string, remove?: boolean): Change => ({
  path: path.split(sep).join('/'),
  content: remove ? null : readFileSync(resolve(root, path)).toString('base64'),
})

const watchAndSendChanges = (appId, builder: Builder, performInitialLink) => {
  const changeQueue: Change[] = []

  const queueChange = (path: string, remove?: boolean) => {
    console.log(`${chalk.gray(moment().format('HH:mm:ss:SSS'))} - ${remove ? DELETE_SIGN : UPDATE_SIGN} ${path}`)
    changeQueue.push(pathToChange(path, remove))
    sendChanges()
  }

  const initialLinkRequired = e => {
    const data = e.response && e.response.data
    if (data && data.code && data.code === 'initial_link_required') {
      log.warn('Initial link requested by builder')
      performInitialLink()
      return
    }
    throw e
=======
const pathProp = prop('path')
const cleanAll: Change = {path: '*', action: 'remove'}
// const cp = require('child-process-es6-promise')
const Linter = require('eslint').Linter
const linter = new Linter()

const mapPathsToChanges = (paths: string[]): Change[] =>
  [cleanAll].concat(paths.map((path): Change => ({path, action: 'save'})))

const sendChanges = (() => {
  let queue = []
  const publishPatch = debounce(
    (data: Manifest) => {
      const locator = toMajorLocator(data)
      log.debug(`Sending ${queue.length} change` + (queue.length > 1 ? 's' : ''))
      return link(locator, queue)
        .tap(() => console.log(changesToString(queue, moment().format('HH:mm:ss'))))
        .tap(() => { queue = [] })
        .catch(err => { throw err })
    },
    50,
  )
  return async (changes: Change[]) => { // TODO: For every file in changes, run tslint if .ts or eslint if .js
    forEach(console.log, changes)
    if (changes.length === 0) {
      return
    }
    queue = uniqBy(pathProp, queue.concat(changes).reverse())
    forEach((change) => {
      if (endsWith('.js', change.path)) {
        const messages = linter.verify(Buffer.from(change.content, 'base64'), {}, {filename: change.path})
        console.log('ESLINT ERROR: ', messages)
        // await cp.exec('eslint ', function (err, stdout, stderr) {
      }
    }, queue)

    const manifest = await getManifest()
    return publishPatch(manifest)
>>>>>>> Stashed changes
  }

<<<<<<< Updated upstream
  const sendChanges = debounce(() => {
    builder.relinkApp(appId, changeQueue.splice(0, changeQueue.length)).catch(initialLinkRequired)
  }, 50)
=======

const cleanCache = (manifest: Manifest): Bluebird<void> => {
  return colossus.sendEvent('-', 'cleanCache', {
    id: toAppLocator(manifest),
    type: 'clean',
  })
}
>>>>>>> Stashed changes

  const watcher = chokidar.watch(['*/**', 'manifest.json'], {
    cwd: root,
    persistent: true,
    ignoreInitial: true,
    ignored: getIgnoredPaths(root),
    usePolling: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
    },
    atomic: true,
  })
  return new Promise((resolve, reject) => {
    watcher
    .on('add', (file, {size}) => size > 0 ? queueChange(file) : null)
    .on('change', (file, {size}) => {
      return size > 0
        ? queueChange(file)
        : queueChange(file, true)
    })
    .on('unlink', file => queueChange(file, true))
    .on('error', reject)
    .on('ready', resolve)
  })
}

export default async (options) => {
  await validateAppAction()
  const manifest = await getManifest()

  if (manifest.builders['render']
    || manifest.builders['functions-ts']
    || manifest.name === 'builder-hub') {
    return legacyLink(options)
  }

  const appId = toAppLocator(manifest)
  const unlisten = logAll(currentContext, log.level, `${manifest.vendor}.${manifest.name}`)
  const context = {account: getAccount(), workspace: getWorkspace(), timeout: 60000}
  const {builder} = createClients(context)

  const performInitialLink = async () => {
    const paths = await listLocalFiles(root)
    const filesWithContent = map(pathToFileObject(root), paths)

    log.debug('Sending files:')
    paths.forEach(p => log.debug(p))
    log.info(`Sending ${paths.length} file` + (paths.length > 1 ? 's' : ''))

    const {timeNano} = await builder.linkApp(appId, filesWithContent)
    log.info(`Build finished successfully in ${formatNano(timeNano)}`)
  }

  if (options.c || options.clean) {
    log.info('Requesting to clean cache in builder.')
    const {timeNano} = await builder.clean(appId)
    log.info(`Cache cleaned successfully in ${formatNano(timeNano)}`)
  }

<<<<<<< Updated upstream
  log.info(`Linking app ${appId}`)

  try {
    await performInitialLink()
  } catch (e) {
    if (e.response) {
      const {data} = e.response
      if (data.code === 'routing_error' && /app_not_found/.test(data.message)) {
        unlisten()
        return log.error('Please install vtex.builder-hub in your account to enable app linking (vtex install vtex.builder-hub)')
      }
    }
    throw e
  }

  await watchAndSendChanges(appId, builder, performInitialLink)
=======
  log.info('Linking app', `${id(manifest)}`)
  const majorLocator = toMajorLocator(manifest)
  const folder = options.o || options.only
  const paths = await listLocalFiles(root, folder)
  const changes = mapPathsToChanges(paths)
  const batches = addChangeContent(changes)
  forEach((batch) => {
    console.log('Before endsWith')
    if (endsWith('.js', batch.path)) {
      console.log(batch)
      const messages = linter.verify(Buffer.from(batch.content, 'base64'), {}, {filename: batch.path})
      console.log('ESLINT ERROR: ', messages)
      // await cp.exec('eslint ', function (err, stdout, stderr) {
    }
  }, batches)
  process.exit()
  log.debug('Sending files:')
  paths.forEach(p => log.debug(p))
  log.info(`Sending ${batches.length} file` + (batches.length > 1 ? 's' : ''))
  await link(majorLocator, batches)
  log.info(`${batches.length} file` + (batches.length > 1 ? 's' : '') + ' sent')
  await watch(root, sendChanges, folder)
>>>>>>> Stashed changes

  const debuggerPort = await startDebuggerTunnel(manifest)
  log.info(`Debugger tunnel listening on ${chalk.green(`:${debuggerPort}`)}`)

<<<<<<< Updated upstream
=======
  if (hasServiceOnBuilders(manifest)) {
    await checkAppStatus(manifest)
  }

>>>>>>> Stashed changes
  createInterface({input: process.stdin, output: process.stdout})
    .on('SIGINT', () => {
      unlisten()
      log.info('Your app is still in development mode.')
      log.info(`You can unlink it with: 'vtex unlink ${appId}'`)
      process.exit()
    })
}




// try {
  //   await child.exec('yarn lint', function (err, stdout, stderr) {
  //     if (err) {
  //       console.log('<<<<<err: ', err, '>>>>>>>>>>>')
  //     }
  //     if (stderr) {
  //       console.log('<<<<<err: ', stderr, '>>>>>>>>>>>')
  //     }
  //     process.stdout.write(stdout)

  //     process.stderr.on('data', function (data) {
  //       process.stdout.write('stderr: ' + data)
  //     })
  //     console.log('FINISHED')
  //   })
  // } catch (e) {
  //   console.log('CATCH',  e)
  // }




//   await cp.spawn('./node_modules/typescript/bin/tsc', ['--noEmit', '--diagnostics', '--listFiles'])
//   .then((data) => {
//     console.log(data.stdout)
//     process.stdout.write('DONE1')
//   })
//   .catch ((err) => {
//     console.log('ERROR OCCURRED1: ', err )
//     process.stdout.write('FAILED1')
//   })
//   .then(() => cp.kill)

// await cp.spawn('./node_modules/tslint/bin/tslint', ['service/**/*.ts'])
//   .then((data) => {
//     console.log(data.stdout)
//     process.stdout.write('DONE2')
//   })
//   .catch ((err) => {
//     console.log('ERROR OCCURRED2: ', err )
//     process.stdout.write('FAILED2')
//   })
//   .then(() => cp.kill)


// cp.stdout.on('data', function (data) {
//   process.stdout.write(`STDOUT: ${data.toString()}`)
// })

// cp.on('close', function () {
//   process.stdout.write('CHILD PROCESS HAS ENDED')
//   process.exit()
// })

// setTimeout(function () {
//   cp.stdin.write('stop')
// }, 4000)