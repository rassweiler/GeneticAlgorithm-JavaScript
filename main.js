//Setup input defaults when page loads
document.addEventListener('DOMContentLoaded', function() {
    $("#targetTextInput").val("Welcome to the Shopify team!");
    $("#mutationRateInput").val(0.01);
    $("#populationSizeInput").val(1000);
}, false);

//Global variables
var cancelScript = false;
var scriptCompleted = false;
var gotHighestFitness = false;
var matingPoolFilled = false;
var cycleComplete = false;
var hfIndex = 0;
var sTargetText;
var fMutationRate;
var iPopulationSize;
var iGeneration = 1;
var aMatingPool = [];
var aPopulation =[];
var aPopulationFitness = [];
var aFitnessHistory =[];
var fHighestFitness = 0.0;

//Bool function determine if number is a number and if its an int
function IsInt(number){
	return Number(number) === number && number % 1 === 0;
}

//Bool function determine if number is a number and if its a float
function IsFloat(number){
	return Number(number) === number && number % 1 !== 0;
}

//Random int, inclusive both min and max, from MDC page: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function GetRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Set script completed if highest fitness is 100%
function SetScriptCompleted(){
	if(!cancelScript && !scriptCompleted){
		if(fHighestFitness == 1.0 || fHighestFitness == 0){
			scriptCompleted = true;
			EnableInput();
			document.getElementById('alertHeader').innerHTML = "Script Completed...";
		}
	}
}

//Fill the gene pool based on fitness
function SetGenePool(){
	if(!cancelScript && !scriptCompleted){
		if(aPopulation.length == iPopulationSize && fHighestFitness > 0){
			for(var index = 0; index < iPopulationSize; ++index){
				var numberTimes = Math.round(aPopulationFitness[index]*100);
				for(var nIndex = 0; nIndex < numberTimes; ++nIndex){
					aMatingPool.push(aPopulation[index]);
				}
			}
			aPopulation=[];
			matingPoolFilled = true;
		}else{
			setTimeout(SetGenePool, 100);
		}
	}
}

//Set highest fitness based on current population pool
function SetHighestFitness(){
	if(!cancelScript && !scriptCompleted){
		if(!gotHighestFitness){
			if(aPopulation.length == iPopulationSize){
				var fHFitness = 0.0;
				var iHIndex = 0;
				for(var index = 0; index < iPopulationSize; ++index){
					var score = 0;
					for(var tIndex = 0; tIndex < sTargetText.length; ++tIndex){
						var targetChar = sTargetText[tIndex];
						var geneChar = aPopulation[index][tIndex];
						if(targetChar == geneChar){
							score +=1;
						}
					}
					var tempFitness = score/sTargetText.length;
					aPopulationFitness[index] = tempFitness;
					if(tempFitness >= fHFitness){
						fHFitness = tempFitness;
						iHIndex = index;
					}
				}
				$('#fitnessRow').html(fHFitness.toFixed(3)*100+"%");
				$('#geneRow').html(aPopulation[iHIndex].join(""));
				fHighestFitness = fHFitness;
				aFitnessHistory.push(fHFitness.toFixed(3)*100);
				gotHighestFitness = true;
			}
		}
	}
}

//Set highest fitness based on current population pool
function CreateULFromHistory(){
	if(!cancelScript && !scriptCompleted){
		if(aFitnessHistory.length > 0){
			document.getElementById('alertHeader').innerHTML = "Creating list of population...";

			// Create the list element:
			var list = document.createElement('ol');
			list.setAttribute('id','historyList');

			for(var index = 0; index < aFitnessHistory.length; ++index) {
				// Create the list item:
				var item = document.createElement('li');

				// Set its contents:
				item.appendChild(document.createTextNode(aFitnessHistory[index]));

				// Add it to the list:
				list.appendChild(item);
			}
			$("#historyList").remove();
			// Finally, return the constructed list:
			document.getElementById('historyListDiv').appendChild(list);
		}else{
			setTimeout(CreateULFromHistory, 100);
		}
	}
}

//Set target text
function SetTargetText(){
	sTargetText = $('#targetTextInput').val(); //Value to used when calculated fitness, unsanitized
	if(sTargetText == ""){
		$('#targetStringDiv').html("Target cannot be blank!");
		return false;
	}else{
		$('#targetStringDiv').html(sTargetText);
		return true;
	}
}

