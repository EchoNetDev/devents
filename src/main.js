import Web3 from "web3"
import {newKitFromWeb3} from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"
import {cUSDContractAddress, ERC20_DECIMALS, MPContractAddress} from "./utils/constants";


let kit
let contract
let products = []

let editIndex = 0

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

    await cUSDContract.methods
        .approve(MPContractAddress, _price)
        .send({from: kit.defaultAccount})
  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getProducts = async function() {
  const _productsLength = await contract.methods.getEventsLength().call()
  const _products = []
  for (let i = 0; i <= _productsLength-1; i++) {
      let _product = new Promise(async (resolve) => {
          let p = await contract.methods.getEvent(i).call()
          resolve({
              index: i,
              creator: p[0],
              title: p[1],
              image: p[2],
              description: p[3],
              location: p[4],
              time: p[5],
              price: new BigNumber(p[6])
      })
    })
    _products.push(_product)
  }
  products = await Promise.all(_products)
  renderProducts()
  renderBanner()
}

async function renderProducts() {
  document.getElementById("marketplace").innerHTML = ""
  const tmp = products.slice()
  tmp.pop()
  var d1 = new Date();
  const parsed = Date.parse(d1);
  tmp.forEach(async (_product) => {
    const newDiv = document.createElement("div")
    const _attendees = await contract.methods.getAttendees(_product.index).call()
    newDiv.className = "col-md-4"
    if(_product.creator == kit.defaultAccount){
        newDiv.innerHTML = ownProductTemplate(_product, _attendees.length)
    }
    else if (parsed > Date.parse(_product.time)){
        newDiv.innerHTML = pastProductTemplate(_product, _attendees.length)
    }
    else if (!_attendees.includes(kit.defaultAccount)) {
        newDiv.innerHTML = productTemplate(_product, _attendees.length)
    }
    else {
        newDiv.innerHTML = attendProductTemplate(_product, _attendees.length)
    }
    document.getElementById("marketplace").appendChild(newDiv)
  })
}

async function renderBanner() {
    const _productsLength = await contract.methods.getEventsLength().call()
    const bannerEvent = await contract.methods.getEvent(_productsLength-1).call()

    const _event = {
        index: _productsLength-1,
        creator: bannerEvent[0],
        title: bannerEvent[1],
        image: bannerEvent[2],
        description: bannerEvent[3],
        location: bannerEvent[4],
        time: bannerEvent[5],
        price: new BigNumber(bannerEvent[6])
    };


    document.getElementById("banner-title").innerText = _event.title;
    document.getElementById("banner-desc").innerText = _event.description;
    document.getElementById("banner-info").innerText = _event.location + " / " + _event.time;
    document.getElementById("banner-image").src = _event.image;
    document.getElementsByClassName("attend")[0].id = _productsLength - 1;
    document.getElementsByClassName("attend")[0].innerText = "";

    const _attendees = await contract.methods.getAttendees(_event.index).call()

    var d1 = new Date();
    const parsed = Date.parse(d1);

    if(_event.creator == kit.defaultAccount){
        document.getElementsByClassName("attend")[0].innerHTML = `
        <a class="btn btn-lg btn-outline-light editBtn fs-6 p-3" data-bs-toggle="modal" data-bs-target="#addModal" id=${
            _event.index
        }>
            Edit
        </a>
        `
    }
    else if (parsed > Date.parse(_event.time)) {
        document.getElementsByClassName("attend")[0].innerHTML = `
        <button disabled class="btn btn-lg btn-outline-light fs-6 p-3" id=${
            _product.index
        }>
            Past Event
        </button>
        `
    }
    else if (_attendees.includes(kit.defaultAccount)) {
        document.getElementsByClassName("attend")[0].innerHTML = `
        <a data-bs-toggle="modal" data-bs-target="#viewModal" class="btn btn-lg btn-outline-light viewBtn fs-6 p-3" id=${
            _event.index
          }>
            View Attendees
          </a>
          `
    }
    else {
        document.getElementsByClassName("attend")[0].innerHTML = `
        <a class="btn btn-lg btn-outline-light buyBtn fs-6 p-3" id=${
            _event.index
          }>
            Attend for ${_event.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD
          </a>
          `
    }
}

