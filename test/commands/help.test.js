import HelpCommand from "../../src/commands/help";
import { getCommands } from "../../src/commands/executor";

const command = new HelpCommand();

jest.mock("../../src/commands/executor", () => {
  const fakeCommands = {
    bar: {
      description: "the description for the bar command",
      commandOptions: () => ""
    },
    optiony: {
      description: "a command with options",
      commandOptions: () => "-a the all option"
    }
  };

  return {
    getCommands: jest.fn(() => fakeCommands)
  };
});

var outputData = "";

beforeEach(() => {
  outputData = "";
  console["log"] = jest.fn(inputs => (outputData += inputs));
});

afterEach(() => {
  console["log"].mockRestore();
});

describe("unsupported mode", () => {
  it("throws an error when a mode is not supported", () => {
    const cmdOptions = {
      mode: "foo",
      args: ["bar"]
    };

    expect(() => {
      command.execute(cmdOptions);
    }).toThrowError("foo is not supported");
  });
});

/**
 * Validates that the help message captured contains all the expected parts
 */
function validateHelpMessage(helpMesage) {
  // should display a consistent header
  const expectedHeaderParts = [
    "Usage:\n",
    "<command> playerName... [options]\n\n",
    "Available commands are:"
  ];

  for (const headerPart of expectedHeaderParts) {
    expect(helpMesage).toEqual(expect.stringContaining(headerPart));
  }

  // assert commands are listed with their description
  expect(helpMesage).toEqual(expect.stringContaining("bar:"));
  expect(helpMesage).toEqual(
    expect.stringContaining("the description for the bar command")
  );
  expect(helpMesage).toEqual(expect.stringContaining("optiony:"));
  expect(helpMesage).toEqual(expect.stringContaining("a command with options"));
}

describe("cliMode", () => {
  it("lists commands when no args are given", () => {
    const cmdOptions = {
      mode: "cli",
      args: []
    };

    command.execute(cmdOptions);

    validateHelpMessage(outputData);
  });

  it("indicates that the command is invalid when help for an unkown command is requested", () => {
    const cmdOptions = {
      mode: "cli",
      args: ["foo"]
    };

    command.execute(cmdOptions);

    expect(outputData).toEqual(
      expect.stringContaining("foo is not a valid command.\n")
    );
    // should list the generic help message as well
    validateHelpMessage(outputData);
  });

  it("indicates that a command has no options when help is requested for the command", () => {
    const cmdOptions = {
      mode: "cli",
      args: ["bar"]
    };

    command.execute(cmdOptions);

    expect(outputData).toEqual(
      expect.stringContaining("This command has no options.")
    );
  });

  it("indicates options when help is requested for a command with options", () => {
    const cmdOptions = {
      mode: "cli",
      args: ["optiony"]
    };

    command.execute(cmdOptions);

    expect(outputData).toEqual(
      expect.stringContaining("Options for this command are:\n")
    );
    expect(outputData).toEqual(expect.stringContaining("-a the all option"));
  });
});
