import { Command, Arg } from '../command'

import { CommandInstance } from '../command-instance'

export type ArgTypes = {
  [P in 'string' | 'boolean']: unknown;
};

type ParseFn = (str: string, args: string | CommandArgs) => string;
type ValidateFn = (instance: CommandInstance, args: CommandArgs) => string;
type CancelFn = (instance: CommandInstance) => void;
type FnFn = (args: Arg[], onComplete: (err?: Error) => void) => void;

// The entire command, with arguments and options, entered in the command line
export type InputCommand = string;

export interface MMatchParts<T extends CommandArgs | string> {
  args: T;
  command?: Command;
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
  match?: Command;
  matchArgs: string | CommandArgs;
  pipes: string[];
};
