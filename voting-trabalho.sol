pragma solidity >=0.4.22 <0.6.0;

contract Ballot {
    struct Voter {
        uint256 weight; // weight is accumulated by delegation
        bool voted; // if true, that person already voted
        address delegate; // person delegated to
        uint256 vote; // index of the voted proposal
        bytes32 name; // short voter name
    }

    struct Proposal {
        bytes32 name; // short name (up to 32 bytes)
        uint256 voteCount; // number of accumulated votes
    }

    address public chairperson;

    mapping(address => Voter) public voters;
    mapping(uint256 => address) public holders;
    uint256 public votersCount;
    bool public overElection;

    Proposal[] public proposals;

    constructor() public {
        bytes32[3] memory proposalNames = [
            bytes32("Galão da massa"),
            bytes32("Galo"),
            bytes32("Atletico-MG")
        ];
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        votersCount = 1;

        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function _getVoters()
        public
        view
        returns (
            address[] memory,
            bool[] memory,
            address[] memory
        )
    {
        address[] memory votersAddresses = new address[](votersCount);
        bool[] memory votersDidVoted = new bool[](votersCount);
        address[] memory votersDidDelegated = new address[](votersCount);

        for (uint256 i = 0; i < votersCount; i++) {
            Voter storage voter = voters[holders[i]];
            votersAddresses[i] = holders[i];
            votersDidVoted[i] = voter.voted;
            votersDidDelegated[i] = voter.delegate;
        }
        return (votersAddresses, votersDidVoted, votersDidDelegated);
    }

    function giveRightToVote(address voter, string memory voterName) public {
        require(!overElection, "The election finished.");
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require(!voters[voter].voted, "The voter already voted.");
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
        voters[voter].name = stringToBytes32(voterName);
        holders[votersCount] = voter;
        votersCount += 1;
    }

    function delegate(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!overElection, "The election finished.");
        require(!sender.voted, "You already voted.");
        require(sender.weight > 0, "You can not vote!");

        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            require(to != msg.sender, "Found loop in delegation.");
        }

        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }
    }

    function vote(uint256 proposal) public {
        Voter storage sender = voters[msg.sender];
        require(!overElection, "The election finished.");
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "You already voted.");
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
        sender.weight = 0;
    }

    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningVoteCount = 0;
        for (uint256 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() public view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }

    function getProposalsCount() public view returns (uint256 qtd) {
        qtd = proposals.length;
    }

    function getProposal(uint256 index)
        public
        view
        returns (bytes32 name, uint256 voteCount)
    {
        name = proposals[index].name;
        voteCount = proposals[index].voteCount;
    }

    function endElection() public returns (bytes32 winnerName_) {
        overElection = true;
        winnerName_ = winnerName();
    }

    function stringToBytes32(string memory source)
        public
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
}
