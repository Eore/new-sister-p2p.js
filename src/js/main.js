// element binder
let id = x => document.getElementById(x);

let title = document.getElementsByTagName("title")[0];
let mainWrapper = id("main-wrapper");

let listNodesWrapper = id("list-nodes-wrapper");
let listNodes = id("list-nodes");
let joinButton = id("join-button");

let inputWrapper = id("connect-wrapper");
let inputUid = id("input-uid");
let connectButton = id("connect-button");

let listConnected = id("list-connected");

let listVote = id("list-vote");
let voteButton = id("vote-button");

// data mocking
let pilihan = ["Jokowi", "Prabowo", "Tony"];

pilihan.forEach(el => {
  listVote.innerHTML += `<option value="${el}">${el}</option>`;
});

// main app
let { database } = require("./database");
let { peer } = require("./peer");
let { socket } = require("./socket");

let uid = null;

database.open();

voteButton.onclick = () => {
  let pilihan = listVote.value;
  database.addTo("data", { uid, pilihan });
  Object.keys(peer.listPeer).forEach(el => {
    peer.sendMessage(
      el,
      JSON.stringify({ type: "put", data: { uid, pilihan } })
    );
    // peer.sendMessage(el, "miawmiaw");
  });
};

connectButton.onclick = () => {
  uid = inputUid.value;

  socket
    .connect(
      window.location.hostname + ":4444",
      uid
    )
    .then(() => {
      inputWrapper.hidden = true;
      mainWrapper.style.visibility = "visible";
      title.innerHTML = uid;

      console.log("Local ID :", uid);
      socket.ws.onmessage = ({ data }) => {
        let { to, from, type, message, at } = JSON.parse(data);
        switch (type) {
          case "request-list":
            listNodes.innerHTML = "<option disabled>none</option>";
            message.forEach(el => {
              if (el !== uid) {
                listNodes.innerHTML += `<option value="${el}">${el}</option>`;
              }
            });
            break;

          case "offer":
            let offer = JSON.parse(message);
            peer.newPeer(from);
            peer.connectToPeer(from, offer).then(answer => {
              socket.sendMessage(from, "answer", JSON.stringify(answer));
            });

            showData(peer.listPeer, from);
            break;

          case "answer":
            let answer = JSON.parse(message);
            peer.listPeer[from].signal(answer);

            showData(peer.listPeer, from);
            break;

          default:
            console.log("incoming :", message);
            break;
        }
      };
    });
};

joinButton.onclick = () => {
  listNodes.setAttribute("disabled", "true");
  joinButton.setAttribute("disabled", "true");
  peer.newPeer(listNodes.value, true).then(offer => {
    socket.sendMessage(listNodes.value, "offer", JSON.stringify(offer));
  });
};

let showData = (listPeer, id) => {
  listPeer[id].on("data", inData => {
    let { type, data } = JSON.parse(inData.toString());
    console.log(id, ":", { type, data });
    if (type === "put") {
      database.addTo("data", data);
    }
  });

  listPeer[id].on("close", () => {
    showConnected(listPeer, id);
  });

  showConnected(listPeer, id);
};

let showConnected = (listPeer, id) => {
  listConnected.innerHTML = "";

  Object.keys(listPeer).forEach(el => {
    listConnected.innerHTML += `<li>${el}</li>`;
  });
};