function productTemplate(_product, _number) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_product.image}" alt="...">
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        ${_number} Attendees
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_product.creator)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_product.title}</h2>
        <p class="card-text mb-4" style="min-height: 82px">
          ${_product.description}             
        </p>
        <p class="card-text mt-4">
          <i class="bi bi-geo-alt-fill"></i>
          <span>${_product.location} / ${_product.time}</span>
        </p>
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-light buyBtn fs-6 p-3" id=${
            _product.index
          }>
            Attend for ${_product.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD
          </a>
        </div>
      </div>
    </div>
  `
}

function pastProductTemplate(_product, _number) {
    return `
        <div class="card mb-4">
        <img class="card-img-top" src="${_product.image}" alt="...">
        <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
            ${_number} Attendees
        </div>
        <div class="card-body text-left p-4 position-relative">
            <div class="translate-middle-y position-absolute top-0">
            ${identiconTemplate(_product.creator)}
            </div>
            <h2 class="card-title fs-4 fw-bold mt-2">${_product.title}</h2>
            <p class="card-text mb-4" style="min-height: 82px">
            ${_product.description}             
            </p>
            <p class="card-text mt-4">
            <i class="bi bi-geo-alt-fill"></i>
            <span>${_product.location} / ${_product.time}</span>
            </p>
            <div class="d-grid gap-2">
            <button disabled class="btn btn-lg btn-outline-light fs-6 p-3" id=${
                _product.index
            }>
                Past Event
            </button>
            </div>
        </div>
        </div>
    `
}

function ownProductTemplate(_product, _number) {
    return `
        <div class="card mb-4">
        <img class="card-img-top" src="${_product.image}" alt="...">
        <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
            ${_number} Attendees
        </div>
        <div class="card-body text-left p-4 position-relative">
            <div class="translate-middle-y position-absolute top-0">
            ${identiconTemplate(_product.creator)}
            </div>
            <h2 class="card-title fs-4 fw-bold mt-2">${_product.title}</h2>
            <p class="card-text mb-4" style="min-height: 82px">
            ${_product.description}             
            </p>
            <p class="card-text mt-4">
            <i class="bi bi-geo-alt-fill"></i>
            <span>${_product.location} / ${_product.time}</span>
            </p>
            <div class="d-grid gap-2">
            <a class="btn btn-lg btn-outline-light editBtn fs-6 p-3" data-bs-toggle="modal" data-bs-target="#addModal" id=${
                _product.index
            }>
                Edit
            </a>
            </div>
        </div>
        </div>
    `
}

function attendProductTemplate(_product, _number) {
    return `
      <div class="card mb-4">
        <img class="card-img-top" src="${_product.image}" alt="...">
        <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
          ${_number} Attendees
        </div>
        <div class="card-body text-left p-4 position-relative">
          <div class="translate-middle-y position-absolute top-0">
          ${identiconTemplate(_product.creator)}
          </div>
          <h2 class="card-title fs-4 fw-bold mt-2">${_product.title}</h2>
          <p class="card-text mb-4" style="min-height: 82px">
            ${_product.description}             
          </p>
          <p class="card-text mt-4">
            <i class="bi bi-geo-alt-fill"></i>
            <span>${_product.location} / ${_product.time}</span>
          </p>
          <div class="d-grid gap-2">
            <a data-bs-toggle="modal" data-bs-target="#viewModal" class="btn btn-lg btn-outline-light viewBtn fs-6 p-3" id=${
              _product.index
            }>
              View Attendees
            </a>
          </div>
        </div>
      </div>
    `
  }

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProducts()
  notificationOff()
});

document
    .querySelector("#newProductBtn")
    .addEventListener("click", async () => {
        const params = [
            document.getElementById("newProductName").value,
            document.getElementById("newImgUrl").value,
            document.getElementById("newProductDescription").value,
            document.getElementById("newLocation").value,
            document.getElementById("newTime").value,
            new BigNumber(document.getElementById("newPrice").value)
                .shiftedBy(ERC20_DECIMALS)
                .toString()
        ]
    notification(`⌛ Adding ...`)
    try {
        await contract.methods
            .createEvent(...params)
            .send({from: kit.defaultAccount})
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added it.`)
    getProducts()
  })


document.querySelector("#editProductBtn").addEventListener("click", async () => {
    const params = [
        editIndex,
        document.getElementById("newProductName").value,
        document.getElementById("newImgUrl").value,
        document.getElementById("newProductDescription").value,
        document.getElementById("newLocation").value,
        document.getElementById("newTime").value,
        new BigNumber(document.getElementById("newPrice").value)
            .shiftedBy(ERC20_DECIMALS)
            .toString()
      ]
      notification(`⌛ Editing ...`)
      try {
          await contract.methods
              .editEvent(...params)
              .send({from: kit.defaultAccount})
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
      notification(`🎉 You successfully edited it.`)
      getProducts()
})

document.querySelector("#market").addEventListener("click", async (e) => {
  if (e.target.className.includes("buyBtn")) {
    const index = e.target.id
    notification("⌛ Waiting for payment approval...")
    try {
      await approve(products[index].price)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting for payment...`)
    try {
        await contract.methods
            .attendEvent(index)
            .send({from: kit.defaultAccount})
        notification(`🎉 You successfully reserved it.`)
      getProducts()
      getBalance()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
  if (e.target.className.includes("editBtn")) {

    const event = await contract.methods.getEvent(e.target.id).call()

    editIndex = e.target.id;

    document.getElementById("newProductModalLabel").innerText = "Edit Event"
    document.getElementById("newProductName").value = event[1]
    document.getElementById("newImgUrl").value = event[2]
    document.getElementById("newProductDescription").value = event[3]
    document.getElementById("newLocation").value = event[4]
    document.getElementById("newTime").value = event[5]
    document.getElementById("newPrice").value = new BigNumber(event[6])
    .shiftedBy(-ERC20_DECIMALS)
    .toString()

    document.getElementById( 'newProductBtn' ).style.display = 'none';
    document.getElementById( 'editProductBtn' ).style.display = 'block';
  }
  if (e.target.className.includes("viewBtn")) {
      const _attendees = await contract.methods.getAttendees(e.target.id).call();
      document.getElementById("attendees-list").innerHTML = ""

      _attendees.forEach(async (_attendant) => {
          const tmpDiv = document.createElement("div")
          tmpDiv.innerHTML = `
            <div>${identiconTemplate(_attendant)} ${_attendant}</div>
          `
          document.getElementById("attendees-list").appendChild(tmpDiv);
      })
  }
})

document.querySelector("#add").addEventListener("click", async () => {

    document.getElementById("newProductModalLabel").innerText = "Add Event"
    document.getElementById("newProductName").value = ""
    document.getElementById("newImgUrl").value = ""
    document.getElementById("newProductDescription").value = ""
    document.getElementById("newLocation").value = ""
    document.getElementById("newTime").value = ""
    document.getElementById("newPrice").value = ""

    document.getElementById('newProductBtn').style.display = 'block';
    document.getElementById( 'editProductBtn' ).style.display = 'none';
})