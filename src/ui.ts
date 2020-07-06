import { EventEmitter } from 'events'

export class UI extends EventEmitter {

  public _pipeFn: any;
  private _log: (...args) => void;
  // FIXME §here: more to add

  /**
   * Sets intial variables and registers
   * listeners. This is called once in a
   * process thread regardless of how many
   * instances of Vorpal have been generated.
   *
   * @api private
   */
  constructor () {
    super()

    // Middleware for piping stdout through.
    this._pipeFn = undefined

    // custom logger disabled for test
    this._log = process.env.NODE_ENV === 'test' ? () => {} : console.info.bind(console)
  }

  /**
   * Receives and runs logging through
   * a piped function is one is provided
   * through ui.pipe(). Pauses any active
   * prompts, logs the data and then if
   * paused, resumes the prompt.
   *
   * @return {UI}
   * @api public
   */

  public log (...args) {
    args = typeof this._pipeFn === 'function'
      ? this._pipeFn(args)
      : args
    if (args.length === 0 || args[0] === '') {
      return this
    }
    this._log(...args)
    return this
  }

}

/**
 * Initialize singleton.
 */

export default UI
