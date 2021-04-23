class Evaluator {
	constructor() {
		this.m_variableList = new Map();
	}

	/* @param{String, Number} */
	setVariable(variableName, value) {
		this.m_variableList.set(variableName, value);
	}
	/* @param{String} */
	removeVariable(variableName) {
		this.m_variableList.delete(variableName);
	}
	/* @param{} */
	getVariableList() {
		return this.m_variableList;
	}

	/* @param{String} */
	evaluate(expression) {
		let filtered_expression = this.filterExpression(expression);

		let components = this.scanExpression(filtered_expression);
		if(!components) return "error";

		components = this.replaceVariable(components);
		if(!components) return "error";

		let scanResults = this.scanComponents(components);
		if(!scanResults) return "error";

		return this.evaluateComponents(scanResults.components, scanResults.operations);
		//return components;
	}

	/* @private */
	/* @param {Array} */
	evaluateComponents(components, operations) {
		let sorted_operations = operations;
		operations.sort((a, b) => {
			return b.score - a.score;
		});

		for(let i=0;i<operations.length;i++) {
			console.log(operations[i]);
			let number_two = components.splice(operations[i].index + 1, 1)[0];
			let number_one = components.splice(operations[i].index - 1, 1)[0];
			let result = this.calculate(operations[i].operation, number_one, number_two);
			operations = operations.map((item) => {
				if(item.index > operations[i].index) {
					item.index -= 2;
					return item;
				}
				return item;
			})
			if(!result) {
				return NaN;
			}
			components[operations[i].index - 1] = result;
		}

		return components[0];
	}
	/* @param{Array} */
	scanComponents(components) {
		let new_components = [];
		let operations = [];
		for(let i=0;i<components.length;i++) {
			if(this.getOperatorScore(components[i])) {

				if(i == 0 || i == components.length - 1) {
					return undefined;
				}
				const previous_component = this.getOperatorScore(components[i - 1]);
				const next_component = this.getOperatorScore(components[i + 1]);
				if(!previous_component && !next_component) {
					operations.push({
						index: new_components.length,
						operation: components[i],
						score: this.getOperatorScore(components[i])
					});
					new_components.push(components[i]);
					continue;
				} else {
					return undefined;
				}
			}
			
			const next = (i == components.length - 1)?undefined:this.getOperatorScore(components[i + 1]);
			new_components.push(components[i]);
			if(!next && i != components.length - 1) {
				operations.push({
					index: new_components.length,
					operation: "*",
					score: this.getOperatorScore("*")
				});
				new_components.push("*");
			}
		}
		return { components: new_components, operations: operations };
	}
	/* @param{Array} */
	replaceVariable(components) {
		let new_component = [];
		for(let component of components) {
			if(typeof(component) == "string") {
				if(component.match(/[a-z]/i)) {
					if(this.m_variableList.has(component)) {
						new_component.push(this.m_variableList.get(component));
						continue;
					} else {
						return undefined;
					}
				}
			}
			new_component.push(component);
		}
		return new_component;
	}
	/* @param{String} */
	scanExpression(expression) {
		let components = [];

		let subexpression = "";
		let parenthesis_counter = 0;

		let variable = "";

		let number = "";
		let number_integer = true;
		for(let i=0;i<expression.length;i++) {
			const character = expression[i];
			const next = (i + 1 < expression.length)?expression[i + 1]:undefined;


			//parenthesis
			if(character == "(") {
				parenthesis_counter ++;
			}
			if(parenthesis_counter > 0) {
				subexpression += character;

				if(character == ")") {
					parenthesis_counter --;
					if(parenthesis_counter == 0) {
						components.push(subexpression);
						subexpression = "";
					}
				}
				if(parenthesis_counter < 0) {
					return undefined;
				}

				continue;
			}

			//store numbers
			const valid_number_part = Boolean(parseInt(character) || (character == "." && number_integer));
			if(valid_number_part) {
				number += character;
				if(character == ".") {
					number_integer = false;
				}

				const next_is_number = Boolean(parseInt(next) || (next == "." && number_integer));
				if(!next_is_number) {
					components.push(parseFloat(number));
					number = "";
					number_integer = true;
				}
				continue;
			}

			//store variables
			const valid_letter = character.match(/[a-z]/i);
			if(valid_letter) {
				variable += character;

				const next_is_letter = (next)?next.match(/[a-z]/i):false;
				if(!next_is_letter) {
					components.push(variable);
					variable = "";
				}
				continue;
			}

			//store operations
			if(this.getOperatorScore(character)) {
				components.push(character);
				continue;
			}


			return undefined;
		}

		if(parenthesis_counter != 0) {
			return undefined;
		}

		return components;
	}

	/* @param{String} */
	filterExpression(expression) {
		let new_expression = "";
		for(let c of expression) {
			if(c != " ") {
				new_expression += c;
			}
		}
		return new_expression;
	}

	/* @param{char} */
	getOperatorScore(operator) {
		switch(operator) {
			case "+":
				return 1;
				break;
			case "-":
				return 1;
				break;
			case "*":
				return 2;
				break;
			case "/":
				return 2;
				break;
			case "^":
				return 3;
				break;
		}
		return undefined;
	}

	/* param{char,number,number} */
	calculate(operation, numberOne, numberTwo) {
		switch(operation) {
			case "+":
				return numberOne + numberTwo;
				break;
			case "-":
				return numberOne - numberTwo;
				break;
			case "*":
				return numberOne * numberTwo;
				break;
			case "/":
				return numberOne / numberTwo;
				break;
			case "^":
				return Math.pow(numberOne, numberTwo);
				break;
		}
	}

}

