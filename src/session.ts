/* eslint-disable sort-keys */
import { EventEmitter } from 'events'
import os from 'os'
import { CommandInstance } from './command-instance'
import Vorpal from './vorpal'

interface CommandResponse {
  error?: Error;
  data?: any;
  args?: any;
}

export default class Session extends EventEmitter {

  private _registeredCommands: number;
  private _completedCommands: number;
  private _commandSetCallback: any;
  private id: any;
  private vorpal;
  private parent: Vorpal;
  private user: any;
  private cancelCommands: any;
  /**
   * Initialize a new `Session` instance.
   *
   * @param {String} name
   * @return {Session}
   * @api public
   */

  constructor (options) {
    super()
    options = options || {}
    this.id = options.id || this._guid()
    this.parent = options.parent || undefined
    this.user = options.user || 'guest'
  }

  /**
   * Pipes logging data through any piped
   * commands, and then sends it to ._log for
   * actual logging.
   *
   * @param {String} [... arguments]
   * @return {Session}
   * @api public
   */
  public log (...args) {
    this.parent.ui.log(...args)
    return this
  }

  /**
   * Public facing autocomplete helper.
   *
   * @param {String} str
   * @param {Array} arr
   * @return {String}
   * @api public
   */

  public help (command) {
    this.log(this.parent._commandHelp(command || ''))
  }

  /**
   * Gets a new command set ready.
   *
   * @return {session}
   * @api public
   */

  public execCommandSet (wrapper, callback) {
    const self = this
    let response: CommandResponse = {}
    var res /* eslint-disable-line no-var */
    const cbk = callback
    this._registeredCommands = 1
    this._completedCommands = 0

    // Create the command instance for the first
    // command and hook it up to the pipe chain.
    const commandInstance = new CommandInstance({
      downstream: wrapper.pipes[0],
      commandObject: wrapper.commandObject,
      commandWrapper: wrapper,
    })

    wrapper.commandInstance = commandInstance

    function sendDones (itm) {
      if (itm.commandObject && itm.commandObject._done) {
        itm.commandObject._done.call(itm)
      }
      if (itm.downstream) {
        sendDones(itm.downstream)
      }
    }

    // Called when command is cancelled
    this.cancelCommands = function () {
      const callCancel = function (commandInstanceInner) {
        if (typeof commandInstanceInner.commandObject._cancel === 'function') {
          commandInstanceInner.commandObject._cancel.call(commandInstanceInner)
        }

        if (commandInstanceInner.downstream) {
          callCancel(commandInstanceInner.downstream)
        }
      }

      callCancel(wrapper.commandInstance)

      // Check if there is a cancel method on the promise
      if (res && (typeof res.cancel === 'function')) {
        res.cancel(wrapper.commandInstance)
      }

      self.removeListener('vorpal_command_cancel', self.cancelCommands)
      self.cancelCommands = undefined
      self._commandSetCallback = undefined
      self._registeredCommands = 0
      self._completedCommands = 0
      self.parent.emit('client_command_cancelled', { command: wrapper.command })

      cbk(wrapper)
    }

    this.on('vorpal_command_cancel', self.cancelCommands)

    // Gracefully handles all instances of the command completing.
    this._commandSetCallback = () => {
      const err = response.error
      const data = response.data
      const argus = response.args
      if (err) {
        let stack
        if (data && data.stack) {
          stack = data.stack
        } else if (err && err.stack) {
          stack = err.stack
        } else {
          stack = err
        }
        self.log(stack)
        self.parent.emit('client_command_error', { command: wrapper.command, error: err })
      } else {
        self.parent.emit('client_command_executed', { command: wrapper.command })
      }

      self.removeListener('vorpal_command_cancel', self.cancelCommands)
      self.cancelCommands = undefined
      cbk(wrapper, err, data, argus)
      sendDones(commandInstance)
    }

    function onCompletion (wrapperInner, err, data?, argus?) {
      response = {
        error: err,
        data,
        args: argus,
      }
      self.completeCommand()
    }

    let valid
    if (typeof wrapper.validate === 'function') {
      try {
        valid = wrapper.validate.call(commandInstance, wrapper.args)
      } catch (e) {
        // Complete with error on validation error
        onCompletion(wrapper, e)
        return this
      }
    }

    if (valid !== true && valid !== undefined) {
      onCompletion(wrapper, valid || null)
      return this
    }

    if (wrapper.args && typeof wrapper.args === 'object') {
      wrapper.args.rawCommand = wrapper.command
    }

    // Call the root command.
    res = wrapper.fn.call(commandInstance, wrapper.args, function (...argus) {
      onCompletion(wrapper, argus[0], argus[1], argus)
    })

    // If the command as declared by the user
    // returns a promise, handle accordingly.
    if (res && (typeof res.then === 'function')) {
      res
        .then(function (data) {
          onCompletion(wrapper, undefined, data)
          return undefined
        })
        .catch(function (err) {
          onCompletion(wrapper, true, err)
        })
    }

    return this
  }

  /**
   * Adds on a command or sub-command in progress.
   * Session keeps tracked of commands,
   * and as soon as all commands have been
   * compelted, the session returns the entire
   * command set as complete.
   *
   * @return {session}
   * @api public
   */
  public registerCommand () {
    this._registeredCommands = this._registeredCommands || 0
    this._registeredCommands++
    return this
  }

  /**
   * Marks a command or subcommand as having completed.
   * If all commands have completed, calls back
   * to the root command as being done.
   *
   * @return {session}
   * @api public
   */
  public completeCommand () {
    this._completedCommands++
    if (this._registeredCommands <= this._completedCommands) {
      this._registeredCommands = 0
      this._completedCommands = 0
      if (this._commandSetCallback) {
        this._commandSetCallback()
      }
      this._commandSetCallback = undefined
    }
    return this
  }

  /**
   * Generates random GUID for Session ID.
   *
   * @return {GUID}
   * @api private
   */

  public _guid () {
    function s4 () {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
  }

}
