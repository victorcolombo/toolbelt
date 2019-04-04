import chalk from 'chalk'
import * as enquirer from 'enquirer'
import { compose, fromPairs, keys, map, mapObjIndexed, prop, values, zip } from 'ramda'

import { abtester } from '../../../clients'
import { UserCancelledError } from '../../../errors'
import log from '../../../logger'
import { promptConfirm } from '../../prompts'
import list from '../list'
import {
  checkIfInProduction,
  currentWorkspace,
  formatDays,
  SIGNIFICANCE_LEVELS
} from './utils'

const promptSignificanceLevel = async () => {
  const significanceTimePreviews = await Promise.all(
    compose<any, number[], Array<Promise<number>>>(
      map(value => abtester.preview(value as number)),
      values
    )(SIGNIFICANCE_LEVELS)
  )
  const significanceTimePreviewMap = fromPairs(zip(keys(SIGNIFICANCE_LEVELS), significanceTimePreviews))
  return await enquirer.prompt({
    name: 'level',
    message: 'Choose the significance level:',
    type: 'select',
    choices: values(
      mapObjIndexed(
        (value, key) => (
           {
             message:`${key} (~ ${formatDays(value as number)})`,
             value: key,
        }
        ))(significanceTimePreviewMap)
    ),
  }).then(prop('level'))
}

const promptContinue = async (significanceLevel: string) => {
  const proceed = await promptConfirm(
    `You are about to start an AB Test between workspaces \
${chalk.green('master')} and ${chalk.green(currentWorkspace)} with \
${chalk.red(significanceLevel)} significance level. Proceed?`,
  false
  )
  if (!proceed) {
    throw new UserCancelledError()
  }
}

export default async () => {
  const significanceLevel = await promptSignificanceLevel()
  await promptContinue(significanceLevel)
  await checkIfInProduction()
  const significanceLevelValue = SIGNIFICANCE_LEVELS[significanceLevel]
  log.info(`Setting workspace ${chalk.green(currentWorkspace)} to AB test with \
${significanceLevel} significance level`)
  const response = await abtester.initialize(currentWorkspace, significanceLevelValue)
  console.log(response)
  log.info(`Workspace ${chalk.green(currentWorkspace)} in AB Test`)
  log.info(
    `You can stop the test using ${chalk.blue('vtex workspace abtest abort')}`
  )
  list()
}
