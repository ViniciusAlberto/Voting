
const tableElem = document.getElementById("table-body");
const candidateOptions = document.getElementById("candidate-options");
const voteForm = document.getElementById("vote-form");


var proposals = [];
var myAddress;
var eleicao;
const CONTRACT_ADDRESS = "0x86427E348a21e0deEc8A9d5270B8bd958307F3b5";


const ethEnabled = () => {
	if (window.ethereum) {
    		window.web3 = new Web3(window.ethereum);
    		window.ethereum.enable();
    		return true;
  	}
  	return false;
}

const getMyAccounts = accounts => {
	try {
		if (accounts.length == 0) {
			alert("Você não tem contas habilitadas no Metamask!");
		} else {
			myAddress = accounts[0];
			accounts.forEach(async myAddress => {
				// console.log(myAddress + " : " + await window.web3.eth.getBalance(myAddress));
			});
		}
	} catch(error) {
		console.log("Erro ao obter contas...");
	}
};

function giveRightToVote(contractRef)
{
    var address = $('#address').val();
    var name = $('#name').val();

    contractRef
        .methods
        .giveRightToVote(address,name)
        .send({ from: myAddress })
        .on("receipt", () => alert("Direito de voto concedido"));
}

function getCandidatos(contractRef,callback)
{
    //contractRef.methods.getProposalsCount().call().then((count)=>{
    contractRef.methods.getProposalsCount().call(async function (error, count) {
        for (i=0; i<count; i++) {
            await contractRef.methods.getProposal(i).call().then((data)=>{
                var proposal = {
                    name : web3.utils.toUtf8(data[0]),
                    voteCount : data[1]
                };
                proposals.push(proposal);
            });
        }
        if (callback) {
            callback(proposals);
        }

    });
}

function populaCandidatosEleitor(candidatos) {
	candidatos.forEach((candidato, index) => {
		// Creates a row element.

		// Creates an option for each candidate
		const candidateOption = document.createElement("option");
		candidateOption.value = index;
		candidateOption.innerText = candidato.name;
		candidateOptions.appendChild(candidateOption);


        });
}

function populaCandidatosPresidente(candidatos) {
	console.log(candidatos);
	candidatos.forEach((candidato, index) => {

		// Creates a row element.
		const rowElem = document.createElement("tr");

		// Creates a cell element for the name.
		const nameCell = document.createElement("td");
		nameCell.innerText = candidato.name;
		rowElem.appendChild(nameCell);

		// Creates a cell element for the votes.
		const voteCell = document.createElement("td");
		voteCell.id = "vote-" + candidato.name;
		voteCell.innerText = candidato.voteCount;
		rowElem.appendChild(voteCell);

		// Adds the new row to the voting table.
		tableElem.appendChild(rowElem);


        });
}

function getVoters(contractRef)
{
    const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

	contractRef.methods._getVoters().call().then((data)=>{
		for (let i=0; i<data[0].length; i++) {
			var html = '<tr>';
			html+= '<td>' + data[0][i] + '</td>';

			if(data[1][i] === true)
                html+= '<td>Votou</td>';
			else
                html+= '<td>Não Votou</td>';

			if(data[2][i] === NULL_ADDRESS)
                html+= '<td></td>';
			else
                html+= '<td>Sim</td>';


			html+= '</tr>';
			$('#table-body-eleitores').append(html);

		}
	 })
}



$("#btnVote").on('click',function(){
	candidato = $("#candidate-options").children("option:selected").val();

        eleicao.methods.vote(candidato).send({from: myAddress})
	       .on('receipt',function(receipt) {
			//getCandidatos(eleicao, populaCandidatos);
			windows.location.reaload(true);
		})
		.on('error',function(error) {
			console.log(error.message);
               		return;
        	});

});

$("#btnGiveVote").on('click',function(){
	candidato = $("#address").val();

        eleicao.methods.delegate(candidato).send({from: myAddress})
	       .on('receipt',function(receipt) {
			//getCandidatos(eleicao, populaCandidatos);
			windows.location.reload(true);
		})
		.on('error',function(error) {
			console.log(error.message);
               		return;
        	});

});

$("#btnEncerraEleicao").on('click',function(){
	eleicao.methods.endElection().send({from: myAddress})
		.on('receipt', function(receipt) {
			console.log(receipt);
	 	alert("Eleição finalizada.");
 	})
 	.on('error', function(error) {
	 	console.log(error.message);
	 	alert("Não foi possível finalizar a eleição.");
	 });
});

$("#btnGiveVoteRigth").on("click", function() {
    console.log("clicked");
    giveRightToVote(eleicao);
});