//Set Mutation rate
function SetMutationRate(){
	fMutationRate = document.getElementById('mutationRateInput').value;
	if(fMutationRate != ""){
		try{
			fMutationRate = Number(fMutationRate);
			if(!IsFloat(fMutationRate) || fMutationRate > 1 || fMutationRate <= 0){
				document.getElementById('mutationChanceDiv').innerHTML = "Mutation rate must be a float > 0 and <= 1";
				return false;
			}else{
				document.getElementById('mutationChanceDiv').innerHTML = fMutationRate;
				return true;
			}
		}catch(err){
			document.getElementById('alertHeader').innerHTML = "Unable to convert mutation rate to number: "+err.message;
			return false;
		}
	}else{
		document.getElementById('mutationChanceDiv').innerHTML = "Mutation rate cannot be blank!";
		return false;
	}
}

//Set population size
function SetPopulationSize(){
	iPopulationSize = document.getElementById('populationSizeInput').value;
	if(iPopulationSize !== ""){
		try{
			iPopulationSize = Number(iPopulationSize);
			if(!IsInt(iPopulationSize) || iPopulationSize <= 0){
				document.getElementById('populationSizeDiv').innerHTML = "Population size must be an integer greater than 0";
				return false;
			}else{
				document.getElementById('populationSizeDiv').innerHTML = iPopulationSize;
				return true;
			}
		}catch(err){
			document.getElementById('alertHeader').innerHTML = "Unable to convert mutation rate to number: "+err.message;
			return false;
		}
	}else{
		document.getElementById('populationSizeDiv').innerHTML = "Population size cannot be blank!";
		return false;
	}
}

function SetGeneration(){
	if(!cancelScript && !scriptCompleted){
		$('#generationRow').html(iGeneration);
	}
}

//Build list from aPopulation
function CreateULFromPopulation() {
	if(!cancelScript && !scriptCompleted){
		if(aPopulation.length == iPopulationSize){
			document.getElementById('alertHeader').innerHTML = "Creating list of population...";

			// Create the list element:
			var list = document.createElement('ol');
			list.setAttribute('id','populationList');

			for(var index = 0; index < aPopulation.length; ++index) {
				// Create the list item:
				var item = document.createElement('li');

				var string = aPopulation[index].join("");
				// Set its contents:
				item.appendChild(document.createTextNode(string));

				// Add it to the list:
				list.appendChild(item);
			}
			$('#populationList').remove();
			// Finally, return the constructed list:
			document.getElementById('populationListDiv').appendChild(list);
		}else{
			setTimeout(CreateULFromPopulation, 100);
		}
	}
}

//Build list from aMatingPool
function CreateULFromMatingPool() {
	if(!cancelScript && !scriptCompleted){
		if(matingPoolFilled && aMatingPool.length > 0){
			document.getElementById('alertHeader').innerHTML = "Creating list of mates...";

			// Create the list element:
			var list = document.createElement('ul');
			list.setAttribute('id','mateList');

			for(var index = 0; index < aMatingPool.length; ++index) {
				// Create the list item:
				var item = document.createElement('li');

				// Set its contents:
				item.appendChild(document.createTextNode(aMatingPool[index].join("")));

				// Add it to the list:
				list.appendChild(item);
			}
			$('#mateList').remove();
			// Finally, return the constructed list:
			document.getElementById('mateListDiv').appendChild(list);
		}else{
			setTimeout(CreateULFromMatingPool, 100);
		}
	}
}

function SetPopulation(){
	if(!cancelScript && !scriptCompleted){
		if(matingPoolFilled && aMatingPool.length > 0){
			if(aPopulation.length < iPopulationSize){
				document.getElementById('alertHeader').innerHTML = "Building population...";
				var iGeneLength = sTargetText.length;
				if(IsInt(iGeneLength) && iGeneLength > 0){
					var aGene = new Array(iGeneLength);
					var p1 = aMatingPool[GetRandomInt(0, aMatingPool.length-1)];
					var p2 = aMatingPool[GetRandomInt(0, aMatingPool.length-1)];
					while(p1 == p2){
						p2 = aMatingPool[GetRandomInt(0, aMatingPool.length-1)];
					}
					for(var index = 0; index < iGeneLength; ++index){
						var parent = GetRandomInt(0, 1);

						if(parent == 1){
							aGene[index] = p1[index];
						}else{
							aGene[index] = p2[index];
						}
					}
					aPopulation[hfIndex] = aGene;
					++hfIndex;
				}
				setTimeout(SetPopulation, 0);
			}else{
				hfIndex = 0;
				matingPoolFilled = false;
				cycleComplete = true;
				aMatingPool = [];
				MutatePopulation();
			}
		}
	}
}

