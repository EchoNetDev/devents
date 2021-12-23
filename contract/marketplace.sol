// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Wall {
    uint256 internal eventsLength = 0;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Event {
        address payable creator;
        string title;
        string image;
        string description;
        string location;
        string time;
        uint256 price;
    }

    struct Comment {
        address creator;
        string content;
    }

    mapping(uint256 => Event) internal events;

    mapping(uint256 => address[]) internal attendees;

    mapping(address => uint256[]) internal asists;

    mapping(uint256 => Comment) internal comments;

    function createEvent(
        string memory _title,
        string memory _image,
        string memory _description,
        string memory _location,
        string memory _time,
        uint256 _price
    ) public {
        events[eventsLength] = Event(
            payable(msg.sender),
            _title,
            _image,
            _description,
            _location,
            _time,
            _price
        );
        eventsLength++;
    }

    function editEvent(
        uint256 _index,
        string memory _title,
        string memory _image,
        string memory _description,
        string memory _location,
        string memory _time,
        uint256 _price
    ) public {
        events[_index] = Event(
            payable(msg.sender),
            _title,
            _image,
            _description,
            _location,
            _time,
            _price
        );
    }

    function getEvent(uint256 _index)
        public
        view
        returns (
            address payable,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        return (
            events[_index].creator,
            events[_index].title,
            events[_index].image,
            events[_index].description,
            events[_index].location,
            events[_index].time,
            events[_index].price
        );
    }

    function attendEvent(uint256 _index) public payable {
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                events[_index].creator,
                events[_index].price
            ),
            "Transfer failed."
        );
        attendees[_index].push(msg.sender);
        asists[msg.sender].push(_index);
    }

    function getEventsLength() public view returns (uint256) {
        return (eventsLength);
    }

    function getAttendees(uint256 _index)
        public
        view
        returns (address[] memory)
    {
        return (attendees[_index]);
    }

    function getAsists(address _profile)
        public
        view
        returns (uint256[] memory)
    {
        return (asists[_profile]);
    }
}
