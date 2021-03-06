import { Apps, Builder, Events, InstanceOptions, IOContext, Logger, Registry, Router, Workspaces } from '@vtex/api'
import { getAccount, getToken, getWorkspace } from '../conf'
import * as env from '../env'
import envTimeout from '../timeout'
import userAgent from '../user-agent'
import { ABTester } from './abTester'
import Billing from './billingClient'

const DEFAULT_TIMEOUT = 15000
const context = {
  account: getAccount(),
  authToken: getToken(),
  production: false,
  region: env.region(),
  route: {
    id: '',
    params: {},
  } ,
  userAgent,
  workspace: getWorkspace() || 'master',
  requestId: '',
  operationId: '',
}

const options = {
  timeout: (envTimeout || DEFAULT_TIMEOUT) as number,
}

const interceptor = <T>(client): T => new Proxy({}, {
  get: (_, name) => () => {
    throw new Error(`Error trying to call ${client}.${name.toString()} before login.`)
  },
}) as T


const createClients = (customContext: Partial<IOContext> = {}, customOptions: InstanceOptions = {}) => {
  const mergedContext = { ...context, ...customContext }
  const mergedOptions = { ...options, ...customOptions }
  return {
    builder: new Builder(mergedContext, mergedOptions),
    logger: new Logger(mergedContext, mergedOptions),
    registry: new Registry(mergedContext, mergedOptions),
    events: new Events(mergedContext, mergedOptions),
  }
}

const [abtester, apps, router, workspaces, logger, events, billing] = getToken()
  ? [
    new ABTester(context, { ...options, retries: 3 }),
    new Apps(context, options),
    new Router(context, options),
    new Workspaces(context, options),
    new Logger(context),
    new Events(context),
    new Billing(context, options),
  ]
  : [
    interceptor<ABTester>('abtester'),
    interceptor<Apps>('apps'),
    interceptor<Router>('router'),
    interceptor<Workspaces>('workspaces'),
    interceptor<Logger>('logger'),
    interceptor<Events>('events'),
    interceptor<Billing>('billing'),
  ]

export {
  abtester,
  apps,
  router,
  workspaces,
  logger,
  events,
  createClients,
  billing,
}
