import { EventEmitter } from 'events'
import { Arg } from '../command'
import Option from '../option'

import { Vorpal } from '../vorpal'

export type ArgTypes = {
  [P in 'string' | 'boolean']: unknown;
};

type ParseFn = (str: string, args: string | CommandArgs) => string;
type ValidateFn = (instance: IcommandInstance, args: CommandArgs) => string;
type CancelFn = (instance: IcommandInstance) => void;
type FnFn = (args: Arg[], onComplete: (err?: Error) => void) => void;

export interface CCommand extends EventEmitter {
  commands: CCommand[];
  options: Option[];
  parent: Vorpal;
  _name: string;
  _types: ArgTypes;
  _parse: ParseFn;
  _validate: ValidateFn;
  _cancel: CancelFn;
  _fn: FnFn;
  _init: () => void;
  _mode: boolean;
  _args: Arg[];
  _catch: Function;
  _hidden: boolean;
  _help: Function;
  _aliases: string[];
  _allowUnknownOptions: boolean;
  _delimiter: string;
  option(flags, description, autocomplete?): CCommand;
  action(fn): CCommand;
  use(fn): CCommand;
  validate(fn): CCommand;

  cancel(fn: CancelFn): CCommand;
  done(fn);
  init(fn): CCommand;
  delimiter(delimiter);
  types(types);
  alias(...aliases): CCommand;
  description(str): CCommand;
  remove();
  arguments(desc);
  helpInformation();
  hidden();
  allowUnknownOptions(allowUnknownOptions);
  usage(str?): CCommand;
  optionHelp();
  help(fn);
  parse: (fn: ParseFn) => CCommand;
  after(fn): CCommand;
}

export interface IcommandInstance {
  commandWrapper?: any;
  args?: CommandArgs;
  commandObject?: CCommand;
  command?: any;
  callback?: any;
  downstream?: IcommandInstance;
}

// The entire command, with arguments and options, entered in the command line
export type InputCommand = string;

export interface MMatchParts<T extends CommandArgs | string> {
  args: T;
  command?: CCommand;
}

export type CommandArgs = {
  [arg: string]: string | string[];
} & CommandArgsOptions;

interface CommandArgsOptions {
  options: {
    [arg: string]: string | number | boolean;
  };
}

export type IParsedCommand = {
  command: InputCommand;
  match?: CCommand;
  matchArgs: string | CommandArgs;
  pipes: string[];
};
