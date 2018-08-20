import * as winston from 'winston'
import {format} from 'winston'

// TODO: Configure transport to send errors to Splunk
const winstonCLI = winston.createLogger().add(new winston.transports.Console({format: format.combine(format.colorize(), format.simple())}))
export default winstonCLI
