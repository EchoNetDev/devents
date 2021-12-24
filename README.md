# Devents
demo: https://echonetdev.github.io/devents/

This dapp, Devents, is a new environment where users can create events, with a title, an image, and info about the event, like the date, the location, and a little description.

When a user uploads an event, he can edit it, and all the other users can see other events, buy an assistance, and when they unlock it, they can see who else assist to the event.

At the top of the page, below the navbar, is a banner where the last event created shows.

## Solidity functions

attendEvent: Adds the address of the buyer to the array of asistants to the event, also, transacts the pay to the crator of the event

createEvent: Registers the new event creator, adding the creator as an asistant, and revicing all the needed information, like the title of the event, an image, a description and more info, like the date and location.

editEvent: Changes the information in a created event, letting the user change any value to his needs.

getAsists: Returns all the events indexes in an array that an especific user will asist by his address.

getAttendees: Returns all the attendees addresses as an array of an especific event by the index of the event.

getEvent: Returns all the information about an event by his index.

getEventsLength: Returns the total number of events.

# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
