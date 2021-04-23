const evaluator = new Evaluator();
evaluator.setVariable("pi", 3.14159);
evaluator.setVariable("e", 2.717);

function eval() {
	const expression = document.getElementById("field").value;
	const result = evaluator.evaluate(expression);
	const result_element = document.getElementById("result");
	result_element.innerHTML = (result)?result:"error";
}