function MutatePopulation(){
	if(!cancelScript && !scriptCompleted){
		if(!matingPoolFilled && aMatingPool.length == 0){
			if(!cycleComplete && hfIndex < iPopulationSize){
				document.getElementById('alertHeader').innerHTML = "Mutating population...";
				var iGeneLength = sTargetText.length;
				for(var index = 0; index < iGeneLength; ++index){
					var mutate = Math.random();
					if(mutate < fMutationRate){
						var randomChar = GetRandomInt(32, 128);
						randomChar = String.fromCharCode(randomChar);
						aPopulation[hfIndex][index] = randomChar;
					}
				}
				setTimeout(MutatePopulation, 0);
			}else{
				cycleComplete = true;
			}
		}
	}
}

//Add a new random sequence to the population pool
function AddRandomToPopulation(){
	if(!cancelScript && !scriptCompleted && aPopulation.length < iPopulationSize){
		document.getElementById('alertHeader').innerHTML = "Building initial population...";
		var iGeneLength = sTargetText.length;
		if(IsInt(iGeneLength) && iGeneLength > 0){
			var aGene = new Array(iGeneLength);
			for(var index = 0; index < iGeneLength; ++index){

				//Random int in character range
				var randomChar = GetRandomInt(32, 128);

				//Convert to character
				randomChar = String.fromCharCode(randomChar);

				//Assign to gene
				aGene[index] = randomChar;
			}
			aPopulation.push(aGene);
		}
		setTimeout(AddRandomToPopulation, 0);
	}
}

//When the cancel button is pressed
function CancelAlgorithm(){
	cancelScript = true;
	document.getElementById('alertHeader').innerHTML = "Cancelled script...";
	setTimeout(ResetScript, 0);
}

function ResetScript(){
	cancelScript = false;
	scriptCompleted = false;
	matingPoolFilled = false;
	gotHighestFitness = false;
	cycleComplete = false;
	aPopulation = []; //Clear population array
	aMatingPool = []; //Clear mating pool array
	aPopulationFitness = [];
	aFitnessHistory =[];
	sTargetText = "";
	fMutationRate = 0.0;
	iPopulationSize = 0;
	iGeneration = 0;
	fHighestFitness = 0.0;
	document.getElementById('targetStringDiv').innerHTML = "";
	document.getElementById('mutationChanceDiv').innerHTML = "";
	document.getElementById('populationSizeDiv').innerHTML = "";
	EnableInput();
	$('#populationList').remove(); //Remove old population list if present
	$('#mateList').remove(); //Remove old population list if present
	$('#historyList').remove(); //Remove history list
	$('#generationRow').html("");
	$('#fitnessRow').html("");
	$('#geneRow').html("");
}

function EnableInput(){
	document.getElementById("runScriptButton").disabled = false; //Enable button when finished
	document.getElementById("targetTextInput").disabled = false; //Enable Target when finished
	document.getElementById("mutationRateInput").disabled = false; //Enable Mutation when finished
	document.getElementById("populationSizeInput").disabled = false; //Enable Population when finished
	document.getElementById("cancelScriptButton").style.visibility = 'hidden'; //Hide cancel button when finished
}

function CycleOfLife(){
	if(!cancelScript && !scriptCompleted){
		if(aPopulation.length == iPopulationSize){
			if(cycleComplete){
				++iGeneration;
				cycleComplete = false;
				gotHighestFitness = false;
			}else{
				SetGeneration();
				CreateULFromPopulation();
				SetHighestFitness();
				CreateULFromHistory();
				SetGenePool();
				CreateULFromMatingPool();
				SetPopulation();
				SetScriptCompleted();
			}
		}
		setTimeout(CycleOfLife, 1000);
	}
}

function RunAlgorithm(){

	ResetScript();

	//Get and check the target text
	runCode = SetTargetText();

	//Get and check the mutation rate
	runCode = SetMutationRate();

	//Get and check the population size
	runCode = SetPopulationSize();

	if(runCode){
		//Disable all inputs and show the cancel option
		document.getElementById("runScriptButton").disabled = true; //Disable button while running code
		document.getElementById("targetTextInput").disabled = true; //Disable Target while running code
		document.getElementById("mutationRateInput").disabled = true; //Disable Mutation while running code
		document.getElementById("populationSizeInput").disabled = true; //Disable Population while running code
		document.getElementById("cancelScriptButton").style.visibility = 'visible'; //Show cancel button while running code
		AddRandomToPopulation();
		cycleComplete = true;
		CycleOfLife();
	}
}