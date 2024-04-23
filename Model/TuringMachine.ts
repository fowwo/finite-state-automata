import Automaton from "./Automaton";
import TuringMachineData from "../Type/TuringMachineData";

export default class TuringMachine extends Automaton {

	/** The symbols allowed on the tape. */
	tapeAlphabet: Set<string>;

	/** The symbol in tape cells which have not been written to. */
	blankSymbol: string | null;

	declare transitions: { [state: number]: { [symbol: string]: [state: number, symbol: string | null, move: string] }; };

	constructor({ alphabet, tapeAlphabet = [], blankSymbol = null, states, startState, finalStates, transitions }: TuringMachineData = {}) {
		super({ alphabet, states, startState, finalStates, transitions });
		this.tapeAlphabet = new Set(tapeAlphabet);
		this.blankSymbol = blankSymbol;
	}

	/**
	 * @param {String} string - The input string.
	 * @param {Number} [stepLimit] - The maximum number of transitions to take.
	 * @returns {{ state: Number | null, tape: { [index: Number]: String }, head: Number, halt: Boolean }}
	 * 	An object containing the resulting state, tape, tape head position, and whether the automaton halted within the step limit.
	 */
	run(string: string, stepLimit?: number): { state: number | null; tape: { [index: number]: string; }; head: number; halt: boolean; } {
		let state = this.startState;
		let tape: { [index: number]: string } = { ...string.split("") };
		let head = 0;
		if (state === null) return { state: null, tape, head, halt: true };

		// Run the automaton for `stepLimit` steps (if specified).
		for (let i = 0; i !== stepLimit; i++) {
			const previousState = state;
			({ state, head } = this.step(state, tape, head));
			if (state === null) return { state: previousState, tape, head, halt: true };
		}

		// If there is no valid transitions after reaching the step limit, the automaton has halted.
		const tapeCopy = { ...tape };
		const nextState = this.step(state, tapeCopy, head).state;
		return { state, tape, head, halt: nextState === null };
	}

	/**
	 * @param {Number} state - The state to transition from.
	 * @param {{ [index: Number]: String }} tape - The tape.
	 * @param {Number} head - The position of the tape head.
	 * @returns {{ state: Number | null, head: Number }} An object containing the next state and tape head position.
	 */
	step(state: number, tape: { [index: number]: string | null; }, head: number): { state: number | null; head: number; } {
		const symbol = head in tape ? tape[head] : this.blankSymbol;
		const transition = this.transitions[state]?.[symbol ?? "null"];
		if (!transition) return { state: null, head };

		const [ nextState, newSymbol, direction ] = transition;
		if (newSymbol === this.blankSymbol) {
			delete tape[head];
		} else {
			tape[head] = newSymbol;
		}
		switch (direction) {
			case "L":
			case "l":
				head--;
				break;
			case "R":
			case "r":
				head++;
				break;
		}
		return { state: nextState, head };
	}

	/** @param stepLimit - The maximum number of transitions to take. */
	accepts(string: string, stepLimit?: number): boolean {
		const { state, halt } = this.run(string, stepLimit);
		return halt && state !== null && this.finalStates.has(state);
	}

	/**
	 * Determines whether a string is not in the language.
	 * 
	 * If the input string does not halt within the step limit (if specified),
	 * this method will return `false`.
	 */
	rejects(string: string, stepLimit?: number): boolean {
		const { state, halt } = this.run(string, stepLimit);
		return halt && !(state !== null && this.finalStates.has(state));
	}

	removeState(state: number): void {
		throw new Error("Method not implemented.");
	}
}

/**
 * Returns the tape in string form.
 * 
 * Any blank symbols in between written tape cells are converted to spaces.
 */
export function tapeToString(tape: { [index: number]: string | null }) {
	const indices = Object.keys(tape).map(Number);
	if (indices.length === 0) return "";

	const [ min, max ] = indices.reduce(([ min, max ], i) => [ Math.min(min, i), Math.max(max, i) ], [ indices[0], indices[0] ]);
	let string = "";
	for (let i = min; i <= max; i++) {
		string += i in tape ? tape[i] : " ";
	}
	return string;
}